const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller');

async function warn(message, args, attachment) {

    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await processArguments(message, args);
        if (argument)
        {
            const author = message.author;
            await message.channel.send(`${devMessage} ${argument.userInDiscord} is warned for ${argument.warnReason}`);
    
            const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
            if (!statusChannel) 
            {
                await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
            }
            else 
            {
                await statusChannel.send(`${devMessage} ${Date.now()} : ${author} warned${argument.userInDiscord} for ${argument.warnReason}`);
            }
    
            // mute one hour
            await statusChannel.send(`!mute 1 ${argument.warnReason} ${argument.userInDiscord}`);
        }
    }
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {String[]} args 
 */
async function processArguments(message, args) 
{
    const isArgsInvalidated = (args === undefined || args.length < 1);
    if (isArgsInvalidated) {
        console.log(`${devMessage}No arguments passed`);
        return undefined;
    }
    
    const mentions = message.mentions.members.array();
    if (mentions && mentions.length > 0) {
        const warnTarget = mentions[0];
        const warnReason = processWarnReason(args);

        return {
            userInDiscord: warnTarget,
            userInDB: undefined,
            warnReason: warnReason,
        }
    }
    else {
        console.log(`${devMessage}No mentions passed`);
        return undefined;
    }
}

/**
 * 
 * @param {String[]} args 
 */
function processWarnReason(args)
{
    const arguments = args.map( arg => {
        if (!arg.includes('@'))
            return arg;
    });

    return arguments.join(' ');
}

module.exports = {
    name: 'warn',
    description: 'warn a player and mute him for 30 minutes',
    execute: warn
}