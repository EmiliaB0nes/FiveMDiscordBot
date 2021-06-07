# FiveMDiscordBot
FiveM server stats bot for Discord

## Requirements
- Node v12 or +
- Web server (e.g., Apache, Nginx, Lighttpd, etc.)
- GNU Screen (Optional)

## First Start

### Get a Discord Bot Token
https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

### Install dependencies
- Extract the release file
- Go into the file
- Run the command: `npm update`

### Config File

Upcoming documentation

### First Run

Before running the script, edit config.sample.json (except postId) and rename it as config.json.

#### firstrun.js

- Execute: `node firstrun.js`
- In the desired Discord chanel, type: `!veryLongBotAdd`
- Once the bot answers, close it with ctrl+c
- Find the post id and add it in config.json


#### index.js

- Execute: `node index.js`

## Automate the launch

### Using GNU Screen and Cron

Upcoming documentation
