const path = require('node:path');
const fs = require('node:fs');
const { Client, Events, GatewayIntentBits, IntentsBitField, Collection } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const githubUpdates = require('./post-content/github-updates');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

new CommandHandler ({
    client,
    commandsPath: path.join(__dirname, 'commands', 'SlashCommands'),
    eventsPath: path.join(__dirname, 'events'),
    testServer: process.env.GUILD_ID
});

githubUpdates(client);

client.login(process.env.TOKEN);