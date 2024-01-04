const { ButtonInteraction, Client, InteractionResponse } = require("discord.js");
const roles = require('../JSONS/roles.json');

/**
 * 
 * @param {ButtonInteraction} interaction
 * @param {Client} client
 */
module.exports = async ( interaction, client ) => {
    try {
        const role = interaction.guild.roles.cache.get(interaction.customId);

        if( !role ) {
            await interaction.reply({ content:`I could not find this role, it may have been deleted`, ephemeral:true });
            return;
        }

        const hasRole = interaction.member.roles.cache.has(role.id);

        if( hasRole ) {
            await interaction.member.roles.remove(role);
            await interaction.reply({ content:`Your ${role} role has been unassigned from user`, ephemeral:true });
            return;
        }

        await interaction.member.roles.add(role);
        await interaction.reply({content:`The role ${role} has been added to user`, ephemeral:true});
    } catch (error) {
        console.log(`[ERROR] There was an error whilt trying to process request: ${error}`);
        interaction.reply({content:`There was an error while trying execute command`, ephemeral: true});
    }
}