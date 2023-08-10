const { Client, SlashCommandBuilder, CommandInteraction, EmbedBuilder, codeBlock } = require('discord.js')
const getAllFiles = require('../../../temp/util/getAllFiles')
const path = require('node:path')
const fs = require('node:fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-commands')
        .setDescription('List all slash commands provided by bot'),
    testOnly: true,
    /**
     * 
     * @param {CommandInteraction} interaction
     * @param {Client} client 
     */
    run: async ({interaction, client}) => {
        await interaction.deferReply();

        const ReplyEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription('Provides a list of all commands availible to the server')
            .setColor('Fuchsia')
            .setTitle('List of Commands')
            .setFooter({text: client.user.username})
            .setTimestamp();

        const commandObjects = [];
        const categories = getAllFiles(path.join(__dirname, '..', '..', 'SlashCommands'), true);

        for(const category of categories) {
            const commandsPath = getAllFiles(category).filter((path) => path.endsWith('.js'));
            commandsPath.map((commandPath) => {
                const command = require(commandPath);
                commandObjects.push({commandName: command.data.name, description: command.data.description});
            })
        }

        commandObjects.filter((command) => command.commandName !== "list-commands");

        for(const commandObject of commandObjects) {
            ReplyEmbed.addFields(
                { name: `${commandObject.commandName}`, value: `${codeBlock(commandObject.description)}`, inline: false }
            )
        }

        interaction.editReply({embeds:[ReplyEmbed]});
    }
}