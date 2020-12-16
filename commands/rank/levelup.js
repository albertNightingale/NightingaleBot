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


const message = require('discord.js')
const databaseController = require('../../util/dbController/controller');

const User = require('../../models/discordUser');
const util = require('../../util/util');
const dbController = require('../../util/dbController/controller');

async function levelUp(message, args, attachments)
{
    if (!util.hasAdminPermission(message)) return;
    
    const argumentResponse = await processArguments(message, args);
    if (argumentResponse)
    {
        let previousLevel = 0; 
        let currentLevel = 0;
        const guildUser = argumentResponse.userInDiscord;
        let dbUser = argumentResponse.userInDB;

        if (!dbUser) // database does not have userInDB, create a row in database
        {
            previousLevel = 1;
            currentLevel = 1 + argumentResponse.levelRequested;
            dbUser = new User({
                userId : guildUser.id, 
                level : currentLevel,
                isMember : true,
                memberSince : Date.now()
            });
            await databaseController.addUser(dbUser)       
        }
        else 
        {
            previousLevel = dbUser.level;
            currentLevel = previousLevel + argumentResponse.levelRequested;
            await databaseController.levelUp(dbUser.userId, argumentResponse.levelRequested);
        }

        // after level up, check if the current level is matching the right role
        const roleBefore = util.determineRole(previousLevel);
        const roleNow = util.determineRole(currentLevel);
        await guildUser.roles.remove(roleBefore);
        await guildUser.roles.add(roleNow);

        const hasMemberRole = guildUser.roles.cache.find( role => role.id === process.env.memberRoleID ); 
        if (!hasMemberRole) // check if it has members role            
            await guildUser.roles.add(process.env.memberRoleID ); // remove the member role
        
        await message.channel.send(`leveled ${guildUser.nickname} up to ${currentLevel} for ${argumentResponse.levelUpReason}`);
    }
}

/**
 * processing arguments from the discord command
 * @param {Discord.Message} message the message object
 * @param {Array<String>} args the argument content
 * @returns {Array<Object>} targetsToDerank is a list of objects wrapping discord users and database users
 */
async function processArguments (message, args)
{
    if (args === undefined || args.length < 3)
    { 
        console.log(`${devMessage}No arguments passed`);
        return undefined;
    }
    else 
    {  // the user list of the target
        const targetsArray = message.mentions.members.map( user => user );

        if (targetsArray.length > 0)
        {
            const user = targetsArray[0];
            const levelRequested = parseInt(args[0]);
            if (Number.isNaN(levelRequested)) levelRequested = 1;
            const userInDB = await databaseController.findUser(user.id);

            return ({
                userInDiscord: user, // GuildMember object in Discordjs
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


