const User = require('../../models/discordUser')
const controller = require('./controller');


const userToBeSeeded = 
    [
        new User({
            userId: "275147361486110721",
            level: 23,
            isMember: true,
            memberSince: new Date(Date.now())
        }),
        new User({
            userId: "1234678910",
            level: 1,
            isMember: false,
            memberSince: new Date(Date.now())
        }),
        new User({
            userId: "90923890009823092",
            level: 70,
            isMember: false,
            memberSince: new Date(Date.now())
        }),
        new User({
            userId: "12399892139090192",
            level: 190,
            isMember: true,
            memberSince: new Date(Date.now())
        }),
        new User({
            userId: "1239989213909011732",
            level: 90,
            isMember: true,
            memberSince: new Date(Date.now())
        }),
        new User({
            userId: "2814444865658283700079",
            level: 10,
            isMember: false,
            memberSince: new Date(Date.now())
        })
    ]

exports.seedingDB = async () => {

    if (await controller.exist()) // if there are docs in the database
    {
        return;
    }

    for (let idx = 0; idx < userToBeSeeded.length; idx++)
    {
        await controller.addUser(userToBeSeeded[idx]); 
    }
}