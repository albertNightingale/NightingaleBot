module.exports = {
    name: 'ping', 
    description: 'ping commands', 
    execute: (message, args) => {

        let role = message.member.roles.cache.find( role => role.name === "sample" )
        if (role) // only accept it if it has a bot
        {
            message.channel.send('pong!'); 
        }
    }
}