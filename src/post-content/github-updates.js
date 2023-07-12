const { Webhooks, createNodeMiddleware } = require('@octokit/webhooks');
const { Client, Message, MessagePayload, MessageFlags, MessageFlagsBitField, Options, EmbedBuilder } = require('discord.js');
const EventSource = require('eventsource');
const { gitPostChannels } = require('../../config.json');
const { github } = require('./post-config.json')
require('dotenv').config;

/**
 * 
 * @param {Client} client 
 */
module.exports = (client) => {
    const webhooks = new Webhooks({
        secret: process.env.SECRET
    });

    const source = new EventSource("https://smee.io/jUZxWA0aT6oYG46");

    webhooks.onAny( async (event) => {
        await webhooks
          .receive({
            id: event.id,
            name: event.name,
            payload: event.payload
          })
          .catch(console.error);

          console.log(event.name);
          console.log(event.payload);

          if( github.events.find(events => events === event.name) ) {
              if( (!github.actions.find(action => action === event.payload.action) && event.payload.action) ) {
                return;
              }

              const postEmbed = new EmbedBuilder()
                .setAuthor({ name: event.payload.sender.login, iconURL: "", url:event.payload.sender.url})
                
              if(event.name === "repository") {
                postEmbed.setTitle(
                    `[${event.payload.repository.full_name}] Repository has been ${event.payload.action} by ${event.payload.sender.name}`)
                  .setColor('DarkPurple').setURL(event.payload.repository.html_url);
                
                if(event.payload.action === "created" && event.payload.repository.description !== ''){
                  postEmbed.setDescription(`${event.payload.repository.description}`);
                }

                if(!event.payload.action === "deleted"){
                  postEmbed.setURL(event.payload.repository.html_url());
                }

              }

              if(event.name === "create") {
                if(event.payload.ref_type === "tag") {
                  postEmbed.setTitle(
                    `[${event.payload.repository.name}:${event.payload.ref}] tag has been created by ${event.payload.sender.login}`
                  ).setURL(event.payload.repository.html_url).setColor('Gold');
                } else if( event.payload.ref_type === "branch" ) {
                  postEmbed.setTitle(
                    `[${event.payload.repository.name}:${event.payload.ref}] branch has been created by ${event.payload.sender.login}`
                  ).setURL(event.payload.repository.html_url()).setColor('DarkGold');
                }
              }

              if(event.name === "delete") {
                if( event.payload.ref_type === "tag" ) {
                  postEmbed.setTitle(
                    `[${event.payload.repository.name}:${event.payload.ref}] tag has been deleted by ${event.payload.sender.login}`
                  ).setURL(event.payload.repository.html_url).setColor('Red');
                } else if( event.payload.ref_type === "branch" ) {
                  postEmbed.setTitle(
                    `[${event.payload.repository.name}:${event.payload.ref}] tag has been deleted by ${event.payload.sender.login}`
                  ).setURL(event.payload.repository.html_url).setColor('DarkRed');
                }
              }

              postEmbed.setFooter({text: event.payload.sender.login, iconURL: event.payload.sender.avatarURL}).setTimestamp();

              const channel = client.channels.cache.get('1128092445842870302');
              channel.send({embeds: [postEmbed]});
              return true;
          }
    })

    require('http').createServer(createNodeMiddleware(webhooks)).listen(3000);
}