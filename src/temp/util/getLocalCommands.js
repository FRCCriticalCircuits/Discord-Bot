const path = require('node:path');
const getAllFiles = require("./getAllFiles");

module.exports = (exeptions = []) => {
    let localCommands = [];

    const commandCategories = getAllFiles(
        path.join(__dirname, '..', 'commands'),
        true
    )

    for ( const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        for (const commmandFile of commandFiles) {
            const commandObject = require(commmandFile);

            if(exeptions.includes(commandObject.name)){
                continue;
            }

            localCommands.push(commandObject);
        }
    }

    return localCommands;
}