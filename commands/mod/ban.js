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
        const argument = await utility.processArguments(message, args, 1);

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
            if (argument.time === 0)
            {
                await banningTarget.ban({
                    reason: argument.reason
                });
            }
            else 
            {
                await banningTarget.ban({
                    days: argument.time,
                    reason: argument.reason
                });
            }

            const realBannedDays = argument.time === 0 ? 'life' : (argument.time + ' days');
            const responseMessage = `${devMessage} ${banningTarget} with ID ${banningTargetID} is banned for ${realBannedDays} due to ${argument.reason}`;

            await message.channel.send(responseMessage);

            const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
            if (!statusChannel) 
            {
                await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
            }
            else 
            {
                await statusChannel.send(`.\n\n MEMBER BANNED: ${responseMessage} \n\n.`);
            }
        }
        else 
        {
            await message.channel.send(`${devMessage} banning failed as ${banningTargetUsername} with ID ${banningTargetID} is unbannable or unkickable`);
        }        
    }
}

module.exports = {
    name: 'ban',
    description: 'ban a player',
    execute: ban
}