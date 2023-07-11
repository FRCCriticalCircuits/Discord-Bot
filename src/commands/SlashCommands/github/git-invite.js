const { Client, CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType} = require("discord.js")
const { Octokit } = require("octokit")

module.exports = {
    data: {
        name: 'git-invite',
        description: 'Invites of user to github organisation',
        options: [
            {
                name: 'email',
                description: 'Email that is linked to Github account',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },
    /**
     * 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async ({interaction}) => {
        const octokit = new Octokit({
            auth: process.env.DISCORD_TOKEN
        })

        await interaction.deferReply();

        try {
            const targetUserEmail = interaction.options.get('email', true).value;
            
            await octokit.request('POST /orgs/{org}/invitations', {
                org: 'FRCCriticalCircuits',
                email: targetUserEmail,
                role: 'direct_member',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })

            interaction.editReply(`An invitation has been sent to your email`);
            
        } catch (error) {
            if(error.status === 404){
                interaction.editReply('There has been a server issue while trying to process request');
                return;
            }else if(error.status === 422){
                interaction.editReply('');
                return;
            }

            console.log(`[ERROR] There was an error: ${error}`);
            interaction.editReply(`There was an error while trying to process request`);
        }

        setTimeout(() => {
            interaction.deleteReply();
        }, 5000);

    }
}