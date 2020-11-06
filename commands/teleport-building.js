const { MessageAttachment } = require('discord.js');
const { send } = require('process');
const sizeLimit = require('../config')["attachment-size-limit"];
const inputFilename = require('../config')['inputfile'];
const outputFilename = require('../config')['outputfile'];

const teleportCommandHandler = (message, args, attachments) => {
    let role = message.member.roles.cache.find(role => role.name === "sample")
    if (role) // only accept it if it has the corresponding role
    {
        // process the arguments and attachments, if there is no args then send a message saying invalid parameter
        // arguments: 
        //      location in x=x y=y ->  x, y integers
        let xlocation = -1;
        let ylocation = -1;

        args.forEach(arg => {
            // if (arg === undefined) return;
            var normalizedArg = arg.trim();
            if (normalizedArg === '') return;

            if (normalizedArg.includes("y=")) {   // the y location
                ylocation = parseInt(normalizedArg.replace("y=", ""));
                if (isNaN(ylocation)) {
                    console.log("Not a number", ylocation);
                    ylocation = -1;
                }
                console.log('Yes')
            }
            else if (normalizedArg.includes("x=")) {   // the x location
                xlocation = parseInt(normalizedArg.replace("x=", ""));
                if (isNaN(xlocation)) {
                    console.log("Not a number", xlocation);
                    xlocation = -1;
                }
                console.log('Xes')
            }
        });

        if (xlocation === -1 || ylocation === -1) // x y param missing
        {
            message.channel.send(message.author, 'x parameter and y parameter are required for building teleportation');
            return;
        }

        // attachments: 
        // only checked when there is no arguments
        // only the first attachment that is txt file less than a certain amount will be processed
        if (attachments === undefined || attachments.length === 0) {
            console.log('attachments are missing or undefined'); 
            message.channel.send(message.author, 'attachments are missing or undefined');
            return;
        }
        else {
            const validAttachments = attachments.map(
                messageAttachment => {
                    if (messageAttachment.name.includes('txt') && messageAttachment.size <= sizeLimit) return messageAttachment;
                }
            );

            if (validAttachments === 0) {
                console.log('none of the attachments are valid'); 
                message.channel.send(message.author, 'none of the attachments are valid');
                return;
            }
            else {
                // console.log("attachments: ", validAttachments[0]);
                download(validAttachments[0].url, inputFilename, () => {
                    // read the input file after downloading it
                    readBuildingFile(inputFilename, output => {
                        const buildingList = generateBuildingObject(output.trim());
                        
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
                        var width = maxX - minX, height = maxY - minY;
                        console.log('width', width)
                        console.log('height', height)
                        console.log('minxy', minX, ' ', minY);
                        console.log('maxxy', maxX, ' ', maxY);

                        // calculate the center location using mid point formula
                        var midX = Math.round((minX + maxX) / 2);
                        var midY = Math.round((minY + maxY) / 2);

                        // depending on the length and width and parameter teleporting position
                        // process and determine if the teleportation is possible 
                        // (potential cause of out of bound)
                        // if teleportation is impossible, send a message saying it is inpossible and terminate

                        // xlocation out of bound
                        if (xlocation - width / 2 < 0 || xlocation + width / 2 > 149)
                            message.channel.send(message.author, "unable to process because the resulted xlocation is smaller than 0 or greater than 149.");
                        // y location out of bound
                        if (ylocation - height / 2 < 0 || ylocation + height / 2 > 149)
                            message.channel.send(message.author, "unable to process because the resulted ylocation is smaller than 0 or greater than 149.");

                        // teleport and save the result to a file
                        saveToFile(outputFilename, teleportBuilding(xlocation, ylocation, midX, midY, buildingList));

                        // EXAMPLE: const attachment = new MessageAttachment("https://discord.com/assets/351330f6409e8046b0c996093e3e827b.svg");
                        const attachment = new MessageAttachment(outputFilename);
                        message.channel.send(message.author, attachment)
                            .catch(error => console.log(error))
                            .finally(() => {
                                // clean up, remove both input and output files
                            });
                    });
                });
            }
        }
    }
}

/// teleport building to specified location and return a string of the building after teleportation
function teleportBuilding(xLocation, yLocation, midX, midY, buildingList) {
    // teleport and modify the list of building objects
    const deltaXDirection = xLocation - midX, deltaYDirection = yLocation - midY;

    console.log('xloc', xLocation);
    console.log('yloc', yLocation);
    console.log('midx', midX);
    console.log('midy', midY);
    console.log("deltaDirection", deltaXDirection, "deltaDirection", deltaYDirection);

    const teleportedBuilding = buildingList.map(item => {
        console.log(item);
        return {
            'buildid1': item.buildid1,
            'buildid2': item.buildid2,
            'buildx': item.buildx + deltaXDirection,
            'buildy': item.buildy + deltaYDirection,
            'builddir': item.builddir
        };
    });
    
    console.log('split up')
    let teleportedBuildingCommand = '';
    // convert building to string
    teleportedBuilding.forEach(item => {
        console.log(item);
        teleportedBuildingCommand += buildToString(item);
    });

    return teleportedBuildingCommand;
}

/// download data from url
function download(url, path, callback) {
    // const normalizedURL = url.replace("https", "http");
    console.log('URL: ', url);

    const https = require('https');

    createWriteFileStreamSync(path)
        .then(stream => {
            https.get(url, res => {
                res.pipe(stream);
                stream.on("finish", () => {
                    stream.close(  () => {
                        callback();
                    })  
                });                
            });
        })
        .finally(() => {
            console.log("done with downloading the file");
        });
}

/// save string to a file
function saveToFile(path, text) {
    const fs = require('fs');
    // ensure file has been created
    createWriteFileStreamSync(path)
        .then(stream => {
            stream.write(text, err => console.log('error: ', err));
            stream.on("finish", () => {
                stream.close(() => {
                    console.log('Saving Completed');
                })
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

/// read the file and return its entire content in string
function readBuildingFile(path, callback) {
    const fs = require('fs')
    var data = undefined;
    
    /*
    (async () => {
        return await fs.readFileSync(path, 'utf8')
    })()
        .then(buffer => data = buffer.toString())
        .then(buffer => console.log('buffer data', data))
        .catch(error => console.log('error occured in readBuildingFile', error))
        .finally(() => callback(data));
        */
    var content = fs.readFileSync(path, 'utf8');

    console.log('content', content)
    callback(content)
}

/// geenrate a list of buildingObject from the buildingCommand that is normalized
// TODO: use variables to store each item parameter in the loop
function generateBuildingObject(buildingCommandNormalized) {
    if (buildingCommandNormalized.includes("!") && buildingCommandNormalized.includes(":")) {
        // the format is !b=12:12:11:11:1
        const itemList = buildingCommandNormalized.split("!");
        const building = [];

        itemList.forEach(item => {
            const itemDetailList = item.replace(/b=/gi, "").split(":");
            if (itemDetailList.length === 5) {
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
            else if (itemDetailList.length === 4) {
                console.log(itemDetailList[0], itemDetailList[1], itemDetailList[2], itemDetailList[3])
                building.push(
                    {
                        'buildid1': parseInt(itemDetailList[0]),
                        'buildid2': -1,
                        'buildx': parseInt(itemDetailList[1]),
                        'buildy': parseInt(itemDetailList[2]),
                        'builddir': parseInt(itemDetailList[3])
                    }
                );
            }
            else {
                console.log("Not enough length", itemDetailList);
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