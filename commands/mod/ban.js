const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const dbController = require('../../util/dbController/controller');
const util = require('../../util/util');
const Discord = require('discord.js');


/**
 * 
 * @param {Discord.Message} message 
 * @param {String[]} args 
 * @param {File} attachment 
 */
async function ban(message, args, attachment) {

    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await processArguments(message, args);

        if (!argument) 
        {
            await message.channel.send(`${devMessage} banning failed as the argument is incomplete`);
            return;
        }

        const banningTarget = argument.userInDiscord;
        const banningTargetUsername = banningTarget.displayName;
        const banningTargetID = banningTarget.id;
        if (banningTarget.bannable && banningTarget.kickable) // the target can be banned 
        {
            if (argument.banTime === 0)
            {
                await banningTarget.ban({
                    reason: argument.banReason
                });
            }
            else 
            {
                await banningTarget.ban({
                    days: argument.banTime,
                    reason: argument.banReason
                });
            }

            const realBannedDays = argument.banTime === 0 ? 'life' : (argument.banTime + ' days');
            const responseMessage = `${devMessage} ${banningTarget} with ID ${banningTargetID} is banned for ${realBannedDays} due to ${argument.banReason}`;

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
            await message.channel.send(`${devMessage} banning failed as ${banningTargetUsername} with ID ${banningTargetID} is unbannable or unkickable`);
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
        const banTarget = mentions[0];

        const banTargetID = banTarget.id;
        const banTime = isArgsInvalidated ? 0 : processBanTime(args[0]);
        const banReason = processBanReason(banTime, args);

        // go to db and remove the target
        await dbController.deleteUser(banTargetID);

        return {
            userInDiscord: banTarget,
            userInDB: undefined,
            banReason: banReason,
            banTime: banTime
        }
    }
    else {
        console.log(`${devMessage}No mentions passed`);
    }

    return undefined;
}

/**
 * process the ban time after the argument is passed
 * @param {String} time 
 */
function processBanTime(time)
{
    const banTime = parseInt(time) 
    if (Number.isNaN(banTime))
        return 0;
    else 
        return banTime;
}

/**
 * 
 * @param {Number} time 
 * @param {String[]} args 
 */
function processBanReason(time, args)
{
    const arguments = args.map( arg => {
        if (!arg.includes('@'))
            return arg;
    });
    if (time === 0)
    {
        return arguments.join(' ');
    }
    else {
        return arguments.slice(1).join(' ');
    }
}

module.exports = {
    name: 'ban',
    description: 'ban a player',
    execute: ban
}