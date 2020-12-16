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