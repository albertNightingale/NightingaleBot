///// Summary: derank a user
///        - set that user's level to one
///        - remove that user's role on member

const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const message = require('discord.js')
const databaseController = require('../../util/dbController/controller');

const User = require('../../models/discordUser');

const util = require('../../util/util');

// !derank @username @username @username
async function derankHandler(message, args, attachments) {

    if(!util.hasAdminPermission(message)) return;
    
    const listOfTargets = await processArguments (message, args);

    for (let idx = 0; idx < listOfTargets.length; idx++)
    { 
        const guildUser = listOfTargets[idx].userInDiscord;
        let dbUser = listOfTargets[idx].userInDB;
        if (!dbUser) // database does not have userInDB, create a row in database
        {
            dbUser = new User({
                userId : guildUser.id, 
                level : 1,
                isMember : false,
                memberSince : Date.now()
            });
            await databaseController.addUser(dbUser)       
        }
        else {
            await databaseController.derankOne(dbUser.userId);
        }

        // remove all the existing rank roles
        const roleAsOfNow = util.determineRole(dbUser.level) // a string roleID

        await guildUser.roles.remove(roleAsOfNow);
        const memberRole = guildUser.roles.cache.find( role => role.id === process.env.memberRoleID );  // a role
        if (memberRole) // check if it has members role            
            await guildUser.roles.remove(process.env.memberRoleID ); // remove the member role
    }

    await message.channel.send("derank complete");
}

/**
 * processing arguments from the discord command
 * @param {Discord.Message} message the message object
 * @param {Array<String>} args the argument content
 * @returns {Array<Object>} targetsToDerank is a list of objects wrapping discord users and database users
 */
async function processArguments (message, args)
{
    if (args === undefined || args.length === 0)
    {
        console.log(`${devMessage}No arguments passed`);
        return undefined;
    }
    else {  // the user list of the target
        const targetsArray = message.mentions.members.map( user => user);
        let targetsToDerank = []
        for (let idx = 0; idx < targetsArray.length; idx++)
        {
            const user = targetsArray[idx];
            const userInDB = await databaseController.findUser(user.id);
            targetsToDerank.push({
                userInDiscord: user, // GuildMember object in Discordjs
                userInDB: userInDB, // user model in database model
            });
        }
        return targetsToDerank;
    }
}



/**********          Export          **********/
module.exports = {
    name: 'derank',
    description: 'derank a user',
    execute: derankHandler
}

