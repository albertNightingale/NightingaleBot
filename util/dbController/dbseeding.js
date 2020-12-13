const User = require('../../models/discordUser')
const controller = require('./controller');

exports.seedingDB = async () => {

    if (await controller.exist()) // if there are docs in the database
    {
        return;
    }

    userNightingale = new User({
        userId: "275147361486110721",
        level: 23,
        isMember: true,
        memberSince: new Date(Date.now())
    });

    user1 = new User({
        userId: "1234678910",
        level: 1,
        isMember: false,
        memberSince: new Date(Date.now())
    })

    user2 = new User({
        userId: "90923890009823092",
        level: 70,
        isMember: false,
        memberSince: new Date(Date.now())
    })

    user3 = new User({
        userId: "12399892139090192",
        level: 1,
        isMember: true,
        memberSince: new Date(Date.now())
    })


    controller.addUser(userNightingale);
    controller.addUser(user1);
    controller.addUser(user2);
    controller.addUser(user3);
}