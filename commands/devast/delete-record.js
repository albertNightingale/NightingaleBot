const { MessageAttachment } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const modRoles = process.env.devastModRoleID.split(/,/)

function deleteRecord(message, args) {
    let deleteRecordRole = message.member.roles.cache.find(role => modRoles.includes(role.id))
    if (!deleteRecordRole) // only accept it if it has a bot
    {
        console.log(`${devMessage}role not matching: here is a list of roles for the member\n: ${JSON.stringify(message.member.roles.cache)}`)
        return;
    }
    else if (args === undefined || args.length === 0) {
        console.log(`${devMessage}No arguments passed`)
        return;
    }

    /***** START OF arguments processing ****/
    // process the arguments and attachments, if there is no args then send a message saying invalid parameter
    // arguments: 
    //      location in topleft and bottomright
    let topLeftLocation =
    {
        x: -1,
        y: -1
    }

    let botRightLocation =
    {
        x: -1,
        y: -1
    }

    if (args.length <= 4) {   // go to idx 0 and 1 to grab the x and y location
        var normalizedArg1 = args[0].trim();
        topLeftLocation.x = parseInt(normalizedArg1);
        var normalizedArg2 = args[1].trim();
        topLeftLocation.y = parseInt(normalizedArg2);
        var normalizedArg3 = args[2].trim();
        botRightLocation.x = parseInt(normalizedArg3);
        var normalizedArg4 = args[3].trim();
        botRightLocation.y = parseInt(normalizedArg4);

        if (isNaN(topLeftLocation.x)) {
            topLeftLocation.x = -1;
            console.log("Not a number", normalizedArg1);
            message.channel.send(message.author, `${devMessage}x1 parameter is required for building teleportation`);
            return;
        }

        if (isNaN(topLeftLocation.y)) {
            topLeftLocation.y = -1;
            console.log("Not a number", normalizedArg2);
            message.channel.send(message.author, `${devMessage}y1 parameter is required for building teleportation`);
            return;
        }

        if (isNaN(botRightLocation.x)) {
            botRightLocation.x = -1;
            console.log("Not a number", normalizedArg3);
            message.channel.send(message.author, `${devMessage}x2 parameter is required for building teleportation`);
            return;
        }

        if (isNaN(botRightLocation.y)) {
            botRightLocation.y = -1;
            console.log("Not a number", normalizedArg4);
            message.channel.send(message.author, `${devMessage}y2 parameter is required for building teleportation`);
            return;
        }
    }
    else {
        message.channel.send(message.author, `${devMessage}x1, x2, y1, y2 parameters are required for building teleportation`);
        return;
    }

    /**** END OF arguments processing ****/

    try 
    {
        const command = generateCommand(topLeftLocation, botRightLocation);
        const outputFilename = require('../../config')['outputfile'];
        saveToFile(outputFilename, command);
        message.channel.send(
            `${message.author} Here you go: `, 
            new MessageAttachment(outputFilename));
    } catch (error) {
        message.channel.send(`${message.author} Exception occured: ${error}`);
    }
}

/// save string to a file
function saveToFile(path, text) {
    // ensure file has been created
    createWriteFileStreamSync(path)
        .then(stream => {
            stream.write(
                text, 
                err => { 
                    console.log(err);
                });

            stream.on("finish", () => {
                stream.close(() => { })
            });
        });
}

/// create Write File Stream, if file not exist then create file. Return a file write stream
async function createWriteFileStreamSync(path) {
    const fs = require('fs')
    const exist = await fs.existsSync(path);

    if (!exist)
        await fs.writeFileSync(path, '');
    return fs.createWriteStream(path);
}

// generate the command
function generateCommand(topLeftLocation, botRightLocation) {

    if ((botRightLocation.x-topLeftLocation.x)*(botRightLocation.y-topLeftLocation.y) > 4900) // too much to input
    {
        throw "the output is too large, please do it a piece at a time";
    }

    const format = "!delete-record=s1:s2"
    let command = "";

    for (var i = topLeftLocation.x; i < botRightLocation.x + 1; i++) {
        for (var j = topLeftLocation.y; j < botRightLocation.y + 1; j++) {
            command += format.replace("s1", i.toString()).replace("s2", j.toString());
        }
    }

    console.log(command)
    return command;
}


module.exports = {
    name: 'delete-record',
    description: 'delete record commands',
    execute: deleteRecord
}