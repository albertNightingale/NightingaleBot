///// Summary: sending message to the request of the rank information
///        - send the level and the corresponding role of the requester

/// !myrank

const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const Discord = require('discord.js');
const logoIconLink = require('../../config')['logoIconLink'];

const User = require('../../models/discordUser')
const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller') 

async function myrank(message, args, attachments) {

    const user = await processArguments(message, args);
    const server = util.getGuildInformation(message);

    if (!user) {
        return;
    }
    else 
    {
        let dbUser = user.userInDB; // User object from database
        const userNickname = user.userInDiscord.nickname; // string user nickname
        let currentLevel = 1
        if (!dbUser) // database does not have userInDB, create a row in database
        {
            dbUser = new User({
                userId : user.userInDiscord.id, 
                level : 1,
                isMember : true,
                memberSince : Date.now()
            });
            await databaseController.addUser(dbUser)       
        }
        else {
            currentLevel = dbUser.level; // int level
        }

        const rankRoleIDOfUser = util.determineRole(currentLevel); // string rank role id 
        const roleName = server.serverRoles.find(role => role.id === rankRoleIDOfUser).name; // string name of the role
        const memberRole = user.userInDiscord.roles.cache.find(role => role.id === process.env.memberRoleID);  // a role
        if (!memberRole) // check if it has members role            
            roleName = 'no role';

        const messageEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`rank for ${userNickname}`)
            .setThumbnail(logoIconLink)
            .addFields(
                { name: '   name', value: userNickname, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: '   role', value: roleName, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: '   current Level', value: currentLevel },
            )
            .setTimestamp()
            .setFooter('Nightingale Server', logoIconLink);

        message.channel.send(messageEmbed);
    }
}

/**
 * processing arguments from the discord command
 * @param {Discord.Message} message the message object
 * @param {Array<String>} args the argument content
 * @returns {Object} an object that holds the userInDiscord, userInDB
 */
async function processArguments(message, args) {
    // the author of the message
    const author = message.member; // a guildMember

    if (author) {
        const userInDB = await databaseController.findUser(author.id);
        return ({
            userInDiscord: author, // GuildMember object in Discordjs
            userInDB: userInDB // user model in database model
        });
    }

    return undefined;
}

/**********          Export          **********/
module.exports = {
    name: 'myrank',
    description: 'retrieve my rank',
    execute: myrank
}