const { ActionRowBuilder } = require('@discordjs/builders');
const { Client, ActionRow, ButtonBuilder, ButtonStyle, IntentsBitField } = require('discord.js');
const roles = require('../../commands/MessageComponent/roles.json');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', async () => {
    try {
        const channel = client.channels.cache.get('1128377395255201903');
        const actionRow = new ActionRowBuilder()

        for ( const role of roles ) {
            actionRow.addComponents([
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
            ]);
        }

        console.log(`Message has been sent`);
        channel.send({ content: `Select a role to assign or unassign yourself a role`, components: [actionRow] });
    } catch (error) {
        console.log(`[ERROR] There was an error: ${error}`);
        interaction.reply({content:`There was an error while trying execute command`, ephemeral: true});
    }
})

client.login(process.env.TOKEN);