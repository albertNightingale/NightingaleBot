// environmental variable import
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

// discord imports 
const Discord = require('discord.js'); // initialializing disord apis

// mongoose and database imports
const mongoose = require('mongoose');
const dbseeding = require('./util/dbController/dbseeding');

// file stream for command files reading
const fs = require('fs');

// utility file
const util = require('./util/util')
const statusME = require('./util/buildMessageEmbed/statusME')

// command prefix 
const prefix = '!';

////// set up the command based files
const basicFileDir = './commands/basic/';
const devastFileDir = './commands/devast/';
const rankFileDir = './commands/rank/';
const modFileDir = './commands/mod/';
const commandsMap = new Map([...setFiles(basicFileDir), ...setFiles(devastFileDir), ...setFiles(rankFileDir), ...setFiles(modFileDir)]);
const taskMap = setFiles('./tasks/');

////// connecting DB
const connectInfo = process.env.DBConnectionString;
connectDB();

///// user log in
const client = new Discord.Client(); // initializing a discord bot
logIn();

///// track of invites
const guildInvites = new Map();

///// client event handler
client 
    .once('ready', () => {
        uponReady().then().catch(err => console.error(err));
    })
    .on('ready', () => {
        executeTasks();
    })
    .on('message', message => {
        if (!validateMessage(message)) return;

        const messageArgs = processMessage(message);
        if (messageArgs && messageArgs.normalizedCommand)
        {
            const { attachments, args, normalizedCommand } = messageArgs;

            executeCommand(normalizedCommand, message, args, attachments)
            .then()
            .catch(err => console.log(err))
        }
    })
    .on('guildMemberAdd', member => {
        onAdding(member).then().catch(err => console.log(err));
    })
    .on('guildMemberRemove', member => {
        onLeaving(member).then().catch(err => console.log(err));
    })
    .on('inviteCreate', invite => {
        guildInvites.set(invite.code, invite);
    })
    .on('inviteDelete', invite => {
        guildInvites.delete(invite.code);
    })
    .on('messageReactionAdd', async (messageReaction, user) => {
        console.log('hi');
        onMessageReactionAdd(messageReaction, user).then().catch(err => console.log(err));
    })
    .on('messageReactionRemove', (messageReaction, user) => {
        console.log('hi');
        onMessageReactionRemove(messageReaction, user).then().catch(err => console.log(err));
    });

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

    // if the message content does not start with the prefix (not a command). 
    if (!message.content.startsWith(prefix) && !message.content.includes(prefix))
        return false;

    return true;
}

/**
 * processes the message and return the attachments, arguments, and the normalizedCommand
 * @param {Discord.Message} message 
 */
function processMessage(message) {
    if (message.content.startsWith('!'))
    {
        const args = message.content
            .replace("<@!" + client.user.id + ">", "").replace("<@" + client.user.id + ">", "") // process ping messages
            .trim().split(/ +|=|:/); // split out arguments following the command, split by ' ' or = or :
        const normalizedCommand = args.shift().toLowerCase(); // convert all to lowercase
        if (isValidCommand(normalizedCommand)) 
        {
            const attachments = message.attachments.array(); // parse out the attachment, arguments, and the command

            console.log("command: ", normalizedCommand);
            console.log("\targuments: ", JSON.stringify(args));
            console.log("\tattachments amount: ", attachments.length);
            return { attachments, args, normalizedCommand };
        }
    }
    return undefined;
}

/**
 * check if it is a valid command by see if the file system has them
 * @param {String} normalizedCommand 
 */
function isValidCommand(normalizedCommand)
{
    const commandType = normalizedCommand.slice(prefix.length);
    return commandsMap.has(commandType); 
}

/**
 * based on the normalizedCommand, calling the corresponding method
 * @param {String} normalizedCommand 
 * @param {Discord.Message} message 
 * @param {String[]} args 
 * @param {Discord.MessageAttachment} attachments 
 */
async function executeCommand(normalizedCommand, message, args, attachments) 
{
    if (isValidCommand(normalizedCommand)) await commandsMap.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments);
    else console.log("invalid command: " + normalizedCommand);
}

/**
 * connecting to the database and seed the database if it does not exist
 */
function connectDB() {
    ////////// DB Setup
    mongoose.connect(connectInfo, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => dbseeding.seedingDB())
        .then(() => console.log('DB Connected!'))
        .catch(err => console.log("DB Connection Error: " + err.message));
}

