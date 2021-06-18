// require
const Discord = require('discord.js');
const config = require(__dirname + '/config.json');
const axios = require('axios').default;
const moment = require('moment');
const sqlite3 = require('sqlite3');
const QuickChart = require('quickchart-js');
const fs = require('fs');


// create a new Discord client
const client = new Discord.Client();


//
//
// Add bot : https://discord.com/oauth2/authorize?scope=bot&permissions=2148001856&client_id=xxxxxxxxxxxxxxxxx
//
//
// Create a cron job to start the script at boot (Require GNU Screen )
//    @reboot /usr/bin/screen -dmS FiveMDiscordBot  /usr/bin/node /path/to/script/index.js
//
//

jsonReader(__dirname + '/config.json', (err, settings) => {
    if (err) {
        console.log('Error reading file:', err);
        return;
    }


    // First run
    if (!settings.postId) {

        console.log('Ready!');
        console.log('To set the bot up, type "' + config.botAddCommand + '" on the desired channel');

        // Set channel and post id
        client.on('message', message => {
            if (message.content === config.botAddCommand) {



                if (settings.postId) {
                    console.log("Settings already set. Delete the content of channelId and postId on config.json if you want to make another post")
                }
                else {
                    message.channel.send('Hi!').then(sent => { // 'sent' is that message you just sent


                        console.log("channel: " + sent.channel.id);
                        console.log("post: " + sent.id);


                        settings.channelId = sent.channel.id;
                        settings.postId = sent.id;


                        fs.writeFile(__dirname + '/config.json', JSON.stringify(settings), (err) => {
                            if (err) console.log('Error writing file:', err)
                        })

                        console.log("Post and channel id set! Please restart the script");


                    });
                }

            }
        });
    }

    else {


        // when the client is ready, run this code
        // this event will only trigger one time after logging in
        client.once('ready', () => {

            console.log('Ready!');
            console.log('Please wait ' + (config.recurrence / 1000) + ' seconds for the first update.');




            var fiveEmbed;
            var directConnect;
            var serverStatus;
            var playerName;
            var playerPing;
            var playerCount;
            var colorStatus;



            function updateStats() {
                setInterval(function () {
                    //Date
                    var now = moment().format("DD-MM-YYYY hh:mm:ss");



                    function editStats() {
                        // FiveEmbed
                        fiveEmbed = new Discord.MessageEmbed()
                            .setColor(colorStatus)
                            .setTitle('Status du serveur')
                            //.setURL('https://discord.js.org/')
                            //.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
                            //.setDescription('Some description here')
                            .setThumbnail(config.thumbnail)
                            .addFields(
                                {
                                    name: '\u200B',
                                    value: '\u200B'
                                },
                                {
                                    name: 'Serveur',
                                    value: config.serverName
                                },
                                //{
                                //    name: '\u200B',
                                //    value: '\u200B'
                                //},
                                {
                                    name: 'Adresse (Whitelist)',
                                    value: '`' + directConnect + '`'
                                },
                                //{
                                //    name: '\u200B',
                                //    value: '\u200B'
                                //},
                                {
                                    name: 'Status',
                                    value: serverStatus,
                                    inline: true
                                },
                                //{
                                //    name: '\u200B',
                                //    value: '\u200B'
                                //},
                                {
                                    name: 'Joueurs en ligne',
                                    value: playerCount,
                                    inline: true
                                },
                                {
                                    name: '\u200B',
                                    value: '\u200B'
                                },
                                {
                                    name: 'Joueurs',
                                    value: '```' + playerName + '```',
                                    inline: true
                                },
                                {
                                    name: 'Ping',
                                    value: '```' + playerPing + '```',
                                    inline: true
                                },
                                {
                                    name: '\u200B',
                                    value: '\u200B'
                                },
                                {
                                    name: config.adMessageTitle,
                                    value: config.adMessageText
                                },
                                {
                                    name: '\u200B',
                                    value: '\u200B'
                                },
                            )
                            .setImage(config.chartFolderURL + '/' + config.chartFileName + '?ver=' + Math.floor((Math.random() * 999999) + 1))
                            .setTimestamp()
                            .setFooter(config.footerMessage);

                    }



                    axios.get('http://' + config.server + '/players.json')
                        .then(function (response) {

                            var isDataAvailable = response.data && response.data.length;
                            // handle success

                            var playerList = response.data;

                            directConnect = config.server;
                            serverStatus = "En Ligne";
                            playerName = "";
                            playerPing = "";
                            playerCount = 0;
                            var playerLogs = "\n" + now + "\n";


                            if (isDataAvailable != 0) {
                                for (var n in playerList) {
                                    playerName = playerName + zerofill(playerList[n].id, 3) + ": " + playerList[n].name.substring(0, 17) + '\n';
                                    playerPing = playerPing + playerList[n].ping + ' ms\n';
                                    playerCount++;
                                    playerLogs = playerLogs + playerList[n].name + " - " + playerList[n].ping + 'ms \n';
                                    colorStatus = '#43B581';
                                }
                            } else {
                                playerName = '\u200B';
                                playerPing = '\u200B';
                                playerLogs = playerLogs + "No player Online";
                                colorStatus = '#FAA61A';
                            }


                            dataUpdate(playerCount, function (data) {
                                imgGen(graphJson(data));
                            });

                            console.log(playerLogs);
                            editStats();
                            embedEdit();

                        })
                        .catch(function (error) {
                            // handle error
                            console.log(error);
                            directConnect = '\u200B';
                            serverStatus = "Hors Ligne";
                            playerName = '\u200B';
                            playerPing = '\u200B';
                            playerCount = 0;
                            var playerLogs = "\n" + now + "\n";
                            colorStatus = '#F04747';
                            playerLogs = playerLogs + "Server Offline";
                            dataUpdate(playerCount, function (data) {
                                imgGen(graphJson(data));
                            });
                            editStats();
                            embedEdit();
                            console.log(playerLogs);

                        });
                    // .then(function () {
                    //     // always executed
                    // });


                    function embedEdit() {
                        client.channels.cache.get(config.channelId).messages.fetch(config.postId).then(messageFeteched => messageFeteched.edit(fiveEmbed));
                    }

                }, config.recurrence)

            }

            updateStats();


        });


    }
})


