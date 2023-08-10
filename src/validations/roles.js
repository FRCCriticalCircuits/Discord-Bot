const { CommandInteraction } = require('discord.js')

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {*} commandObj
 */
module.exports = (interaction, commandObj) => {
    const commandRole = interaction.guild.roles.cache.get(commandObj.role);
    if( role ) {
        for (const role of interaction.member.roles.highest) {
            if(role < commandRole) {
                interaction.reply({content:'You do not have the required roles to use this command', ephemeral:true})
                return true;
            }
        }
    }
}