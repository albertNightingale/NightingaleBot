const { MessageAttachment } = require("discord.js");

const Discord = require('discord.js');
const DiscordUser = require('../../models/discordUser');

/**
 * Expecting time to be the first element in all moderation commands
 * 
 * time will be zero if invalid first argument: null, or cannot be converted to integer
 * reason will exclude all the mentions and the time argument, if there.
 * userInDiscord will be the first mention inside of the message
 * 
 * will return undefined if no mention is passed
 * 
 * @param {Discord.Message} message 
 * @param {String[]} args 
 * @param {Number} expectedArgs the expected count of arguments in args
 */
exports.processArguments = function (message, args, expectedArgs) {
    
    const isArgsInvalidated = (args === undefined || args.length < expectedArgs);
    if (isArgsInvalidated) {
        console.log(`${devMessage}No arguments passed`);
    }
    
    const mentions = message.mentions.members.array();
    if (mentions && mentions.length > 0) {
        const target = mentions[0];
        const time = isArgsInvalidated ? 0 : processTime(args[0]);
        const reason = processReason(time, args);

        return {
            userInDiscord: target,
            userInDB: undefined,
            reason: reason,
            time: time
        }
    }
    else {
        console.log(`${devMessage}No mentions passed`);
        return undefined;
    }
}

/**
 * process the time after the argument is passed
 * @param {String} time 
 */
function processTime(time)
{
    const banTime = parseInt(time) 
    if (Number.isNaN(banTime))
        return 0;
    else 
        return banTime;
}

/**
 * 
 * @param {Boolean} hasNumber 
 * @param {String[]} args 
 */
exports.processReasoning = function(hasNumber, args)
{
    return hasNumber ? processReason(1, args) : processReason(0, args);
}

/**
 * 
 * @param {Date} startTime 
 * @param {Number} timeSpan in hours
 */
exports.whenItEnd = function(startTime, timeSpan)
{
    const timesToMiliseconds = 1000 * 60 * 60;
    return new Date(startTime.getTime() + timesToMiliseconds);
}

/**
 * 
 * @param {Number} time 
 * @param {String[]} args 
 */
function processReason(time, args)
{
    const pingDelimiter = '@';
    const arguments = args.map( arg => {
        if (!arg.startsWith(pingDelimiter))
        {
            if (arg.includes(pingDelimiter))
            {
                return arg.substr(0, arg.indexOf(pingDelimiter));
            }
            return arg;
        }    
    });
    if (time === 0)
    {
        return arguments.join(' ');
    }
    else {
        return arguments.slice(1).join(' ');
    }
}