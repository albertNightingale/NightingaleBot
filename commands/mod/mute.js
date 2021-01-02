const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller');

/**
 * 
 * @param {Discord.Message} message 
 * @param {*} args 
 * @param {*} attachment 
 */
async function mute(message, args, attachment) {
    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await processArguments(message, args);

        if (!argument) 
        {
            await message.channel.send(`${devMessage} muting failed as the argument is incomplete`);
            return;
        }

        const mutedBy = message.member;

        const muteRoleID = process.env.muteRoleID;
        const muteTarget = argument.userInDiscord;
        const muteTime = argument.muteTime;
        const muteReason = argument.muteReason;

        await muteTarget.roles.add(muteRoleID);

        await message.channel.send(`${devMessage}muted ${muteTarget} for ${muteTime} due to ${muteReason}`);

        const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
        if (!statusChannel) 
        {
            await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
        }
        else 
        {
            await statusChannel.send(`${devMessage} ${Date.now()} : ${mutedBy} muted${muteTarget} for ${muteTime} due to ${muteReason}, 
                                    the mute will end on ${whenMuteEnd(muteTime)}`);
        }

        if (muteTime !== 0)
        {
            const muteTimeInMilliseconds = muteTime * 60 * 60 * 1000;
            
            const unmute = function() {
                muteTarget.roles.remove(muteRoleID)
                .then(res => console.log(`unmuted for ${muteRoleID} `))
                .catch(err => console.error(err));
            }

            // set a timer to await
            setInterval(unmute, muteTimeInMilliseconds);
        }
    }
}

/**
 * 
 * @param {Number} muteTime 
 */
function whenMuteEnd(muteTime)
{
    const now = Date.now();
    const endingTime = new Date(now + muteTime * 60 * 60 * 1000);
    return endingTime;
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
    }
    
    const mentions = message.mentions.members.array();
    if (mentions && mentions.length > 0) {
        const muteTarget = mentions[0];
        const muteTime = isArgsInvalidated ? 0 : processMuteTime(args[0]);
        const muteReason = isArgsInvalidated ? 'No Reason' : processMuteReason(banTime, args);

        return {
            userInDiscord: muteTarget,
            userInDB: undefined,
            muteReason: muteReason,
            muteTime: muteTime
        }
    }
    else {
        console.log(`${devMessage}No mentions passed`);
    }

    return undefined;
}

/**
 * process the mute time after the argument is passed
 * @param {String} time 
 */
function processMuteTime(time)
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
function processMuteReason(time, args)
{
    if (time === 0)
    {
        return args.join(' ');
    }
    else {
        return args.slice(1).join(' ');
    }
}

module.exports = {
    name: 'mute',
    description: 'mute a player',
    execute: mute
}
