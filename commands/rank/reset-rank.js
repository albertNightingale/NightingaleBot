///// Summary: resetting the rank for all discord users
///        - setting the level of discord users to level 1
///        - removing all the rank roles of members 
///        - giving everyone in discord server the member role
///        - display to the chat the status of the last rank

const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const User = require('../../models/discordUser')
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller') 

async function resetRank(message, args, attachments)
{
    if(!util.hasAdminPermission(message)) return;

    const server = util.getGuildInformation(message);

    //// for every user in the server
    // check if that user exists in database, 
    // if not existing, then add that user in
    // if the user exists in the database, set the user level to 1, set member to true
    //      if the user have any non-member rank roles, remove them as well

    const memberList = server.serverMembers;

    for(let idx = 0; idx < memberList.length; idx++)
    {
        const member = memberList[idx];
        let userFromDB = databaseController.findUser(member.id); 
        if (!userFromDB) // if the model does not exist in the databse, add that user in
        {
            userFromDB = new User({
                userId : user.userInDiscord.id, 
                level : 1,
                isMember : true,
                memberSince : Date.now()
            });
            await databaseController.addUser(userFromDB)    
        }
        
        const currentLevel = userFromDB.level;
        const rankRoleID = util.determineRole(currentLevel)
        const isMemberRole = rankRoleID === process.env.memberRoleID; // is the user in memberRole
        if (!isMemberRole) // if is non-member role, then remove that role           
            await member.roles.remove( rankRoleID ); // remove the member role
        
        const hasMemberRole = member.roles.cache.find( role => role.id === process.env.memberRoleID );  // a role object
        if (!hasMemberRole) // if not have member role, then add
            await guildUser.roles.add(process.env.memberRoleID ); // remove the member role
    }

    await databaseController.derankAll();
    await message.channel.send('resetted rank for everyone!'); 
}



/**********          Export          **********/
module.exports = {
    name: 'reset-rank',
    description: 'reset all the ranks',
    execute: resetRank
}
