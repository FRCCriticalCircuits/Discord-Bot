const { CommandInteraction, PermissionFlagsBits } = require('discord.js');

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {*} commandObj 
 */
module.exports = (interaction, commandObj) => {
    if( commandObj.requiredPermissions[0] || commandObj.botPermissions[0] ) {
        for( const permission of commandObj.requiredPermissions ) {
            if( !interaction.memberPermissions.has(permission) ) {
                interaction.reply({content:'You do not have the required permissions', ephemeral: true});
                return true;
            }
        }

        for ( const botPermission of commandObj.botPermissions ) {
            if(!interaction.appPermissions.has(botPermission)) {
                interaction.reply({ content:'I do not have the required permissions', ephemeral:true});
                return true;
            }
        }
    }
}