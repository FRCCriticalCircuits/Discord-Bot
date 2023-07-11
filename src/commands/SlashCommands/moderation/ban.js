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
    testOnly: true,
    permissionsRequired: [ PermissionFlagsBits.Administrator ],
    botPermissions: [ PermissionFlagsBits.Administrator ],
    /**
     * 
     * @param {CommandInteraction} interaction
     * @param { Client } client
     */
    run: async ( client ,interaction) => {
        const userID = interaction.options.get('user').value;
    
        await interaction.deferReply();

        if(!userID) {
            interaction.reply({ content:'This user is not a member of this server', ephemeral:true });
            return true;
        }else if( interaction.options.getMember(userID).permissions.has(PermissionFlagsBits.Administrator) ) {
            interaction.reply({ content:'This user cannot be banned because they are an administrator', ephemeral: true });
            return true;
        }

        interaction.reply(`<@${userID}> has been banned for ${interaction.options.get('reason').value} `);
        interaction.options.getMember('user').ban();
    }
}