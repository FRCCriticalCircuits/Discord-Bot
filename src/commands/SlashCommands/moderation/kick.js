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
    testOnly: true,
    permissionsRequired: [ PermissionFlagsBits.Administrator ],
    botPermissions: [ PermissionFlagsBits.Administrator ],
    run: async ({interaction}) => {
        const userID = interaction.options.get('user').value;
    
        await interaction.deferReply();

        if(!userID) {
            interaction.reply({ content:'This user is not a member of this server', ephemeral:true });
            return true;
        }else if( interaction.options.getMember(userID).permissions.has(PermissionFlagsBits.Administrator) ) {
            interaction.reply({ content:'This user cannot be kicked because they are an administrator', ephemeral: true });
            return true;
        }

        interaction.reply(`User <@${userID}> has been kicked for ${interaction.options.get('reason').value} `);
        interaction.options.getMember('user').kick();
    }
}