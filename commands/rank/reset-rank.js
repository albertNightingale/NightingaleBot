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
const databaseController = require('../../util/dbController/controller'); 
const { DiscordAPIError, GuildMember } = require('discord.js');

async function resetRank(message, args, attachments)
{
    if(!util.hasAdminPermission(message)) return;

    const server = await util.getGuildInformation();
    

    //// for every user in the server
    // check if that user exists in database, 
    // if not existing, then add that user in
    // if the user exists in the database, set the user level to 1, set member to true
    //      if the user have any non-member rank roles, remove them as well
    /**
     * @type {GuildMember[]} memberList
     */
    const memberList = server.serverMembers;
    console.log('member count, ', memberList.length);

    // vip members are those with high ranks, their ranks will get lowered instead of losing all the ranks
    const vipMembers = [];
    for(const member of memberList)
    {
        let userFromDB = await databaseController.findUser(member.id); 
        if (!userFromDB) // if the model does not exist in the databse, add that user in
        {
            console.log('not found: ' + member.id)
            userFromDB = new User({
                userId : member.id, 
                level : 1,
                isMember : true,
                memberSince : Date.now()
            });
            await databaseController.addUser(userFromDB);
            
        }
        else 
        {
            const currentLevel = userFromDB.level;

            const rankRoleID = util.determineRole(currentLevel)
            const isMemberRole = (rankRoleID === process.env.memberRoleID); // is the user in memberRole
            if (!isMemberRole) // if is non-member role, then remove that role           
                await member.roles.remove( rankRoleID ); // remove the member role

            // if level is higher than 50, lower the level
            if (currentLevel >= 30)
            {
                vipMembers.push(
                    {
                        id : member.id,
                        oldlvl : currentLevel,
                        lvl : util.getLoweredRoleLevel(currentLevel),
                    }
                );
                const newRoleID = util.getLoweredRole(currentLevel);
                await member.roles.remove( newRoleID ); // add the member role
            }
        }
        
        if (!util.hasMemberRole(member)) // if not have member role, then add
            await member.roles.add(process.env.memberRoleID); // remove the member role
    }

    await databaseController.derankAll();
    
    for (const { id, oldlvl, lvl } of vipMembers)
    {
        await databaseController.levelUp(id, oldlvl - lvl );
    }
    
    await message.channel.send(`${devMessage}resetted rank for everyone!`); 
}



/**********          Export          **********/
module.exports = {
    name: 'reset-rank',
    description: 'reset all the ranks',
    execute: resetRank
}
