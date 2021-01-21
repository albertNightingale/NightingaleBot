const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""
const index = require('../index');

const Discord = require('discord.js');

/**
 * check if the message author has the permission to send this message
 * @param {Message} message from discord
 */
exports.hasAdminPermission = function(message)
{
    const modRoles = process.env.discordModRoleID.split(/,/)
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
    if (level >= 160)
        return process.env.level160RoleID;
    else if (level >= 120)
        return process.env.level120RoleID;
    else if (level >= 90)
        return process.env.level90RoleID;
    else if (level >= 70)
        return process.env.level70RoleID;
    else if (level >= 50)
        return process.env.level50RoleID;
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
 * lower the rank
 * @param {number} level
 */
exports.getLoweredRole = function(level)
{
    if (level >= 50)
    {
        if (level >= 160)
            return process.env.level70RoleID;
        else if (level >= 120)
            return process.env.level50RoleID;
        else if (level >= 90)
            return process.env.level30RoleID;
        else if (level >= 70)
            return process.env.level20RoleID; 
        else if (level >= 50)
            return process.env.level10RoleID;
    }
    return undefined;
}

/**
 * lower the rank
 * @param {number} level
 */
exports.getLoweredRoleLevel = function(level)
{
    if (level >= 50)
    {
        if (level >= 160)
            return 70;
        else if (level >= 120)
            return 50;
        else if (level >= 90)
            return 30;
        else if (level >= 70)
            return 20; 
        else if (level >= 50)
            return 10;
    }
    return undefined;
}

/**
 * send a status message to the status channel
 * @param {Discord.MessageEmbed} embed 
 */
exports.sendToStatusChannel = async function(embed) {
    const statusChannel = (await exports.getGuildInformation()).serverChannels.find(ch => ch.id === process.env.channelForServerStatus);

    if (!statusChannel) {
        console.error('status channel does not exist ');
    }
    else     
    {
        await statusChannel.send(embed);
    }
}


/**
 * generate the custom built server object containing 
 * all the guild informations needed
 * 
 * { serverName, serverOwner, serverChannels, serverRoles, serverMembers }
 * 
 * @returns {Function} aync function that returns a promise of a constructed guild
 */
exports.getGuildInformation = (function ()
{
    let guildInformation = undefined;
    
    // if timerIsUp is true, it will automatically update, normally it is automatically undefined
    return async function(timerIsUp) 
    {
        if (guildInformation === undefined || timerIsUp)
        {
            /**
             * @type {Discord.Guild} guild
             */
            const guild = index.theGuild();

            const serverName = guild.name; // string
            const serverOwner = guild.name; // GuildMember 
            
            const serverChannels = guild.channels.cache.map(channel => channel );
        
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
        
            guildInformation = { serverName, serverOwner, serverChannels, serverRoles, serverMembers };
        }

        return guildInformation;
    }
})();