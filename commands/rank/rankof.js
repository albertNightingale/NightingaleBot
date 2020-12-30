const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const dbController = require('../../util/dbController/controller');
const util = require('../../util/util');
const Discord = require('discord.js');
const logoIconLink = require('../../config')['logoIconLink'];

/**********          Export          **********/
module.exports = {
    name: 'rankof',
    description: 'display the rank for a player',
    execute: rankOf
}


async function rankOf(message, args, attachments)
{
    const member = await processArgument(message, args);
    const server = await util.getGuildInformation(message);

    if (member)
    {
        if (member.userInDB)
        {
            if (member.userInDB.isMember) 
            {
                const username = member.userInDiscord.displayName;
                const currentLevel = member.userInDB.level;
                const rankRoleIDOfUser = util.determineRole(currentLevel); // string rank role id 
                const roleName = server.serverRoles.find(role => role.id === rankRoleIDOfUser).name; // string name of the role

                const messageEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${devMessage}rank for ${username}`)
                .setThumbnail(logoIconLink)
                .addFields(
                    { name: '   name', value: username, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '   role', value: roleName },
                    { name: '\u200B', value: '\u200B' },
                    { name: '   current Level', value: currentLevel },
                    { name: '\u200B', value: '\u200B' },
                )
                .setTimestamp()
                .setFooter('Nightingale Server', logoIconLink);

                await message.channel.send(messageEmbed);
            }
            else 
            {
                await message.channel.send(`${devMessage} this member is deranked`);
            }
        }
        else 
        {
            await message.channel.send(`${devMessage} this member is not a part of the participants of this season`);
        }
    }
}


async function processArgument(message, args) {
    
    let memberFromDiscordToLookup = undefined;

    if (message.mentions.members.size) 
    {
        memberFromDiscordToLookup = message.mentions.members.array()[0];
    }
    else 
    {
        memberFromDiscordToLookup = message.member;
    }   

    const memberID = memberFromDiscordToLookup.id;
    const memberInDB = await dbController.findUser(memberID);

    return ({
        userInDiscord: memberFromDiscordToLookup, // GuildMember object in Discordjs
        userInDB: memberInDB // user model in database model
    });
}