const path = require('node:path');
const getAllfiles = require('./util/getAllFiles');
const { Events } = require('discord.js');

module.exports = (client) => {
    const eventFolders = getAllfiles(path.join(__dirname, '..', 'events'), true);

    for( const eventFolder of eventFolders ) {
        const eventFiles = getAllfiles(eventFolder);

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
        eventFiles.sort((a, b) => a > b);

        client.on(eventName, async (arg) => {
            console.log(eventName);
            for(const eventFile of eventFiles){
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        })
    }
}