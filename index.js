// environmental variable import
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

// discord imports
const Discord = require('discord.js'); // initialializing disord apis
const client = new Discord.Client(); // initializing a discord bot

// mongoose and database imports
const mongoose = require('mongoose');
const dbseeding = require('./util/dbController/dbseeding');

// file stream for command files reading
const fs = require('fs');

// utility
const util = require('./util/util')

// command prefix 
const prefix = '!';

////// set up the command based files

const basicFileDir = './commands/basic/';
const devastFileDir = './commands/devast/';
const rankFileDir = './commands/rank/';
const modFileDir = './commands/mod/';
const commandsMap = new Map([...setFiles(basicFileDir), ...setFiles(devastFileDir), ...setFiles(rankFileDir), ...setFiles(modFileDir)]);
client.commands = commandsMap;
const taskMap = setFiles('./tasks/');

////// connecting DB
const connectInfo = process.env.DBConnectionString;
connectDB();

//// user log in
logIn();


//// client event handler
client
    .once('ready', () => {
        console.log("logged in as " + client.user.username);
        exports.theGuild();
    })
    .on('ready', () => {
        executeTasks();
    })
    .on('message', message => {
        console.log("Message: ", message.content)
        if (!validateMessage(message)) return;

        const { attachments, args, normalizedCommand } = processMessage(message);
        executeCommand(normalizedCommand, message, args, attachments)
            .then()
            .catch(err => console.log(err));
    })
    .on('guildMemberAdd', member => {
        onAdding(member).then().catch(err => console.log(err));
    })
    .on('guildMemberRemove', member => {
        onLeaving(member).then().catch(err => console.log(err));
    });


/**
 * on member joining the guild
 * 
 * 1. send welcome message to welcome channel
 * 2. send status message to the status channel, indicating one member joining
 * @param {Discord.GuildMember} member 
 */
async function onAdding(member) {
    // send a welcome message to the welcome channel
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === process.env.channelForWelcome);
    if (!welcomeChannel) {
        console.error('welcome channel does not exist ');
    }
    else     // Send the message, mentioning the member
    {       
        await welcomeChannel.send(`Welcome to the server, ${member} your landing time is ${member.joinedAt.toDateString()}`);
    }


    // send a status message to the status channel
    const statusChannel = member.guild.channels.cache.find(ch => ch.id === process.env.channelForServerStatus);
    if (!statusChannel) {
        console.error('status channel does not exist ');
    }
    else     // Send the message to the status channel, mentioning the member
    {
        await statusChannel.send(`${member} joined on ${member.joinedAt.toDateString()}`);
    }

}


/**
 * on member leaving the guild
 * 
 * 1. send a status message to the status channel
 * @param {Discord.GuildMember} member 
 */
async function onLeaving(member) {

    const statusChannel = member.guild.channels.cache.find(ch => ch.id === process.env.channelForServerStatus);
    if (!statusChannel) {
        console.error('status channel does not exist ');
    }   
    else    // Send the message to the status channel, mentioning the member
    {
        await statusChannel.send(`${member} left on ${member.joinedAt.toDateString()} ${member.joinedAt.toTimeString()}`);
    }    
}

/**
 * 
 */
exports.theGuild = (() => {
    let guild = undefined;

    return function () {
        if (guild === undefined) {
            console.log('ONLY RUN IT ONCE AND IT WILL WORK IN THE REST');
            guild = client.guilds.cache.find(guild => guild.id === process.env.serverID);
        }
        return guild;
    }
})();

/**
 * for each task in the list, execute them
 */
function executeTasks() {
    taskMap.forEach((taskObj, taskName) => {

        if (taskObj) {
            const timer = taskObj.executeIntervals;
            const executeFunc = taskObj.execute;
            if (timer && executeFunc) {
                setInterval(() => {
                    executeFunc(client).then();
                }, timer);
            }
        }
    })

}

/****
 * Validating the message
 * @param {Discord.Message} message 
 * @returns {Boolean} true if the message is validated, false otherwise.
 */
function validateMessage(message) {
    // Ignore messages that aren't from a guild
    if (!message.guild)
        return false;

    /*
if (message.author.bot)         // if the message author is not a bot
    return false;
    */
    // if the message content does not start with the prefix (not a command). 
    if (!message.content.includes(prefix))
        return false;

    return true;
}

/// processes the message and return the attachments, arguments, and the normalizedCommand
function processMessage(message) {
    // parse out the attachment, arguments, and the command
    const attachments = message.attachments.array();
    console.log("\tattachments amount: ", attachments.length);
    const args = message.content.replace("<@!" + client.user.id + ">", "")
        .replace("<@" + client.user.id + ">", "")
        .trim().split(/ +|=|:/); // split out arguments following the command, split by ' ' or = or :
    console.log("\targs: ", args);
    const normalizedCommand = args.shift().toLowerCase() // convert all to lowercase
    console.log("\tcommand: ", normalizedCommand);

    return { attachments, args, normalizedCommand }
}

/// based on the normalizedCommand, calling the corresponding method
async function executeCommand(normalizedCommand, message, args, attachments) {
    switch (normalizedCommand) {
        case '!dada':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args);
            break;
        case '!teleport-building':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!delete-record':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!derank':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!levelup':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!reset-rank':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!rankof':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!ban':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!mute':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!kick':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        case '!warn':
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
            break;
        default:
            console.log("invalid command: " + normalizedCommand);
    };
}

/// connecting to the database and seed the database if it does not exist
function connectDB() {
    ////////// DB Setup
    mongoose.connect(connectInfo, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => dbseeding.seedingDB())
        .then(() => console.log('DB Connected!'))
        .catch(err => console.log("DB Connection Error: " + err.message));
}

/// logIn to client
function logIn() {
    // log in with the token 
    client.login(process.env.token);
}

/// go into each directory, build a map object with the file name and file's exported object
function setFiles(fileDirectory) {
    const map = new Map();
    try {
        const files = fs.readdirSync(fileDirectory).filter(file => file.endsWith('.js'));
        files.forEach(file => {
            const aFile = require(`${fileDirectory}${file}`);
            if (aFile && aFile.name) {
                map.set(aFile.name, aFile);
            }
            else {
                console.log('aFile has no names in its property')
            }
        });
    }
    catch (err) {
        console.error(err);
    }
    return map;
}

module.exports = {
    setFiles: setFiles

}
