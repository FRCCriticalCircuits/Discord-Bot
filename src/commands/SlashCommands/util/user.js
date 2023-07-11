const { EmbedBuilder ,SlashCommandBuilder, CommandInteraction } = require("discord.js");

module.exports = {
    data: {
        name: 'user',
        description: 'Returns Information About the User',
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: ({interaction}) => {
        const replyEmbed = new EmbedBuilder()
            .setColor('DarkerGrey')
            .setTitle('User')
            .setDescription('Returns information about the user')
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setFields(
                { name: '\u200B', value: '\u200B' },
                { name: `Member Since`, value:`${interaction.user.createdAt}`, inline: false },
                { name: '\u200B', value: '\u200B' },
                { name: `Joined Server At`, value:`${interaction.guild.members.cache.get(interaction.user.id).joinedAt}`, inline: false },                
            ).setTimestamp();

        interaction.reply({ embeds: [replyEmbed] });
    }
}