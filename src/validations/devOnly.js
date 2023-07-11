const { CommandInteraction } = require('discord.js');
const { devs } = require('../../config.json');

/**
 * 
 * @param {CommandInteraction} interaction  
 */
module.exports = (interaction, commandObj) => {
    if(commandObj.devOnly) {
        const dev = devs.filter(devs => devs === interaction.member.id);

        if(!dev) {
            interaction.reply(`This command is only available for developers`);
            return;
        }
    }
}