// environmental variable import
const dotenv = require('dotenv');
const mute = require('../../commands/mod/mute');
dotenv.config();
const devMessage = process.env.Dev ? "Dev mode: " : ""
const isDev = process.env.Dev;

const config = require('../../config');
const thumbnail = config.logoIconLink;

const Discord = require('discord.js'); 

/**
 * 
 * @param {Discord.GuildMember} memberJoined 
 * @param {Discord.GuildMember} inviter 
 * @param {Discord.invite} invite 
 */
exports.onMemberJoin = (memberJoined, inviter, invite) => {

    const leftColor = '#0099ff';
    const typeOfStatus = "MEMBER JOIN";
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${memberJoined} joined using ${inviter}'s link, currently have ${invite.uses}`;

    const embed = new Discord.MessageEmbed()
        .setColor(leftColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Status Type', value: typeOfStatus, inline:  true },
            { name: 'Status Time', value: statusTime, inline:  true },
            { name: 'is dev', value: isDev, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'Joined Name', value: memberJoined.displayName, inline:  true },
            { name: 'Joined ID', value: memberJoined.id, inline:  true },
            { name: 'Invite Name', value: inviter.displayName, inline:  true },
            { name: 'Inviter ID', value: inviter.id, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'invite link usage', value: invite.uses, inline:  true },
            { name: 'invite link', value: invite.url, inline:  true },
        )
        .setTimestamp(statusTime.getTime())
        .setFooter('typeOfStatus', thumbnail);

    return embed;
}

/**
 * 
 * @param {Discord.GuildMember} memberLeft 
 */
exports.onMemberLeave = (memberLeft) => {
    
    const leftColor = '#0099ff';
    const typeOfStatus = "MEMBER LEAVE";
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${memberLeft} left`;

    const embed = new Discord.MessageEmbed()
        .setColor(leftColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Status Type', value: typeOfStatus, inline:  true },
            { name: 'Status Time', value: statusTime, inline:  true },
            { name: 'is dev', value: isDev, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'Left Name', value: memberLeft.displayName, inline:  true },
            { name: 'Left ID', value: memberLeft.id, inline:  true },
        )
        .setTimestamp(statusTime.getTime())
        .setFooter('typeOfStatus', thumbnail);

    return embed;
}

/**
 * 
 * @param {Discord.GuildMember} kickedBy 
 * @param {Discord.GuildMember} kickTarget 
 * @param {String} kickReason 
 */
exports.onMemberKick = (kickedBy, kickTarget, kickReason) => {

    const kickColor = '#0099ff';
    const typeOfStatus = "MEMBER KICKED";
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${kickedBy} kicked ${kickTarget}`;
    
    const embed = new Discord.MessageEmbed()
        .setColor(kickColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Status Type', value: typeOfStatus, inline:  true },
            { name: 'Status Time', value: statusTime, inline:  true },
            { name: 'is dev', value: isDev, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'Initiator Name', value: kickedBy.displayName, inline:  true },
            { name: 'Initiator ID', value: kickedBy.id, inline:  true },
            { name: 'kicked Name', value: kickTarget.displayName, inline:  true },
            { name: 'kicked ID', value: kickTarget.id, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'kick reason', value: kickReason, inline:  true },
        )
        .setTimestamp(statusTime.getTime())
        .setFooter('typeOfStatus', thumbnail);

    return embed;
}

/**
 * 
 * @param {Discord.GuildMember} derankedBy 
 * @param {Discord.GuildMember} derankTarget 
 */