/**
 * Log into the discord
 */
function logIn() {
    // log in with the token 
    client.login(process.env.token);
}

/**
 * go into each directory, build a map object with the file name and file's exported object
 * @param {String} fileDirectory 
 */
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


/**
 * @returns {Discord.Collection<Discord.Snowflake, Discord.Invite>} invites
 */
async function fetchInvites()
{
    const invites = await exports.theGuild().fetchInvites();
    return invites;
}

/**
 * @type {Function}
 */
exports.theGuild = (() => {
    let guild = undefined;

    return function () {
        if (guild === undefined) {
            console.log('First time starting Guild');
            guild = client.guilds.cache.find(guild => guild.id === process.env.serverID);
        }
        return guild;
    }
})();

/**
 * Module exports for testings
 */
module.exports = {
    setFiles: setFiles
}

/**
 * on member joining the guild
 * 
 * 0. see who sent the invite
 * 1. send welcome message to welcome channel
 * 2. send a message to level people up  
 * 3. send status message to the status channel, indicating one member joining
 * @param {Discord.GuildMember} member 
 */
async function onAdding(member) {

    const updatedInvites = await fetchInvites();
    const memberInvite = updatedInvites.find(invite => guildInvites.get(invite.code).uses < invite.uses);
    /**
     * @type {Discord.GuildMember} inviterGuildMember
     */
    const inviterGuildMember = (await util.getGuildInformation()).serverMembers.find(member => memberInvite.inviter.id === member.id);   

    // send a welcome message to the welcome channel
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === process.env.channelForWelcome);
    if (!welcomeChannel) {
        console.error('welcome channel does not exist');
    }
    else    
    {   // Send the message, mentioning the member    
        await welcomeChannel.send(`${devMessage} Welcome to the server, ${member}`);
    }

    const leveluprequestChannel = member.guild.channels.cache.find(ch => ch.id === process.env.channelForLvlUpRequest);
    if (!leveluprequestChannel) {
        console.error('this channel does not exist');
    }
    else 
    {
        await leveluprequestChannel.send(`!levelup inviting ${member.displayName} . ${inviterGuildMember}`)
    }

    // send a command message to the leveluprequest channel
    await util.sendToStatusChannel(statusME.onMemberJoin(member, inviterGuildMember, memberInvite));
}

/**
 * on member leaving the guild
 * 
 * 1. send a status message to the status channel
 * @param {Discord.GuildMember} member 
 */
async function onLeaving(member) {
    await util.sendToStatusChannel(statusME.onMemberLeave(member));
}

async function uponReady() {
    console.log("logged in as " + client.user.username);
    try 
    {
        await util.getGuildInformation();
        (await fetchInvites()).each(invite => {
            guildInvites.set(invite.code, invite);
        }); 

        // const chanForInfo = await util.getGuildInformation().serverChannels.find( channel => channel.id === process.env.channelForInfo );
    }
    catch (err)
    {
        throw err;
    }
}

/**
 * see if the reaction added is in the right channel and the right message link
 * based on the reaction that is added, add a certain role
 * @param {Discord.MessageReaction} messageReaction 
 * @param {Discord.User} user 
 */
async function onMessageReactionAdd(messageReaction, user) {
    const message = messageReaction.message;
    const channel = message.channel;
    const userID = user.id;

    const reaction = messageReaction.emoji.id;

    console.log(reaction)
    /**
     * @type {Discord.GuildMember} guildMember
     */
    const guildMember = util.getGuildInformation.serverMembers.find(member => member.id === userID);

    if (message.id === process.env.messageForSubscription && channel.id === process.env.channelForInfo) 
    {
        // adding a role to the guild member based on the reaction passed
    }
}

/**
 * see if the reaction added is in the right channel and the right message link
 * based on the reaction that is added, add a certain role
 * @param {Discord.MessageReaction} messageReaction 
 * @param {Discord.User} user 
 */
async function onMessageReactionRemove(messageReaction, user) {
    const message = messageReaction.message;
    const channel = message.channel;
    const userID = user.id;
    /**
     * @type {Discord.GuildMember} guildMember
     */
    const guildMember = util.getGuildInformation.serverMembers.find(member => member.id === userID);
}