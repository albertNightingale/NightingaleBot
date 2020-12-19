const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

/**
 * check if the message author has the permission to send this message
 * @param {Message} message from discord
 */
exports.hasAdminPermission = function(message)
{
    const modRoles = process.env.devastModRoleID.split(/,/)
    let rolesWithPermission = message.member.roles.cache.find(role => modRoles.includes(role.id))

    if (!rolesWithPermission)
        return false;
    return true;
}


/**
 * Return true if the guildUser passed in through the parameter into has a member role. 
 * @param {GuildUser} guildUser 
 */
exports.hasMemberRole = function (guildUser) {
    const hasMemberRole = guildUser.roles.cache.find( role => role.id === process.env.memberRoleID ); 
    if (!hasMemberRole)             
        return false;
    else 
        return true;
}

/**
* based on the level determine the role of the user
* @param {Number} level the level of the user in integer  
* @returns {String} current_role of the user in string
*/
exports.determineRole = function (level) {
   if (level >= 80)
       return process.env.level80RoleID;
   else if (level >= 60)
       return process.env.level60RoleID;
   else if (level >= 40)
       return process.env.level40RoleID;
   else if (level >= 30)
       return process.env.level30RoleID;
   else if (level >= 20)
       return process.env.level20RoleID;
   else if (level >= 10)
       return process.env.level10RoleID;
   else 
       return process.env.memberRoleID;
}

/**
 * generate the custom built server object containing 
 * all the guild informations needed
 * @param {Discord.Message} message 
 */
exports.getGuildInformation = async function (message)
{
    const guild = message.guild;

    const serverName = guild.name; // string
    const serverOwner = guild.name; // GuildMember 
    
    const serverChannels = guild.channels.cache.map(channel => {
        return {
            id : channel.id, // string id of the channel
            name : channel.name, // string name of the channel
            createdAt : channel.createdAt, // Date when the channel is created
            channelType: channel.type, // text of the type of the channel
            members: channel.members.map( member => member ) // a list of GuildMember
        }
    });

    // an array of reconstructed roles object
    const serverRolesMap = new Map();
    
    guild.roles.cache.forEach( role => {
        serverRolesMap.set(role.id, {
            id : role.id, // string id of the role
            name: role.name, // string name of the role
            members : [] // string a list of GuildMember
        });
    })

    // an array of server members
    const serverMembers = (await guild.members.fetch()).map( member => member );

    // processing this array of members, take the list roles of individual members, add the member to the corresponding role of the serverRolesMap
    serverMembers.forEach( member => {
        const memberRoles = member.roles.cache.map(role => role)
        memberRoles.forEach( role => {
            serverRolesMap.get(role.id).members.push(member);
        });
    });

    const serverRoles = [];
    serverRolesMap.forEach((value, key) => {
        serverRoles.push(value)
    });

    return { serverName, serverOwner, serverChannels, serverRoles, serverMembers };
}