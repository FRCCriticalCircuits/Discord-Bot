const { SlashCommandBuilder, EmbedBuilder, CommandInteraction } = require("discord.js");

module.exports = {
    data: {
        name: 'server',
        description: 'Returns Information About the User',
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: ({interaction}) => {
        const replyEmbed = new EmbedBuilder()
            .setColor('DarkerGrey')
            .setTitle('Server')
            .setDescription('Returns information about the server')
            .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL()})
            .setFields(
                { name: '\u200B', value: '\u200B' },
                { name: `Date of Creation`, value:`${interaction.guild.createdAt}`, inline: false },
                { name: '\u200B', value: '\u200B' },
                { name: `Number of Members`, value:`${interaction.guild.memberCount}`, inline: false },                
            ).setTimestamp();

        interaction.reply({ embeds: [replyEmbed] });
    }
}