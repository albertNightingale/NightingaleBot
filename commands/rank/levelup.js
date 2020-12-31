///// Summary: send a request to level up user
///        - set that user's role to the next role if he/she meets the requirement
///        - automatically change user's role after reaching a certain role

// !level-up 12 invite @player 
// !level-up 12 invite @player 
// !level-up 12 invite @player 
// !level-up 12 invite @player 


const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser');
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller');

async function levelUp(message, args, attachments) {
    if (!util.hasAdminPermission(message)) return;
    const argumentResponse = await processArguments(message, args);

    if (!argumentResponse) return;

    const guildUser = argumentResponse.userInDiscord;
    const dbUser = argumentResponse.userInDB;

    // database does not have userInDB or the discord member does not have member role, the member cannot participate
    if (!dbUser || !util.hasMemberRole(guildUser)) {
        await message.channel.send(`${devMessage}this user cannot participate until the next ranking season`);
        return;
    }

    const previousLevel = dbUser.level;
    const currentLevel = previousLevel + argumentResponse.levelRequested;
    // level the user up inside of the database
    await databaseController.levelUp(dbUser.userId, argumentResponse.levelRequested);

    // after level up, check if the current level is matching the right role
    const roleBefore = util.determineRole(previousLevel);
    const isMemberRole = (roleBefore === process.env.memberRoleID); // is the user in memberRole
    if (!isMemberRole) // if is not non-member role, then remove that role    
        await guildUser.roles.remove(roleBefore); // remove the row before

    const roleNow = util.determineRole(currentLevel);
    await guildUser.roles.add(roleNow); // add the row now

    await message.channel.send(`${devMessage}leveled ${guildUser.displayName} up to ${currentLevel} for ${argumentResponse.levelUpReason}`);
}

/**
 * processing arguments from the discord command
 * @param {Discord.Message} message the message object
 * @param {Array<String>} args the argument content
 * @returns {Object} an object that holds the userInDiscord, userInDB, levelRequested, levelUpReason
 */
async function processArguments(message, args) {
    if (args === undefined || args.length < 3) {
        console.log(`${devMessage}No arguments passed`);
        return undefined;
    }
    else {  // the user list of the target
        const targetsArray = message.mentions.members.map(user => user);

        if (targetsArray.length > 0) {
            const user = targetsArray[0];
            const levelRequested = parseInt(args[0]);
            if (Number.isNaN(levelRequested)) levelRequested = 1;
            const userInDB = await databaseController.findUser(user.id);

            return ({
                ÍÎ: user, // GuildMember object in Discordjs
                userInDB: userInDB, // user model in database model
                levelRequested: levelRequested, // string level requested
                levelUpReason: args[1], // reason for level up
            });
        }
        return undefined;
    }
}

/**********          Export          **********/
module.exports = {
    name: 'levelup',
    description: 'level up a player',
    execute: levelUp
}


