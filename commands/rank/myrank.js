///// Summary: sending message to the request of the rank information
///        - send the level and the corresponding role of the requester

/// !myrank

const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const Discord = require('discord.js');
const logoIconLink = require('../../config')['logoIconLink'];

const util = require('../../util/util');
const databaseController = require('../../util/dbController/controller')

async function myrank(message, args, attachments) {

    const user = await processArguments(message, args);
    const server = await util.getGuildInformation();

    if (!user) return;

    const guildUser = user.userInDiscord;
    const dbUser = user.userInDB; // User object from database
    const username = user.userInDiscord.displayName; // string user nickname

    if (!dbUser) // database does not have userInDB, create a row in database
    {
        await message.channel.send(`${devMessage}You only joined the server recently, meaning you can only participate in the next ranking season. `);
        return;
    }
    else if (!util.hasMemberRole(guildUser)) {
        await message.channel.send(`${devMessage}You are removed from this season, please wait until the next ranking season. `);
        return;
    }

    const currentLevel = dbUser.level; // int level
    const rankRoleIDOfUser = util.determineRole(currentLevel); // string rank role id 
    const roleName = server.serverRoles.find(role => role.id === rankRoleIDOfUser).name; // string name of the role

    const messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${devMessage}rank for ${username}`)
        .setThumbnail(logoIconLink)
        .addFields(
            { name: '   name', value: username, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '   role', value: roleName, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: '   current Level', value: currentLevel },
        )
        .setTimestamp()
        .setFooter('Nightingale Server', logoIconLink);

    await message.channel.send(messageEmbed);

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