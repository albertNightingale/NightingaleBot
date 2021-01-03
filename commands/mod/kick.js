
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const dbController = require('../../util/dbController/controller');
const util = require('../../util/util');
const Discord = require('discord.js');

async function kick(message, args, attachment) {
    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await processArguments(message, args);

        if (!argument) 
        {
            await message.channel.send(`${devMessage} kicking failed as the argument is incomplete`);
            return;
        }

        const kickingTarget = argument.userInDiscord;
        const kickingTargetUsername = kickingTarget.displayName;
        const kickingTargetID = kickingTarget.id;

        if (kickingTarget.kickable) // the target can be banned 
        {
            await kickingTarget.kick(argument.kickReason);

            const responseMessage = `${devMessage} ${kickingTarget} with ID ${kickingTargetID} is kicked due to ${argument.kickReason}`;

            await message.channel.send(responseMessage);

            const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
            if (!statusChannel) 
            {
                await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
            }
            else 
            {
                await statusChannel.send(responseMessage);
            }
        }
        else 
        {
            await message.channel.send(`${devMessage} kickable failed as ${kickingTargetUsername} with ID ${kickingTargetID} is unkickable`);
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
    }
    
    const mentions = message.mentions.members.array();
    if (mentions && mentions.length > 0) {
        const kickTarget = mentions[0];

        const kickTargetID = kickTarget.id;
        const kickReason = processKickReason(args);

        // go to db and remove the target
        await dbController.deleteUser(kickTargetID);

        return {
            userInDiscord: kickTarget,
            userInDB: undefined,
            kickReason: kickReason,
        }
    }
    else {
        console.log(`${devMessage}No mentions passed`);
    }

    return undefined;
}

function processKickReason(args) {
    const arguments = args.map( arg => {
        if (!arg.includes('@'))
            return arg;
    });
    return arguments.join(' ');
}

module.exports = {
    name: 'kick',
    description: 'kick a player',
    execute: kick
}