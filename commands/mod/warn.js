const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller');

async function warn(message, args, attachment) {
    const argument = await processArguments(message, args);
    if (argument)
    {
        const author = message.author;
        await message.send(`${devMessage} ${argument.userInDiscord} is warned for ${argument.warnReason}`);

        const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
        if (!statusChannel) 
        {
            await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
        }
        else 
        {
            await statusChannel.send(`${devMessage} ${Date.now()} : ${author} warned${argument.userInDiscord} for ${argument.warnReason}`);
        }

        await statusChannel.send(`!mute 1 ${warnReason} ${argument.userInDiscord}`);
    }
}

/**
 * 
 * @param {Discord.Message} message 
 * @param {String[]} args 
 */
async function processArguments(message, args) 
{
    const isArgsInvalidated = (args === undefined || args.length < 3);
    if (isArgsInvalidated) {
        console.log(`${devMessage}No arguments passed`);
        return undefined;
    }
    
    const mentions = message.mentions.members.array();
    if (mentions && mentions.length > 0) {
        const warnTarget = mentions[0];
        const warnReason = args.join(' ');

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

module.exports = {
    name: 'warn',
    description: 'warn a player and mute him for 30 minutes',
    execute: warn
}