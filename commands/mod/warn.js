const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const utility = require('../utility/utility');

async function warn(message, args, attachment) {

    if (util.hasAdminPermission(message))
    {
        const server = await util.getGuildInformation();
        const argument = await utility.processArguments(message, args, 1);
        if (argument)
        {
            const warnReason = argument.reason;
            await message.channel.send(`${devMessage} ${argument.userInDiscord} is warned for ${warnReason}`);
        }
    }
}
module.exports = {
    name: 'warn',
    description: 'warn a player',
    execute: warn
}