const Discord = require('discord.js'); // initialializing disord apis
const client = new Discord.Client(); // initializing a discord bot

const fs = require('fs'); 
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
commandFiles.forEach( file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command); 
})

// whenever client is ready, run this code
client.once('ready', () => {
    console.log("logged in as " + client.user.username); 
    console.log("user object: ");
    console.log(client.user); 
});

// log in the token // TODO: replace the token with a path and place the token in a file
client.login("NzYxNjkyMDMyMzY3NTkxNDc1.X3eS_A.Owi4O8ASea-2hbhgyq85-SDAayc"); 

// coding prefix 
const prefix = '!';

client.on('message', message => {

    console.log("Message: ", message.content)
    if (message.author.bot) 
    {   
        // if the message author is not a bot
        // console.log("message processing ended: ", 1)
        return;
    }
    else if (message.mentions.members.size==0 || message.mentions.members.filter(member => member.id === client.user.id).size==0 ) 
    {   
        // if it is not mentioning the bot. 
        // console.log("message processing ended: ", 2)
        return;
    }
    else if (!message.content.includes(prefix)) {
        // if the message content does not start with the prefix (not a command). 
        // console.log("message processing ended: ", 3)
        return; 
    }

    // normalize the command
    // parse out the attachment, arguments, and the command
    const attachments = message.attachments.array(); 
    console.log("attachments amount: ", attachments.length); 
    const args = message.content.replace("<@!" + client.user.id + ">", "").trim().split(/ +/); // split out arguments following the command  
    console.log("args: ", args); 
    let command = args.shift().toLowerCase();  
    console.log("command: ", command);

    switch (command) {
        case '!ping': 
            client.commands.get(command.slice(prefix.length)).execute(message, args); 
            break;
        case '!teleport-building': 
            client.commands.get(command.slice(prefix.length)).execute(message, args, attachments); 
            break;
        default: 
            console.log("invalid command: " + command); 
    };
});