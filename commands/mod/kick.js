
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const dbController = require('../../util/dbController/controller');
const util = require('../../util/util');
const utility = require('../utility/utility');
const Discord = require('discord.js');

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

        const kickingTarget = argument.userInDiscord;
        const kickingTargetUsername = kickingTarget.displayName;
        const kickingTargetID = kickingTarget.id;
        const kickReason = argument.reason;

        if (kickingTarget.kickable) // the target can be banned 
        {
            await kickingTarget.kick(kickReason);
            // go to db and remove the target
            await dbController.deleteUser(kickingTargetID);

            const responseMessage = `${devMessage} ${kickingTarget} with ID ${kickingTargetID} is kicked due to ${kickReason}`;

            await message.channel.send(responseMessage);

            const statusChannel = server.serverChannels.find(ch => ch.id === process.env.channelForServerStatus);
            if (!statusChannel) 
            {
                await message.channel.send(`${devMessage} This channel ${process.env.channelForServerStatus} does not exist`);
            }
            else 
            {
                await statusChannel.send(```.\n\n MEMBER KICKED:${responseMessage} \n\n.```);
            }
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