const dotenv = require('dotenv');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""

const { MessageAttachment } = require('discord.js');
const sizeLimit = require('../../config')['attachmentsizelimit'];
const inputFilename = require('../../config')['inputfile'];
const outputFilename = require('../../config')['outputfile'];

const modRoles = process.env.devastModRoleID.split(/,/)

function teleportCommandHandler (message, args, attachments) {
    let teleportBuildingRole = message.member.roles.cache.find(role => modRoles.includes(role.id));

    if (!teleportBuildingRole) // only accept it if it has the corresponding role
    {
        console.log(`${devMessage}role not matching: here is a list of roles of the member\n: ${message.member.roles.cache}`)
    }
    else if (args === undefined || args.length === 0) {
        console.log(`${devMessage}No arguments passed`)
    }
    else {
        /***** START OF arguments processing ****/
        // process the arguments and attachments, if there is no args then send a message saying invalid parameter
        // arguments: 
        //      location in !teleport-building=X:Y ->  X, Y integers
        let xlocation = -1;
        let ylocation = -1;

        if (args.length <= 2) 
        {   // go to idx 0 and 1 to grab the x and y location
            var normalizedArg1 = args[0].trim();
            xlocation = parseInt(normalizedArg1);
            var normalizedArg2 = args[1].trim();
            ylocation = parseInt(normalizedArg2);

            if (isNaN(xlocation))
            {
                xlocation = -1;
                console.log("Not a number", normalizedArg1);
                message.channel.send(`${message.author} ${devMessage}x parameter is required for building teleportation`);
                return;
            }

            if (isNaN(ylocation))
            {
                ylocation = -1;
                console.log("Not a number", normalizedArg2);
                message.channel.send(`${message.author} ${devMessage}y parameter is required for building teleportation`);
                return;
            }
        }
        else 
        {
            message.channel.send(`${message.author} ${devMessage}x parameter and y parameter are required for building teleportation`);
            return;
        }

        /**** END OF arguments processing ****/

        // attachments: 
        // only the first attachment that is txt file less than a certain amount will be processed

        if (attachments === undefined || attachments.length === 0) {   // there are no attachments
            console.log('cannot find attachments that contains the building command: missing or undefined');
            message.channel.send(`${message.author} ${devMessage}cannot find attachments that contains the building command: missing or undefined`);
            return;
        }
        else {   // filter attachments
            const validAttachments = attachments.map(messageAttachment => {
                if (messageAttachment.name.includes('txt') && messageAttachment.size <= sizeLimit) return messageAttachment;
            });

            if (validAttachments === 0) {
                console.log('none of the attachments are valid');
                message.channel.send(`${message.author} ${devMessage}none of the attachments are valid: require txt files smaller than ${sizeLimit} bytes`);
                return;
            }
            else {
                // console.log("attachments: ", validAttachments[0]);
                download(validAttachments[0].url, attachmentContent => {
                    // using the data downloaded from the file, build a building list
                    const buildingList = generateBuildingObject(attachmentContent.trim());

                    var midpointX = 0;
                    var midpointY = 0;
                    var width = 0;
                    var height = 0;
                    var minX = 0; var minY = 0;
                    var maxX = 0; var maxY = 0;

                    configureBuildingList(buildingList, (minX, minY, maxX, maxY, width, height, midX, midY) => {
                            midpointX = midX
                            midpointY = midY
                            
                            minX = minX; minY = minY; maxX = maxX; maxY = maxY;

                            width = width
                            height = height
                        }
                    )
                    
                    if (!canTeleport(message, xlocation, ylocation, width, height)) return;

                    // teleport and save the result to a file
                    saveToFile(outputFilename, teleportBuilding(xlocation, ylocation, midpointX, midpointY, buildingList));

                    message.channel.send(
                        `${message.author} \n ${devMessage}here you go`,
                        new MessageAttachment(outputFilename)
                    );
                });
            }
        }
    }
}

/// teleport building to specified location and return a string of the building after teleportation
function teleportBuilding(xLocation, yLocation, midX, midY, buildingList) {
    // teleport and modify the list of building objects
    const deltaXDirection = xLocation - midX, deltaYDirection = yLocation - midY;

    const teleportedBuilding = buildingList.map(item => {
        return {
            'buildid1': item.buildid1,
            'buildid2': item.buildid2,
            'buildx': item.buildx + deltaXDirection,
            'buildy': item.buildy + deltaYDirection,
            'builddir': item.builddir
        };
    });

    let teleportedBuildingCommand = '';
    // convert building to string
    teleportedBuilding.forEach(item => teleportedBuildingCommand += buildToString(item));

    return teleportedBuildingCommand;
}

