const dotenv = require('dotenv');
dotenv.config();

const devMessage = process.env.Dev ? "Dev mode: " : ""

module.exports = {
    name: 'dada', 
    description: 'test commands', 
    execute: (message, args) => {

        let role = message.member.roles.cache.find( role => role.id === process.env.everyoneRole )
        if (role) // only accept it if it has a bot
        {
            message.channel.send(`${devMessage} Dada!`); 
        }
    }
}