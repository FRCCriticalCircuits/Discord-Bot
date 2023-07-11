const { CommandInteraction } = require('discord.js');
const { testServer } = require('../../config.json');

/**
 * 
 * @param {CommandInteraction} interaction 
 */
module.exports = (interaction, commandObj) => {
    if( commandObj.testOnly ) {
        if( interaction.guild.id !== testServer) {
            interaction.reply('This command cannot be used in this server');
            return true;
        }
    }
}