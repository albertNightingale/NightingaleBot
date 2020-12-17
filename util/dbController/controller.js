const { Model } = require('mongoose');
const User = require('../../models/discordUser');

const defaultUser = new User({
    level : 1,
    isMember : true,
});

// to level up the user
exports.levelUp = ( id, levelsRequested ) => {
    User.findOne( { userId: id }, (err, discordUser) => {
        if (err) // if there is an error with reading/connecting the database
        {
            console.log(err);
            return;
        }

        // if the id does not exist, the person is new
        if (!discordUser) {
            console.log("user does not exist");
            throw "user does not exist";
        }
        else 
        {
            User.updateOne( 
                { userId : id }, { level: discordUser.level + levelsRequested }, 
                function (err, docs) {
                    if (err) console.log(err);
                }
            );
        }
    });
}

/**
 * add user to database
 * @param {User} user 
 */
exports.addUser = async (user) => {    
    try
    {
        await user.save(); 
    }
    catch (err)
    {
        console.log(err);
    }
}


// change all player's level to 1
// set isMember all back to true
exports.derankAll = () => {
    User.updateMany( { level: {$gte: 1} } , { level : 1, isMember : true }, 
        function (err, docs) {
            if (err) console.log(err);
            else console.log('deranked', docs);
        }
    );
}

// change one member's level to 1
exports.derankOne = (id) => {
    User.update( { userId: id } , { level : 1, isMember : false }, 
        function (err, docs) {
            if (err) console.log(err);
            else console.log('deranked', docs);
        }
    );
}


// find a user by id
exports.findUser = async (id) => {
    let user = undefined
    try {
        user = await User.findOne({ userId: id }).exec();
    } 
    catch (error) 
    {
        throw `error finding user with id ${id}`;
    }

    return user;
}

// return true if exist (there is any row inside of the specified table), false if not
exports.exist = async () => {

    let doesExist = await User.exists( (error, res) => {
        if (error) throw error;
    })

    return doesExist;
}