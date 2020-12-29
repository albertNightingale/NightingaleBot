const config = require('../config');
const Discord = require('discord.js');
const ONEDAY = 60 * 60 * 1000 * 24; 

module.exports = {
    name: 'dailyLeaderPost',
    description: 'send leaderboard post to a specific channel that contains the top five participants', 
    execute: sendLeaderboardPost,
    executeIntervals : ONEDAY
}

function sendLeaderboardPost(client) {
    const channelToSend = client.channels.cache.find( channel => channel.id === process.env.channelForDailyRanks )
    
    const now = new Date(Date.now());

    const exampleEmbed = new Discord.MessageEmbed()
        .setTitle(`Ranking Leaderboard as of ${now.toDateString()} ${now.toTimeString()}`)
        .setThumbnail(config.logoIconLink)
        .addFields(
            { name: 'ranking', value: '1\n2\n3\n4\n5', inline: true },
            { name: 'Players', value: 'Player 1\nPlayer 2\nPlayer 3\nPlayer 4\nPlayer 5', inline: true },
            { name: 'Levels', value: '12\n10\n9\n9\n8', inline: true },
        )
        .setFooter('Some footer text here', config.logoIconLink);
    
    channelToSend.send(exampleEmbed);
}




