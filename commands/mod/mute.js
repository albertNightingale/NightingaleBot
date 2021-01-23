const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const utility = require('../utility/utility');
const databaseController = require('../../util/dbController/controller');
const statusME = require('../../util/buildMessageEmbed/statusME');


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
        const argument = await utility.processArguments(message, args, 1);

        if (!argument) 
        {
            await message.channel.send(`${devMessage} muting failed as the argument is incomplete`);
            return;
        }

        const mutedBy = message.member;

        const currentTime = new Date(Date.now()); 
        const muteRoleID = process.env.muteRoleID;
        const muteTarget = argument.userInDiscord;
        const muteTime = argument.time;
        const muteReason = argument.reason;

        const rolesOfTarget = muteTarget.roles.cache.map( role => role );

        for (const roleOfTarget of rolesOfTarget)
            if (roleOfTarget.id !== process.env.everyoneRoleID)
                await muteTarget.roles.remove(roleOfTarget.id);

        await muteTarget.roles.add(muteRoleID);

        await message.channel.send(`${devMessage}muted ${muteTarget} for ${muteTime} hours due to ${muteReason}`);

        await util.sendToStatusChannel(statusME.onMemberMute(mutedBy, muteTarget, muteReason, muteTime, utility.whenItEnd(currentTime, muteTime)));

        if (muteTime !== 0)
        {
            const muteTimeInMilliseconds = muteTime * 1000 * 60 * 60;

            // set a timer to await
            setTimeout( async() => {
                for (const rolOfTarget of rolesOfTarget)
                    if (rolOfTarget.id !== process.env.everyoneRoleID)
                        await muteTarget.roles.add(rolOfTarget.id);
                muteTarget.roles.remove(muteRoleID)
                .then(res => console.log(`${new Date(Date.now())} unmuted for ${muteRoleID} `))
                .catch(err => console.error(err));
            }, muteTimeInMilliseconds);
        }
    }
}

module.exports = {
    name: 'mute',
    description: 'mute a player',
    execute: mute
}
