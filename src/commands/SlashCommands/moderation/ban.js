const { CommandInteraction, SlashCommandBuilder, ApplicationCommandOptionType, PermissionFlagsBits, Client, ApplicationCommandPermissionType } = require("discord.js");

module.exports = {
    data: {    
        name: 'ban',
        description: 'Bans a user',
        options: [
            {
                name: 'user',
                description: 'The user you want to ban',
                required: true,
                type: ApplicationCommandOptionType.Mentionable
            },
            {
                name: 'reason',
                description: 'The reason for banning user',
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
     * @param { Client } client
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

        user.ban();
        interaction.editReply(`<@${user.id}> has been banned for ${interaction.options.get('reason').value}`);
        deleteReply;
    }
}