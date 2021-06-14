# FiveM Discord Bot
FiveM server stats bot for Discord



## Requirements
- [Node v12.0 or higher](https://github.com/nodesource/distributions/blob/master/README.md)
- Web server (e.g., Apache, Nginx, Lighttpd, etc.)
- *GNU Screen (Optional)*



## Config File

Command | Description  | Example
------------ | ------------ | ------------
**botAddCommand** | First launch command | !veryLongBotAdd
**token** | Discord bot token | xL89rF5RewAYyrWeChjQ.HpPg22e5ZtDscMyPxn.g4uJ9Jve
**channelId** | Desired channel ID | 594936565819632525
**postId** | Desired Post ID (Not used during the first launch) | 262003493384459751
**dateCorrection** | Time offset for the graph | 2
**recurrence** | Recurrence in **ms** (1000 = 1 seconde) | 60000
**server** | Server ip and port | 1.1.1.1:30100
**serverName** | Server name for display | My Server
**thumbnail** | Server Thumbnail URL | https://myserver.com/logo.png
**chartLocation** | Desired Directory for the chart (On Web server) | /var/www/html/fivem-graph
**chartFileName** | Desired chart file name | chart.png
**chartFolderURL** | Public directory url for the chart | https://myserver.com/fivem-graph
**dataStorageTime** | Data storage time in **minutes** | 1440
**database** | Database Name | history.sqlite
**adMessageTitle** | Advertising Title | My Custom Ad Title
**adMessageText** | Advertising message | Please vote for my server
**footerMessage** | Footer Message | Embed By FiveM Discord Bot



## First Start

### Get a Discord Bot Token
https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

### Install dependencies
- Extract the release folder
- Go into the folder
- Execute the command: `npm install`

### First Run

- Add the bot to your server as described above

- Before running the script, edit with your settings **config.sample.json** (except postId) and rename it as **config.json**

#### firstrun.js

- Execute: `node firstrun.js`
- In the desired Discord chanel (It must be indicated in config.json), type: `!veryLongBotAdd`
- Once the bot answers, close it with `ctrl + c`
- Find the post id and add it in **config.json**


#### index.js

- After editing config.json to add the postId, execute: `node index.js`



## Automate the launch

Exemple using Ubuntu 20.04 LTS

### Using GNU Screen and Cron

**Don't use root or similar user!**

In this example, I will execute the script at server startup with a cron job:

- Execute: `crontab -e`
- At the bottom of the file, add: **@reboot /usr/bin/screen -dmS FiveMDiscordBot  /usr/bin/node /path/to/script/index.js**

- To see the logs, execute: `screen -r` 
    - If you get the error message: "There is no screen to be resumed.", It's because the script had an execution error, execute: `node index.js` to find the origin of the error.
- To exit the logs, type `ctrl + a + d`



## Known Issues

- The chart is suddenly not updated anymore
    - The database is probably corrupted. To fix this problem, delete history.sqlite and copy/rename history.sqlite.template to history.sqlite 

- On Ubuntu 20.04 LTS (and in some other distributions), the Node.js version is too old
    - You have to install [the official node.js repository](https://github.com/nodesource/distributions/blob/master/README.md) to have at least the v12.0