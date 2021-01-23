const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discordPeopleSchema = new Schema( 
    {
        userId: 
            {
                type: String, 
                required: true,
                unique: true,
            },
        level: 
            {
                type: Number,
                default: 1,
                min: 1
            },
        isMember: 
            {
                type: Boolean,
                default: true,
            },
        memberSince: 
            {
                type: Date,
                required: true,
            },
    }
);

//// create the model class
const ModelClass = mongoose.model('DiscordUser', discordPeopleSchema); // this is actually a class object

//// export the model 
module.exports = ModelClass;