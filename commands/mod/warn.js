const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const utility = require('../utility/utility');
const databaseController = require('../../util/dbController/controller');

async function warn(message, args, attachment) {

    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await utility.processArguments(message, args, 1);
        if (argument)
        {
            const author = message.author;
            const warnReason = message.reason;
            await message.channel.send(`${devMessage} ${argument.userInDiscord} is warned for ${warnReason}`);
    
            const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
            if (!statusChannel) 
            {
                await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
            }
            else 
            {
                await statusChannel.send(`${devMessage} ${Date.now()} : ${author} warned${argument.userInDiscord} for ${warnReason}`);
            }
    
            // mute one hour
            await statusChannel.send(`!mute 1 ${warnReason} ${argument.userInDiscord}`);
        }
    }
}
module.exports = {
    name: 'warn',
    description: 'warn a player and mute him for 30 minutes',
    execute: warn
}