// read json file
function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}




// ZeroFill Function : https://stackoverflow.com/a/1267392
function zerofill(number, length) {
    // Setup
    var result = number.toString();
    var pad = length - result.length;

    while (pad > 0) {
        result = '0' + result;
        pad--;
    }

    return result;
}



// Update data, purge old datas and create json datas
function dataUpdate(jsonCount, callback) {


    const db = new sqlite3.Database(__dirname + '/' + config.database);

    let query1 = 'INSERT INTO "nbConnected" ("id","count") VALUES (NULL, ' + jsonCount + ')';

    let query2 = "DELETE FROM nbConnected WHERE date <= datetime('now', '-" + config.dataStorageTime + " minutes')";

    let query3 = "SELECT * FROM nbConnected";

    let query4 = "PRAGMA optimize";


    db.serialize(() => {
        db.run(query1, function (err) {
            if (err) {
                console.error(err.message);
            }
        })
            .run(query2, function (err) {
                if (err) {
                    console.error(err.message);
                }
            })
            .all(query3, [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                }

                callback(rows);

            });

    });

    // Database Optimisation
    db.run(query4, function (err) {
        if (err) {
            console.error(err.message);
        }
    })

    db.close();



}

//Data Generation for QuickChart
function graphJson(dataList) {

    let dataSelectJson = "";
    var oldRow = dataList[0];




    dataList.forEach((row) => {

        if (oldRow.count !== row.count) {

            dataSelectJson += '{"x": "' + moment(oldRow.date).add(config.dateCorrection, 'hours').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + oldRow.count + '},';
            dataSelectJson += '{"x": "' + moment(row.date).add(config.dateCorrection, 'hours').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + row.count + '},';

        }

        oldRow = row;

    });


    let lastItem = dataList[dataList.length - 1];

    dataSelectJson += '{"x": "' + moment().add(3, 'seconds').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + lastItem.count + '},';

    return dataSelectJson;

}


// Chart Generation
function imgGen(datasJson) {



    // Chart generation
    const chart = new QuickChart();

    chart.setWidth(600);
    chart.setHeight(500);
    chart.setBackgroundColor('#2C2F33');


    var chartConf = '{\
                "type": "line",\
                "data": {\
                    "datasets": [\
                        {\
                            "backgroundColor": getGradientFillHelper("vertical", ["#eb3639", "#FA285F", "#a336eb", "#54B2E3"]),\
                            "borderColor": getGradientFillHelper("vertical", ["#eb3639", "#FA285F", "#a336eb", "#54B2E3"]),\
                            "fill": true,\
                            "borderWidth": 1,\
                            "pointRadius": 0,\
                            "lineTension": 0.1,\
                            "data": [' + datasJson + '\
                        ]\
                    },\
                ]\
            },\
            "options": {\
                "responsive": true,\
                "title": {\
                    "display": true,\
                    "text": "Nombre de joueurs",\
                    "fontColor": "#fff"\
                },\
                "legend": {\
                    "display": false,\
                },\
                "scales": {\
                    "xAxes": [{\
                        "type": "time",\
                        "display": true,\
                        "scaleLabel": {\
                            "display": false,\
                            "labelString": "Heure"\
                        },\
                        "ticks": {\
                            "fontColor": "#fff",\
                            "major": {\
                                "enabled": true\
                            }\
                        },\
                        "gridLines": {\
                            "color": "#46413b"\
                        }\
                    }],\
                    "yAxes": [{\
                        "display": true,\
                        "scaleLabel": {\
                            "display": false,\
                            "labelString": "Nombre"\
                        },\
                        "ticks": {\
                            "min": 0,\
                            "fontColor": "#fff",\
                        },\
                        "gridLines": {\
                            "color": "#46413b"\
                        }\
                    }]\
                }\
            }\
        }'

    chart.chart = chartConf;

    chart.toFile(config.chartLocation + '/' + config.chartFileName);



}




// login to Discord with your app's token
client.login(config.token);