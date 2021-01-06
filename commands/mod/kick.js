
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const dbController = require('../../util/dbController/controller');
const util = require('../../util/util');
const utility = require('../utility/utility');
const statusME = require('../../util/buildMessageEmbed/statusME');
const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Message} message 
 * @param {*} args 
 * @param {*} attachment 
 */
async function kick(message, args, attachment) {
    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await utility.processArguments(message, args, 1);

        if (!argument) 
        {
            await message.channel.send(`${devMessage} kicking failed as the argument is incomplete`);
            return;
        }

        const kickedBy = message.member;
        const kickingTarget = argument.userInDiscord;
        const kickingTargetUsername = kickingTarget.displayName;
        const kickingTargetID = kickingTarget.id;
        const kickReason = argument.reason;

        if (kickingTarget.kickable) // the target can be banned 
        {
            await kickingTarget.kick(kickReason);
            // go to db and remove the target
            await dbController.deleteUser(kickingTargetID);

            const responseMessage = `${devMessage} ${new Date(Date.now())} : ${kickingTarget} with ID ${kickingTargetID} is kicked due to ${kickReason}`;

            await message.channel.send(responseMessage);

            await util.sendToStatusChannel(statusME.onMemberKick(kickedBy, kickingTarget, kickReason));
        }
        else 
        {
            await message.channel.send(`${devMessage} kickable failed as ${kickingTargetUsername} with ID ${kickingTargetID} is unkickable`);
        }
    }
}

module.exports = {
    name: 'kick',
    description: 'kick a player',
    execute: kick
}