exports.onMemberDerank = (derankedBy, derankTarget) => {
    
    const derankColor = '#0099ff';
    const typeOfStatus = "MEMBER DERANKED";
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${derankedBy} deranked ${derankTarget}, meaning the target cannot participate until the next season`;
    
    const embed = new Discord.MessageEmbed()
        .setColor(derankColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Status Type', value: typeOfStatus, inline:  true },
            { name: 'Status Time', value: statusTime, inline:  true },
            { name: 'is dev', value: isDev, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'Initiator Name', value: derankedBy.displayName, inline:  true },
            { name: 'Initiator ID', value: derankedBy.id, inline:  true },
            { name: 'deranked Name', value: derankTarget.displayName, inline:  true },
            { name: 'deranked ID', value: derankTarget.id, inline:  true },
        )
        .setTimestamp(statusTime.getTime())
        .setFooter('typeOfStatus', thumbnail);
    
    return embed;      
}

/**
 * 
 * @param {Discord.GuildMember} banBy 
 * @param {Discord.GuildMember} banTarget 
 * @param {String} reason 
 * @param {Number} time in days
 * @param {Date} endingTime 
 */
exports.onMemberBan = (banBy, banTarget, reason, time, endingTime) => {
    
    const banColor = '#0099ff';
    const typeOfStatus = 'MEMBER BAN';
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${banBy} banned ${banTarget} for ${time} days because ${reason} ending time will be ${endingTime}`;
    const banTime = `${time} hours`;

    const embed = new Discord.MessageEmbed()
    .setColor(banColor)
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .addFields(
        { name: 'Status Type', value: typeOfStatus, inline:  true },
        { name: 'Status Time', value: statusTime, inline:  true },
        { name: 'is dev', value: isDev, inline:  true },
        { name: '\u200B', value: '\u200B', inline:  false },
        { name: 'Initiator Name', value: banBy.displayName, inline:  true },
        { name: 'Initiator ID', value: banBy.id, inline:   true },
        { name: 'banned Name', value: banTarget.displayName, inline:   true },
        { name: 'banned ID', value: banTarget.id, inline:   true },
        { name: '\u200B', value: '\u200B', inline:   false },
        { name: 'ban time', value: banTime, inline:   true },
        { name: 'ban Reason', value: reason, inline:   true },
        { name: 'End Time', value: endingTime, inline:   true },
    )
    .setTimestamp(statusTime.getTime())
    .setFooter('typeOfStatus', thumbnail);

    return embed; 
}

/**
 * 
 * @param {Discord.GuildMember} mutedBy 
 * @param {Discord.GuildMember} muteTarget 
 * @param {String} reason 
 * @param {Number} time 
 * @param {Date} endingTime 
 * @return {Discord.MessageEmbed} embed
 */
exports.onMemberMute = (mutedBy, muteTarget, reason, time, endingTime) => {

    const muteColor = '#0099ff';
    const typeOfStatus = 'MEMBER MUTED';
    const statusTime = new Date(Date.now());
    const title = typeOfStatus + ' on ' + statusTime;
    const description = `${devMessage}: ${mutedBy} muted ${muteTarget} for ${time} hours because ${reason} ending time will be ${endingTime}`;
    const muteTime = `${time} hours`;

    // inside a command, event listener, etc.
    const embed = new Discord.MessageEmbed()
        .setColor(muteColor)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .addFields(
            { name: 'Status Type', value: typeOfStatus, inline:   true },
            { name: 'Status Time', value: statusTime, inline:   true },
            { name: 'is dev', value: isDev, inline:   true },
            { name: '\u200B', value: '\u200B', inline:   false },
            { name: 'Initiator Name', value: mutedBy.displayName, inline:  true },
            { name: 'Initiator ID', value: mutedBy.id, inline:  true },
            { name: 'muted Name', value: muteTarget.displayName, inline:  true },
            { name: 'muted ID', value: muteTarget.id, inline:  true },
            { name: '\u200B', value: '\u200B', inline:  false },
            { name: 'Mute time', value: muteTime, inline:  true },
            { name: 'Mute Reason', value: reason, inline:  true },
            { name: 'End Time', value: endingTime, inline:  true },
        )
        .setTimestamp(statusTime.getTime())
        .setFooter('typeOfStatus', thumbnail);

    return embed; 
}