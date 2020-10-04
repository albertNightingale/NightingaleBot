const {MessageAttachment} = require('discord.js'); 

module.exports = {
    name: 'teleport-building', 
    description: 'teleport a devast io building', 
    execute: (message, args, attachments) => {

        let role = message.member.roles.cache.find( role => role.name === "sample" )
        if (role) // only accept it if it has the corresponding role
        {
            // process the arguments and attachments, if there is no args then send a message saying invalid parameter
            // arguments: 
            //      location in x=x y=y ->  x, y integers
            //      input building (if there is no such an argument then go check attachments) -> a list of building objects

            let x = -1;
            let y = -1;
            let building = [];

            args.forEach( arg => {
                if (arg !== undefined) return;
                var normalizedArg = arg.trim();
                if (normalizedArg !== '') return; 

                if (normalizedArg.includes("y="))
                {
                    y = parseInt(normalizedArg.replace("y=", ""));
                    if (isNaN(y))
                    {
                        console.log("Not a number", y);
                        y = -1;
                    }
                }
                else if (normalizedArg.includes("x="))
                {
                    x = parseInt(normalizedArg.replace("x=", ""));
                    if (isNaN(x))
                    {
                        console.log("Not a number", x);
                        x = -1;
                    }
                }
                else if (normalizedArg.includes("!") && normalizedArg.includes(":")) 
                {
                    // the format is !b=12:12:11:11:1
                    var itemList = normalizedArg.split("!");
                    
                    itemList.forEach(item => {
                        var itemDetailList = item.replace("!b=", "").split(":");
                        if (itemDetailList.length===5) {
                            building.push(
                                {
                                    'buildid1': parseInt(itemDetailList[0]),
                                    'buildid2': parseInt(itemDetailList[1]),
                                    'buildx': parseInt(itemDetailList[2]),
                                    'buildy': parseInt(itemDetailList[3]),
                                    'builddir': parseInt(itemDetailList[4])
                                }
                            ); 
                        }
                        else {
                            console.log("Not enough length", itemDetailList);
                        }
                    })
                }
            })

            // attachments: 
            // only checked when there is no arguments
            // only the first txt file will be processed





            // calculate the length, and width of the input building. 



            // depending on the length and width, 
            // process and determine if the teleportation is possible 
            // (potential cause of out of bound)
            // if teleportation is impossible, send a message saying it is inpossible and terminate


            
            // teleport and modify the list of building objects



            // save the output to the message.txt file

            

            // const attachment = new MessageAttachment("https://discord.com/assets/351330f6409e8046b0c996093e3e827b.svg");
            const attachment = new MessageAttachment("./resources/text/message.txt");
            message.channel.send(message.author, attachment); 
        }
    }
}


