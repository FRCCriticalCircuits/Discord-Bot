const { Webhooks, createNodeMiddleware } = require('@octokit/webhooks');
const { Client, Message, MessagePayload, MessageFlags, MessageFlagsBitField, Options, EmbedBuilder, REST } = require('discord.js');
const { github } = require('./post-config.json');
const { gitPostChannel } = require('./../../config.json');
const crypto = require('crypto');
const { env } = require('process');
var http = require('http')
require('dotenv').config;

/**
 * 
 * @param {Client} client 
 */
module.exports = (client) => {
    const express = require('express');
    const app = express();

    app.use(express.json());

    const verify_signature = function(req) {
      const signiture = crypto
        .createHmac("sha256", process.env.SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

      //console.log(`sha256=${signiture} === ${req.header("x-hub-signature-256")}`)
      return `sha256=${signiture}` === req.header("x-hub-signature-256")
    }

    app.post("/", async (req, res) => {
      const webhookEvent = await req.body;
      console.log(webhookEvent);

      //console.log(req.header("x-github-event"));
      //console.log(webhookEvent.repository.full_name);

      if( verify_signature(req) ) {
        if( github.events.find(event => event === req.header("x-github-event")) && github.actions.find(action => action === webhookEvent.action) && webhookEvent.action ) {
            
          const postEmbed = new EmbedBuilder()
            .setAuthor({ name: webhookEvent.sender.login, iconURL: webhookEvent.sender.avatar_url, url:webhookEvent.sender.url})
            
          if(req.header("x-github-event") === "repository") {
            postEmbed.setTitle(
                `[${webhookEvent.repository.full_name}] Repository has been ${webhookEvent.action} by ${webhookEvent.sender.login}`)
              .setColor('DarkPurple').setURL(webhookEvent.repository.html_url);
            
            if(webhookEvent.action === "created" && webhookEvent.repository.description !== ''){
              postEmbed.setDescription(`${webhookEvent.repository.description}`);
            }

            if(!webhookEvent.action === "deleted"){
              postEmbed.setURL(webhookEvent.repository.html_url);
            }

          }

          if(req.header("x-github-event") === "create") {
            if(webhookEvent.ref_type === "tag") {
              postEmbed.setTitle(
                `[${webhookEvent.repository.name}:${webhookEvent.ref}] tag has been created by ${webhookEvent.sender.login}`
              ).setURL(webhookEvent.repository.html_url).setColor('Gold');
            } else if( webhookEvent.ref_type === "branch" ) {
              postEmbed.setTitle(
                `[${webhookEvent.repository.name}:${webhookEvent.ref}] branch has been created by ${webhookEvent.sender.login}`
              ).setURL(webhookEvent.repository.html_url).setColor('DarkGold');
            }
          }

          if(req.header("x-github-event") === "delete") {
            if( webhookEvent.ref_type === "tag" ) {
              postEmbed.setTitle(
                `[${webhookEvent.repository.name}:${webhookEvent.ref}] tag has been deleted by ${webhookEvent.sender.login}`
              ).setURL(webhookEvent.repository.html_url).setColor('Red');
            } else if( webhookEvent.ref_type === "branch" ) {
              postEmbed.setTitle(
                `[${webhookEvent.repository.name}:${webhookEvent.ref}] tag has been deleted by ${webhookEvent.sender.login}`
              ).setURL(webhookEvent.repository.html_url).setColor('DarkRed');
            }
          }

          postEmbed.setFooter({text: webhookEvent.sender.login, }).setTimestamp();

          const channel = client.channels.cache.get(gitPostChannel);
          channel.send({embeds: [postEmbed]});

          res.status(200).send("Recieved and Accepted")
        }else{
          res.status(203).send("Receveid | Data was not used")
        }
      }else {
        res.status(401).send("Unauthorized");
      }
  });

  app.listen(process.env.PORT, () => console.log(`Server is running at port ${process.env.PORT}`));
  console.log(`Now Listening on port 80 and 443`)
}