const { ButtonInteraction } = require("discord.js")
const roles = require('../../commands/MessageComponent/roles.json');
const assignRoleCommand = require("../../commands/MessageComponent/assign-role");
const { polls } = require('../../commands/JSONS/pollsData.json');
const pollCommand = require('../../commands/SlashCommands/misc/polls');

/**
 * 
 * @param {ButtonInteraction} interaction 
 */
module.exports = (interaction, client) => {
    if(!interaction.isButton()) return;

    if( roles.find(role => role.id === interaction.customId) ) {
        assignRoleCommand(interaction, client);
    }else if( ['first', 'second', 'third', 'forth', 'fifth'].find((id) => id === interaction.customId) ) {
        pollCommand.run({ interaction });
    }
}