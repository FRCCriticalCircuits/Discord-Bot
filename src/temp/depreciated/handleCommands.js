const { devs } = require('../../../config.json');
const getLocalCommands = require('../util/getLocalCommands');

module.exports = async (client, interaction) => {
    if(!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

        if(!commandObject) return;

        if(commandObject.devOnly){
            if (!devs.includes(interaction.member.id)){
                interaction.reply({ content: "This command is only availible to devs" , ephemeral: true });
                return;
            }
        }

        if(commandObject.testOnly){
            if(!interaction.guild.id === process.env.GUILD_ID){ 
                interaction.reply({ content: 'This command is not available to this server', ephemeral: true });
            }
            return;
        }
        
        if(commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if(!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    })
                    break;
                }
            }
        }

        if(commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if(!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: 'I do not have enough permissions.',
                        ephemeral: true,
                    });
                }
            }
        }

        await commandObject.callback(client, interaction);

    } catch (error) {
        console.log(`There was an error running a command: ${error}`);
        interaction.reply({content: 'There has been an error while trying to execute command', ephemeral: true});
    }
}