const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

module.exports = {
    name: 'ping', 
    description: 'ping commands', 
    execute: (message, args) => {

        let role = message.member.roles.cache.find( role => role.name === "@everyone" )
        if (role) // only accept it if it has a bot
        {
            message.channel.send(`${devMessage} pong!`); 
        }
    }
}