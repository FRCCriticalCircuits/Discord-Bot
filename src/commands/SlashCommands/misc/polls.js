const { Client, CommandInteraction, ButtonInteraction, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, PermissionFlagsBits, Collector, Guild, EmbedBuilder, ActionRow, ActionRowBuilder, ButtonBuilder, InteractionResponse, Message, MessageManager, MessagePayload, ApplicationCommandOptionType, ButtonStyle, MessageCollector, codeBlock } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const pollsData = require('../../JSONS/pollsData.json');
const { MongoClient, Timestamp } = require('mongodb');
const { db_string_uri } = require('../../../../config.json');
const { error } = require('node:console');

const certificatePath = path.join(__dirname, '..', '..', '..', '..', process.env.MONGO_CERT_PATH_NAME);

const dbClient = new MongoClient(
    db_string_uri, {
    tlsCertificateKeyFile: certificatePath,
});

const dbDiscord = dbClient.db("Discord");
        
module.exports = {
    /**
     * 
     * @param {CommandInteraction | ButtonInteraction} interaction 
     * @param {Client} client 
     */
    //run: async (interaction, client) => {
    run: async ({interaction, client}) => {
        const channel = interaction.guild.channels.cache.get(interaction.channelId);
        const row = new ActionRowBuilder();
        const polls = dbDiscord.collection('Polls');

        if(interaction.isChatInputCommand()) {
            const subcommand  = interaction.options.getSubcommand();

            if( subcommand === 'create' ) { // /create subcommand
                await interaction.deferReply();
                const optionNames = ['first', 'second', 'third', 'forth', 'fifth'];

                

                if( !await polls.findOne({ channelId: interaction.channelId, guildId: interaction.guildId }) ) {
                    const options = [];

                    const namesList = []
                    for( let counter = 0; counter < 5; counter++ ) {
                        const name = (interaction.options.getString(optionNames[counter])) ?? null;
                        if(name) {
                            namesList.push(name);
                        }else {
                            break;
                        }
                    }

                    for( let counter = 0; counter < namesList.length; counter++) { 
                        options.push({ name: namesList[counter], id: optionNames[counter], votes: 0, voters:[]});
                    }

                    namesList.sort();
                    let newNamesList = [...namesList];

                    for(let counter = 0; counter < namesList.length; counter++) {
                        const name = namesList[counter];
                        let index = newNamesList.indexOf(name);

                        newNamesList.splice(index, 1);

                        if(newNamesList.find(value => value === name)) {
                            await interaction.editReply({content:`You cannot have more than one option with the same name`, ephemeral: true});
                            return;
                        }
                    }  

                    const channelId = interaction.channelId;

                    const postEmbed = new EmbedBuilder()
                                        .setAuthor({name:`${interaction.member.nickname ?? interaction.member.displayName}`})
                                        .setTitle(`Poll`)
                                        .setColor('Yellow')
                                        .setFooter({text:`${interaction.member.nickname ?? interaction.member.displayName}`}).setTimestamp();

                    for(const option of options) {
                        postEmbed.addFields({
                            name: `${option.name}`, value: codeBlock(`Votes: 0(100%)\u200B`)
                        })
                    }
                    
                    for ( let counter = 0; counter < options.length; counter++ ) {
                        row.addComponents([
                            new ButtonBuilder().setCustomId(options[counter].id).setLabel(options[counter].name).setStyle(ButtonStyle.Primary)
                        ]);
                    }

                    const message = interaction.editReply({content:`Poll has been created`, embeds:[postEmbed], components:[row]});

                    const guildId = interaction.guildId;

                    const newpoll = {guildId, channelId, options, totalVotes: 0, messageID: (await interaction.fetchReply()).id, Timestamp: (await message).createdAt.toString()};

                    // Insert new entry into database and log any errors on the console
                    await polls.insertOne({...newpoll}).catch(error => console.log(`[DB-WRITE-ERROR]There was an error: ${error}`));

                    /* DEPRECIATED
                    fs.writeFileSync( // add the poll into the json file
                        pollsPath,
                        JSON.stringify(pollsData),
                        { 'flag': 'w', 'encoding': 'utf-8' },
                        (error) => {
                            if( error !== 'null') {
                                console.log(`[WRITE-ERROR] There is an error: ${error}`);
                                interaction.reply('There has been an error while trying to process command');
                                throw error
                            }
                        }
                    )
                    */
                }else {
                    await interaction.editReply({content:`There is an ongoing poll in current channel, To end the poll use the following command, ${codeBlock(`/poll end`)}`, ephemeral: true});
                    return;
                }

            }else if( subcommand === 'end' ){ // /end subcommand
                const poll = await polls.findOne(
                    { channelId: interaction.channelId, guildId: interaction.guildId }, 
                    { projection: { _id: 1, options: 1, totalVotes: 1 } }
                )

                if( !poll ) {
                    await interaction.reply({content:`There is no active poll on this channel, you can use the ${codeBlock('/poll create')} command to start a new poll`, ephemeral: true});
                    return;
                }

                const options = await poll.options;

                options.sort((a, b) => b.votes - a.votes);

                const replyEmbed = new EmbedBuilder()
                                    .setAuthor({name:`${interaction.member.nickname ?? interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL()})
                                    .setTitle(`Poll`)
                                    .setColor('DarkRed')
                                    .setFooter({text:`${interaction.member.nickname ?? interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL()}).setTimestamp();

                for(const option of options) {
                    replyEmbed.addFields(
                        { name: `${option.name}`, value: codeBlock(`${option.votes}(${(option.votes/poll.totalVotes * 100).toFixed(1) ?? 100}%)\u200B`) }
                    )
                }

                polls.deleteOne({ _id: poll._id, channelId: interaction.channelId, guildId: interaction.guildId })
                    .catch((error) => {
                        console.log(`[DB-WRITE-ERROR]There is an error: ${error}`);
                        interaction.reply({content:`There was a server error whilre tryinhg to process command`, ephemeral: true})
                    }
                );
                
                replyEmbed.addFields(
                    { name: `${`Total Votes: ${poll.totalVotes}`}`, value: `\u000B` },
                )

                interaction.reply({content:'The poll has been ended, here is a summary', embeds:[replyEmbed]})
                return;
                /*
                fs.writeFileSync( // remove the poll into the json file
                    pollsPath, 
                    JSON.stringify(pollsData),
                    { 'flag': 'w', 'encoding': 'utf-8' },
                    (error) => {
                        if( error !== 'null') {
                            console.log(`[WRITE-ERROR] There is an error: ${error}`);
                            interaction.reply('There has been an error while trying to process command');
                            throw error
                        }
                    }
                )
                */

            }else if( subcommand === 'results' ){ // /results subcommand
                try{
                    await interaction.deferReply({ephemeral: true});

                    const replyEmbed = new EmbedBuilder()
                                        .setAuthor({name:`${interaction.member.nickname ?? interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL()})
                                        .setTitle(`Poll`)
                                        .setColor(interaction.member.displayColor)
                                        .setFooter({text:`${interaction.member.nickname ?? interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL()}).setTimestamp();
    
                    const poll = await polls.findOne(
                        { channelId: interaction.channelId, guildId: interaction.guildId },
                        { projection: { _id: 0, options: 1, channelId: 1, totalVotes: 1 } }
                    );

                    if( !poll ) {
                        interaction.editReply(`There is no active poll on this channel, you can use the following command to start a new poll, ${codeBlock(`/poll create`)}`);
                        return;
                    }

                    const options = poll.options;
                    options.sort((a, b) => b.votes - a.votes);

                    for(const option of options) {
                        replyEmbed.addFields(
                            { name:`${option.name}`, value: codeBlock(`${option.votes}(${isNaN(option.votes/poll.totalVotes) || !isFinite(option.votes/poll.totalVotes) ? 0 : (option.votes/poll.totalVotes * 100).toFixed(1)}%)`), inline: true}
                        )
                    }

                    replyEmbed.addFields(
                        { name: `Total Votes: ${poll.totalVotes}` }
                    )

                    await channel.send({embeds: [replyEmbed]});
                } catch(error) { // In case of an error when a poll is ended without any votes 
                    console.log(`[READ-ERROR] There was an error: ${error}`)
                }

                await interaction.editReply({content:`The results have been posted`});
            }

        }else if(interaction.isButton()) { // If a vote has been made
            await interaction.deferReply({ephemeral: true});

            const poll = await polls.findOne({ channelId: interaction.channelId, guildId: interaction.guildId, Timestamp: interaction.message.createdAt.toString() }) ?? null;

            if( !poll ) {
                await interaction.editReply(`There is no active poll on this channel, you can use the following command to start a new poll, ${codeBlock(`/poll create`)}`);
                return;
            }

            let options = poll.options;

            for( const option of options ) {
                if( option.voters.find(voter => voter === interaction.member.id) ) { // Check if voter has already voted
                    await interaction.editReply({content:`You cannot make another vote more than once`, ephemeral: true});
                    return;
                }
            }

            for (const option of options) {
                if(option.id === interaction.customId) {
                    try{

                        poll.totalVotes++; // Increase total votes
                        option.votes++; // Increase option votes
                        option.voters.push(interaction.member.id); // Push the ID of the voter
                        options = options.filter((value) => value.id !== option.id);
                        options.push(option);

                        polls.updateOne(
                            { channelId: interaction.channelId, guildId: interaction.guildId },
                            { $set: { options: options, totalVotes: poll.totalVotes }},
                        )

                        const updatedEmbed = new EmbedBuilder()
                                        .setAuthor({name: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()})
                                        .setTitle(`Poll`)
                                        .setColor('Yellow')
                                        .setFooter({text:`${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()}).setTimestamp();

                        try{
                            
                            options.sort((a, b) => b.votes - a.votes )

                            for( const option of options ) {

                                let voteBar = `|`;
                                let votePercent = option.votes / poll.totalVotes * 100 ?? 0;
                                for( let counter = 0; counter < 50; counter++ ) {
                                    if(votePercent >= 2) {
                                        voteBar += `=`;
                                        votePercent -= 2;
                                    }else if(votePercent < 2 && votePercent >= -2) {
                                        voteBar += `>`;
                                        votePercent = -5; 
                                    }

                                    if( counter === 49 ) { voteBar += ` (${((option.votes / poll.totalVotes) * 100).toFixed(1) ?? 0}%)`}
                                }

                                updatedEmbed.addFields(
                                    { name:`${option.name}`, value: codeBlock(`Votes: ${option.votes}(${((option.votes / poll.totalVotes) * 100).toFixed(1) ?? 0}%)`) },
                                    { name: `${voteBar}`, value: `\u200B` },
                                )
                            }

                            updatedEmbed.addFields(
                                { name: `Total Votes: ${poll.totalVotes}`, value:`\u000B` },
                            );

                        } catch(error) { // In case of an error when a poll is ended without any votes 
                            console.log(`[READ-ERROR] There was an error: ${error}`);
                            return true;
                        }          
                        

                        interaction.message.edit({embeds:[updatedEmbed]});
                        interaction.editReply({content:`Your vote has been registered`});

                        /* DEPRECIATED
                        fs.writeFileSync( 
                            pollsPath, 
                            JSON.stringify(pollsData),
                            { 'flag': 'w', 'encoding': 'utf-8' },
                            (error) => {
                                if( error !== 'null') {
                                    console.log(`[WRITE-ERROR] There is an error: ${error}`);
                                    interaction.reply('There has been an error while trying to process command');
                                    throw error
                                }
                            }
                        )
                        */

                        return;
                    } catch(error) {
                        console.log(`[COMMAND ERROR] There was an error: ${error}`);
                        interaction.editReply({content:`There was an error while trying to process command`})
                    }
                }
            }
        }
    },
    data: new SlashCommandBuilder()
            .setName('poll')
            .setDescription('Creates or Deletes Polls')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('create')
                    .setDescription('Begin a poll in current channel')
                    .addStringOption( option =>
                        option
                            .setName('first')
                            .setDescription('The first option')
                            .setRequired(true)
                    ).addStringOption( option =>
                        option
                            .setName('second')
                            .setDescription('The second option')
                            .setRequired(true)
                    ).addStringOption( option =>
                        option
                            .setName('third')
                            .setDescription('The third option')
                            .setRequired(false)
                    ).addStringOption( option =>
                        option
                            .setName('forth')
                            .setDescription('The fourth option')
                            .setRequired(false)
                    ).addStringOption( option =>
                        option
                            .setName('fifth')
                            .setDescription('The fifth option')
                            .setRequired(false)
                    )
            )
            .addSubcommand( subcommand =>
                subcommand
                    .setName('end')
                    .setDescription('End active poll in current channel')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('results')
                    .setDescription('Shows current vote information in poll')
            ),
    testOnly: true,
    devsOnly: true,
    PermissionsRequired: [PermissionFlagsBits.Administrator],
    role: '1079941144466694225',
}