const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js'); // initialializing disord apis
const client = new Discord.Client(); // initializing a discord bot

// set up the files
const fs = require('fs'); 
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
commandFiles.forEach( file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command); 
})

// whenever client is ready, run this code
client.once('ready', 
    () => {
        console.log("logged in as " + client.user.username); 
    }
);

// log in with the token 
console.log(process.env.token)
client.login(process.env.token); 

// command prefix 
const prefix = '!';

client.on('message', message => {

    console.log("Message: ", message.content)

    if (message.author.bot) 
    {   
        // if the message author is not a bot
        return;
    }
    else if (message.mentions.members.size==0 || message.mentions.members.filter(member => member.id === client.user.id).size==0 ) 
    {   // if it is not mentioning the bot. 
        return;
    }
    else if (!message.content.includes(prefix)) 
    {   // if the message content does not start with the prefix (not a command). 
        return; 
    }

    // normalize the command
    // parse out the attachment, arguments, and the command
    const attachments = message.attachments.array(); 
    console.log("\tattachments amount: ", attachments.length); 
    const args = message.content.replace("<@!" + client.user.id + ">", "").trim().split(/ +/); // split out arguments following the command  
    console.log("\targs: ", args); 
    let command = args.shift().toLowerCase();  
    console.log("\tcommand: ", command);

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