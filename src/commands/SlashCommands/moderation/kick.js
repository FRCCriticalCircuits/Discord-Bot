const { CommandInteraction, SlashCommandBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: {    
        name: 'kick',
        description: 'Kick a user',
        options: [
            {
                name: 'user',
                description: 'The user you want to kick',
                required: true,
                type: ApplicationCommandOptionType.Mentionable
            },
            {
                name: 'reason',
                description: 'The reason for kicking user',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ],
    },
    testOnly: false,
    permissionsRequired: [ PermissionFlagsBits.Administrator ],
    botPermissions: [ PermissionFlagsBits.Administrator ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async ({interaction}) => {
        await interaction.deferReply();
        const user = interaction.guild.members.cache.get(interaction.options.get('user').value);

        const deleteReply = setTimeout(() => {
                interaction.deleteReply();
            }, 5000 // Delete the reply after 10 seconds
        );

        if(!user.id) {
            interaction.editReply('This user is not a member of this server');
            deleteReply;
            return true;
        } else if(user.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.editReply(`You cannot ban this user because they are an administrator`);
            deleteReply;
            return true;
        }

        await user.ban();
        interaction.editReply(`<@${user.id}> has been kicked for ${interaction.options.get('reason').value} `);
        deleteReply;
    }
}