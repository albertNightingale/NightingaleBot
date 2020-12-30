const config = require('../config');
const Discord = require('discord.js');
const index = require('../index');
const dbController = require('../util/dbController/controller');

const numberOfLeaders = 5; 
const ONEDAY = 60 * 60 * 1000 * 24; 

module.exports = {
    name: 'dailyLeaderPost',
    description: 'send leaderboard post to a specific channel that contains the top five participants', 
    execute: sendLeaderboardPost,
    executeIntervals : ONEDAY
}

async function sendLeaderboardPost(client) {
    const channelToSend = client.channels.cache.find( channel => channel.id === process.env.channelForDailyRanks )
    const now = new Date(Date.now());
    
    const guild = index.theGuild();
    const serverMembers = (await guild.members.fetch()).map( member => member );
    const listFromDatabase = await dbController.findByLvl(numberOfLeaders);
    const leaderBoard = [];

    listFromDatabase.forEach( databaseMember => {
        const discordMember = serverMembers.find(discordMember => discordMember.id === databaseMember.userId); 
        if (discordMember) 
        {
            leaderBoard.push({
                    memberInDiscord: discordMember,
                    memberInDB: databaseMember
                });
        }
        else {
            leaderBoard.push({
                memberInDiscord: {
                    displayName: databaseMember.userId
                },
                memberInDB: databaseMember
            });
        }
    });
    const { ranking, members, levels } = generateList(leaderBoard);

    console.log(ranking)
    console.log(members)
    console.log(levels)

    const exampleEmbed = new Discord.MessageEmbed()
        .setTitle(`Ranking Leaderboard on ${now.toDateString()}`)
        .setThumbnail(config.logoIconLink)
        .addFields(
            { name: 'ranking', value: ranking, inline: true },
            { name: 'Member', value: members, inline: true },
            { name: 'Levels', value: levels, inline: true },
        )
        .setFooter('Some footer text here', config.logoIconLink);
    
    channelToSend.send(exampleEmbed);
}

function generateList(leaderBoard)
{
    let rank = 1;
    const delimiter = '\n';
    const rankingArray = [];
    const membersArray = [];
    const levelsArray = [];
    
    for (let idx = 0; idx < leaderBoard.length; idx++){

        const leader = leaderBoard[idx];
        const name = leader.memberInDiscord.displayName;
        const level = leader.memberInDB.level;

        rankingArray.push(rank);
        membersArray.push(name);
        levelsArray.push(level);
        rank++;
    }

    return {
        ranking: rankingArray.join(delimiter),
        members: membersArray.join(delimiter),
        levels: levelsArray.join(delimiter)
    }
}