/// given the informations about this building, 
/// determine if can or cannot teleport. 
/// return true if can, else return false and send a message to the user about what is going on. 
function canTeleport(message, xlocation, ylocation, width, height) {

    let ableToTeleport = true;

    // determine if it is possible to teleport
    // xlocation out of bound
    var isXOutOfBound = xlocation - width / 2 < 0 || xlocation + width / 2 > 149; 
    if (isXOutOfBound) {
        message.channel.send(`${message.author} ${devMessage}unable to process because the resulted xlocation is smaller than 0 or greater than 149.`);
        ableToTeleport = false;
    }

    // y location out of bound
    var isYOutOfBound = ylocation - height / 2 < 0 || ylocation + height / 2 > 149;
    if (isYOutOfBound) {
        message.channel.send(`${message.author} ${devMessage}unable to process because the resulted ylocation is smaller than 0 or greater than 149.`);
        ableToTeleport = false;
    }

    return ableToTeleport;
}

/// Get all the properties regarding to the buildingList
/// including, minX, minY, maxX, maxY, width, height, midX, midY
/// return true if not able to teleport
function configureBuildingList(buildingList, callback) {

    // calculate the minimum location and maximum location
    var minX = 200, minY = 200;
    var maxX = 0, maxY = 0;
    for (var itemIdx = 0; itemIdx < buildingList.length; itemIdx++) {
        const item = buildingList[itemIdx];

        minX = (minX > item.buildx) ? item.buildx : minX;
        minY = (minY > item.buildy) ? item.buildy : minY;

        maxX = (maxX < item.buildx) ? item.buildx : maxX;
        maxY = (maxY < item.buildy) ? item.buildy : maxY;
    }

    // calculate the length, and width of the input building. 
    var width = maxX - minX;
    var height = maxY - minY;
    // calculate the center location using mid point formula
    var midX = Math.round((minX + maxX) / 2);
    var midY = Math.round((minY + maxY) / 2);

    callback(minX, minY, maxX, maxY, width, height, midX, midY)
}

/// download data from url by reading the file online, 
/// then it will pass the data to the call back
function download(url, callback) {
    const https = require('https');

    let body = "";
    https.get(url, response => {
        response.on('data', (chunk) => {
            body += chunk
        })
        response.on('end', () => {
            console.log(body)
            callback(body);
        })
    })
}

/// save string to a file
function saveToFile(path, text) {
    // ensure file has been created
    createWriteFileStreamSync(path)
        .then(stream => {
            stream.write(text, err => { });
            stream.on("finish", () => {
                stream.close(() => { })
            });
        });
}

/// create Write File Stream, if file not exist then create file. Return a file write stream
async function createWriteFileStreamSync(path) {
    const fs = require('fs')
    const exist = await fs.existsSync(path);

    if (!exist)
        await fs.writeFileSync(path, '');
    return fs.createWriteStream(path);
}

/// geenrate a list of buildingObject from the buildingCommand that is normalized
// TODO: use variables to store each item parameter in the loop
function generateBuildingObject(buildingCommandNormalized) {
    if (buildingCommandNormalized.includes("!") && buildingCommandNormalized.includes(":")) {
        // the format is !b=12:12:11:11:1
        const itemList = buildingCommandNormalized.split("!");
        const building = [];

        itemList.forEach(item => {
            const itemDetail = item.replace(/b=/gi, "").split(":");
            if (itemDetail[0] === '')
                return;

            if (itemDetail.length === 5) {
                building.push(
                    {
                        'buildid1': parseInt(itemDetail[0]),
                        'buildid2': parseInt(itemDetail[1]),
                        'buildx': parseInt(itemDetail[2]),
                        'buildy': parseInt(itemDetail[3]),
                        'builddir': parseInt(itemDetail[4])
                    }
                );
            }
            else if (itemDetail.length === 4) {
                building.push(
                    {
                        'buildid1': parseInt(itemDetail[0]),
                        'buildid2': -1,
                        'buildx': parseInt(itemDetail[1]),
                        'buildy': parseInt(itemDetail[2]),
                        'builddir': parseInt(itemDetail[3])
                    }
                );
            }
            else {
                console.log("Not enough length", itemDetail);
            }
        });

        return building;
    }
    else {
        console.log("What is in the file?? Invalid content");
        console.log("here is the content: ", buildingCommandNormalized);
        return [];
    }
}

/// turn item Obj to string
function buildToString(item) {
    if (item.buildid2 === -1)
        return '!b=' + item.buildid1 + ':' + item.buildx + ':' + item.buildy + ':' + item.builddir
    else
        return '!b=' + item.buildid1 + ':' + item.buildid2 + ':' + item.buildx + ':' + item.buildy + ':' + item.builddir
}

/**********          Export          **********/
module.exports = {
    name: 'teleport-building',
    description: 'teleport a devast io building',
    execute: teleportCommandHandler
}