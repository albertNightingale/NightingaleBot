const User = require('../../models/discordUser');

const defaultUser = new User({
    level : 1,
    isMember : true,
});

// to level up the user
exports.levelUp = ( { id, memberSince } ) => {
    User.findOne( { userId: id }, (err, discordUser) => {
        if (err) // if there is an error with reading/connecting the database
        {
            console.log(err);
            return;
        }

        // if the id does not exist, the person is new
        if (!discordUser) {
            console.log("user does not exist");
            // add the user to the database
            this.addUser(
                { 
                    userId : id, 
                    level : 2,
                    isMember : true,
                    memberSince : memberSince
                }
            )
        }
        else 
        {
            console.log("user does exist");
            User.updateOne( 
                { userId : id }, { level: discordUser.level + 1 }, 
                function (err, docs) {
                    if (err) console.log(err);
                    else console.log('updated', docs);
                }
            );
        }
        
    });
}

// add user to database
exports.addUser = (user) => {
    user.save( (err) => {
        if (err) console.log(err); 
    })
}


// change all player's level to 1
// set isMember all back to true
exports.derankAll = () => {
    User.updateMany( { userId: {$gte: 1} } , { level : 1, isMember : true }, 
        function (err, docs) {
            if (err) console.log(err);
            else console.log('deranked', docs);
        }
    );
}

// find a user by id
exports.findUser = (id) => {

    let user = undefined; 
    User.findOne( { userId: id }, (err, discordUser) => {
        if (err) 
        {
            console.log(err);
            return;
        }

        if (!discordUser)
        {
            return;
        }

        user = discordUser;
    })

    return user;
}

// return true if exist (there is any row inside of the specified table), false if not
exports.exist = async () => {

    let doesExist = await User.exists( (error, res) => {
        if (error) throw error;
    })

    return doesExist;
}