const { Client, ActivityType } = require("discord.js")

/**
 * 
 * @param {Client} client 
 */
module.exports = (client) => {
    client.user.setPresence({ 
        status: "online", 
        activities: [{
            name: "Survailance",
            type: ActivityType.Watching,
        }]
    })
}