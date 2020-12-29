# ```Nightingale AI, A discord bot for Devast.io```
See discord invite: 
https://discord.gg/cJA6UJeAy8

This bot does the following: 
- perform basic moderation
- Adding extensions moderation to private servers in Devast.io
- Hosting a simple ranking system.

## Basic moderation:


## Extension moderation to private servers in Devast.io

## Hosting a simple ranking system
##### Available commands: 

!derank: 
- Only used by admin
- Derank one to multiple discord members. This command will be used on members breaking the discord rules. The command will disqualify one to multiple discord members from participating in the ranking system for the rest of the reason. 
- It will remove the member role from the discord. It will remove all the ranking roles from the discord server. 
- It will clear out all member levels from the database. It will set isMember column to false. 
- Example: 
    - !derank @Nightingale @s @noob
    - Deranking three players


!levelup: 
- Only used by admin
- This command will be used to level up one member in the discord. 
- If the person to level up is not a member, it will not work. 
- If the person to level up is not in the database, it will not work. 
- The limit for the number of levels to level up is 20.
- The number of levels is at least 1. 
- Example: 
    - !levelup 2 goodboi @Nightingale
    - Level up Nightingale by 2 levels because he is a goodboi


!myrank:
- Used by everyone
- The command will be used by people to see their own levels
- Will display the name, current level, and current rank role. 
- If is not a member, will tell the user that he/she does not qualify because he/she is not a member
- Example: 
    - You are removed from this season, please wait until the next ranking season. 
- If the user record is not in the database, it will tell the user he/she does not qualify because he/she can only participate from the next round after he/she joins. 
- Example: 
    - You only joined the server recently, meaning you can only participate in the next ranking season. 
- Example:
    - !myrank
    - To see my rank

!reset-rank:
- Used only by admin
- Used to reset a ranking season
- The command will remove everyone’s rank roles, except for member roles. 
- The command will set everyone’s levels to level one. 
- The command will add everyone to the member role, including those who were not before. 
- The command will add people who are not in the database into the database, so they can participate this season. 
- Example:
    - !reset-rank
    - It will reset the rank

##### Logistics
- Using MongoDB to keep track of discord member's link.



