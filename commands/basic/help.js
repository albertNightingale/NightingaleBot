const dotenv = require('dotenv');
dotenv.config();

const logoIconLink = require('../../config')['logoIconLink'];
const Discord = require('discord.js');

const devMessage = process.env.Dev ? "Dev mode: " : ""

module.exports = {
    name: 'help', 
    description: 'for support', 
    execute: execute
}


function execute(message, args, attachments) {

    let isMutedRole = message.member.roles.cache.find( role => role.id === process.env.muteRoleID )
    if (!isMutedRole) // only accept it if it has a bot
    {
        if (!args)
        {
            sendFullDetail(message);
        }
        else 
        {
            const messageToSend = processArgs(args); // args will tell the type of command to send
        }
    }
}

function processArgs(args)
{
    switch (args)
    {

    }
}

function sendFullDetail(message)
{
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
        .setFooter('Nightingale Server', logoIconLink);

    await message.channel.send(devMessage, messageEmbed);
}