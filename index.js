// environmental variable import
const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

// discord imports
const Discord = require('discord.js'); // initialializing disord apis
const client = new Discord.Client(); // initializing a discord bot

// mongoose and database imports
const mongoose = require('mongoose');
const dbseeding = require('./util/dbController/dbseeding');

// file stream for command files reading
const fs = require('fs'); 

// utility
const util = require('./util/util')

// command prefix 
const prefix = '!';

////// set up the command based files
client.commands = new Discord.Collection();
const basicFileDir = './commands/basic/';
setCommandFiles(basicFileDir);
const devastFileDir = './commands/devast/';
setCommandFiles(devastFileDir);
const rankFileDir = './commands/rank/';
setCommandFiles(rankFileDir);

////// connecting DB
const connectInfo = process.env.DBConnectionString; 
connectDB(); 

//// user log in
logIn();

//// client event handler
client
.once('ready', () => console.log("logged in as " + client.user.username) )
.on('message', message => {
    console.log("Message: ", message.content)
    if(!validateMessage(message)) return;

    const { attachments, args, normalizedCommand } = processMessage(message);
    executeCommand(normalizedCommand, message, args, attachments)
    .then()
    .catch(err => console.log(err));
});

/// validating the message
function validateMessage(message)
{
    // Ignore messages that aren't from a guild
    if (!message.guild) 
        return;
  
    if (message.author.bot)         // if the message author is not a bot
        return false;    

    // if the message content does not start with the prefix (not a command). 
    if (!message.content.includes(prefix)) 
        return false; 
    
    return true;    
}

/// processes the message and return the attachments, arguments, and the normalizedCommand
function processMessage(message)
{
    // parse out the attachment, arguments, and the command
    const attachments = message.attachments.array(); 
    console.log("\tattachments amount: ", attachments.length); 
    const args = message.content.replace("<@!" + client.user.id + ">", "")
                                .replace("<@" + client.user.id + ">", "")
                                .trim().split(/ +|=|:/); // split out arguments following the command, split by ' ' or = or :
    console.log("\targs: ", args); 
    const normalizedCommand = args.shift().toLowerCase() // convert all to lowercase
    console.log("\tcommand: ", normalizedCommand);

    return { attachments, args, normalizedCommand }
}

/// based on the normalizedCommand, calling the corresponding method
async function executeCommand(normalizedCommand, message, args, attachments)
{
    switch (normalizedCommand) {
        case '!dada': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args); 
            break;
        case '!teleport-building': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        case '!delete-record': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        case '!derank': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        case '!levelup': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        case '!myrank': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        case '!reset-rank': 
            await client.commands.get(normalizedCommand.slice(prefix.length)).execute(message, args, attachments); 
            break;
        default: 
            console.log("invalid command: " + normalizedCommand); 
    };
}

/// connecting to the database and seed the database if it does not exist
function connectDB () {
    ////////// DB Setup
    mongoose.connect(connectInfo, { useNewUrlParser: true, useUnifiedTopology: true })
    .then( () => dbseeding.seedingDB() )
    .then( () => console.log('DB Connected!') )
    .catch(err => console.log("DB Connection Error: " + err.message));
}

/// logIn to client
function logIn() {
    // log in with the token 
    client.login(process.env.token); 
}

/// go into each directory, add the file object to the commands dictionary
function setCommandFiles(fileDirectory) {
    const commandFiles = fs.readdirSync(fileDirectory).filter(file => file.endsWith('.js'));
    commandFiles.forEach( file => {
        const command = require(`${fileDirectory}${file}`);
        client.commands.set(command.name, command); 
    })
}