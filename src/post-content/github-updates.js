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

    source.onmessage = async (event) => {
        const webhookEvent = JSON.parse(event.data);
        await webhooks
          .verifyAndReceive({
            id: webhookEvent["x-request-id"],
            name: webhookEvent["x-github-event"],
            signature: webhookEvent["x-hub-signature"],
            payload: webhookEvent.body,
          })
          .catch(console.error);

          console.log(webhookEvent["x-github-event"]);
          console.log(webhookEvent.body);

          if( github.events.find(event => event === webhookEvent["x-github-event"]) ) {
              if( (!github.actions.find(action => action === webhookEvent.body.action) && webhookEvent.body.action) ) {
                return;
              }
              
              const postEmbed = new EmbedBuilder()
                .setAuthor({ name: webhookEvent.body.sender.login, iconURL: webhookEvent.body.sender.avatar_url, url:webhookEvent.body.sender.url})
                
              if(webhookEvent["x-github-event"] === "repository") {
                postEmbed.setTitle(
                    `[${webhookEvent.body.repository.full_name}] Repository has been ${webhookEvent.body.action} by ${webhookEvent.body.sender.login}`)
                  .setColor('DarkPurple').setURL(webhookEvent.body.repository.html_url);
                
                if(webhookEvent.body.action === "created" && webhookEvent.body.repository.description !== ''){
                  postEmbed.setDescription(`${webhookEvent.body.repository.description}`);
                }

                if(!webhookEvent.body.action === "deleted"){
                  postEmbed.setURL(webhookEvent.body.repository.html_url);
                }

              }

              if(webhookEvent["x-github-event"] === "create") {
                if(webhookEvent.body.ref_type === "tag") {
                  postEmbed.setTitle(
                    `[${webhookEvent.body.repository.name}:${webhookEvent.body.ref}] tag has been created by ${webhookEvent.body.sender.login}`
                  ).setURL(webhookEvent.body.repository.html_url).setColor('Gold');
                } else if( webhookEvent.body.ref_type === "branch" ) {
                  postEmbed.setTitle(
                    `[${webhookEvent.body.repository.name}:${webhookEvent.body.ref}] branch has been created by ${webhookEvent.body.sender.login}`
                  ).setURL(webhookEvent.body.repository.html_url).setColor('DarkGold');
                }
              }

              if(webhookEvent["x-github-event"] === "delete") {
                if( webhookEvent.body.ref_type === "tag" ) {
                  postEmbed.setTitle(
                    `[${webhookEvent.body.repository.name}:${webhookEvent.body.ref}] tag has been deleted by ${webhookEvent.body.sender.login}`
                  ).setURL(webhookEvent.body.repository.html_url).setColor('Red');
                } else if( webhookEvent.body.ref_type === "branch" ) {
                  postEmbed.setTitle(
                    `[${webhookEvent.body.repository.name}:${webhookEvent.body.ref}] tag has been deleted by ${webhookEvent.body.sender.login}`
                  ).setURL(webhookEvent.body.repository.html_url).setColor('DarkRed');
                }
              }

              postEmbed.setFooter({text: webhookEvent.body.sender.login, iconURL: webhookEvent.body.sender.avatar_url}).setTimestamp();

              const channel = client.channels.cache.get('1128092445842870302');
              channel.send({embeds: [postEmbed]});
              return true;
          }
    };

    require('http').createServer(createNodeMiddleware(webhooks)).listen(3000);
}