const User = require('../../models/discordUser');
const { addUser } = require('./controller');
const { findUser } = require('./controller');
const { exist } = require('./controller');
const { derankOne } = require('./controller');

const mongoose = require('mongoose');
const dbseeding = require('./dbseeding');
const connectInfo = 'mongodb://localhost:DiscordBot/DiscordUser';

function connectDB () {
    ////////// DB Setup
    mongoose.connect(connectInfo, { useNewUrlParser: true, useUnifiedTopology: true })
    .then( () => dbseeding.seedingDB() )
    .then( () => console.log('DB Connected!') )
    .catch(err => console.log("DB Connection Error: " + err.message));
}

jest.useFakeTimers();

/*
test('testdummy', () => {

    expect(1 + 2).toBe(3);
})

test('addUser: test adding one user', () => {
    const userTest = new User({
        userId: "27514736148611075",
        level: 26,
        isMember: true,
        memberSince: new Date(Date.now())
    });
    connectDB()
    
    addUser(userTest)

    findUser(userTest.userId)
    .then(userSearchResult => expect(userSearchResult.userId).toBe(userTest.userId))
})

test('findUser: try finding a user that was seeded', () => {
    const userTest = new User({
        userId: "90923890009823092",
        level: 70,
        isMember: false,
        memberSince: new Date(Date.now())
    })

    connectDB();
   
    findUser(userTest.userId)
    .then( userSearchResult => expect(userSearchResult.userId).toBe(userTest.userId))

    findUser(userTest.userId)
    .then( userSearchResult => expect(userSearchResult.level).toBe(userTest.level))
})

test('exist: test checking if db exist', () => {
    connectDB();

    exist()
    .then( booleanResult => expect(booleanResult).toBe(true))
})

test('derankOne: try to derank one person', () => {
    const userTest = new User({
        userId: "1239989213909011732",
        level: 90,
        isMember: true,
        memberSince: new Date(Date.now())
    });

    connectDB();

    derankOne();
    findUser(userTest.userId)
    .then(userSearchResult => { expect(userSearchResult.level).toBe(1); return userSearchResult;})
    .then(userSearchResult => { expect(userSearchResult.isMember).toBe(false)});
})
*/

test('derankOne: try to derank one person, who does not exist in database', () => {
    // someone does not exist
    const userTest = new User({
        userId: "SOMEONE_DOES_NOT_EXIST", 
        level: 90,
        isMember: true,
        memberSince: new Date(Date.now())
    });


    connectDB();

    derankOne();
    jest.runAllTimers();

    findUser(userTest.userId)
    .then(userSearchResult => { expect(userSearchResult.level).toBe(1); return userSearchResult;})
    .then(userSearchResult => { expect(userSearchResult.isMember).toBe(false)})
    .catch(errorMsg => expect(errorMsg).toBe(`error finding user with id ${userTest.userId}`));
})