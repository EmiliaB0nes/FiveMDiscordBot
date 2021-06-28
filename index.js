// require
const Discord = require('discord.js');
const config = require(__dirname + '/config.json');
const axios = require('axios').default;
const moment = require('moment');
const sqlite3 = require('sqlite3');
const QuickChart = require('quickchart-js');
const fs = require('fs');

//Temporary Variable
const historyCleaner = 5;

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
    if (!settings.postId.embed) {

        console.log('Ready!');
        console.log('To set the bot up, type "' + config.botAddCommand + '" on the desired channel');

        // Set channel, post id and send a embed
        client.on('message', message => {
            if (message.content === config.botAddCommand) {



                if (settings.postId.embed) {
                    console.log("Settings already set. Delete the content of channelId and postId on config.json if you want to make another post")
                }
                else {

                    const firstEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('I have been successfully added')
                        .addField('Please start again the bot', '\u200B')


                    message.channel.send(firstEmbed).then(sent => { // 'sent' is that message you just sent


                        console.log("channel: " + sent.channel.id);
                        console.log("embed: " + sent.id);


                        settings.channelId = sent.channel.id;
                        settings.postId.embed = sent.id;


                        fs.writeFile(__dirname + '/config.json', JSON.stringify(settings), (err) => {
                            if (err) console.log('Error writing file:', err)
                            else firstHistory();
                        })

                        function firstHistory() {

                            message.channel.send("**Historique des 7 derniers jours (Beta)**");

                            message.channel.send("History").then(sent => { // 'sent' is that message you just sent


                                console.log("post: " + sent.id);

                                settings.postId.postHistory = sent.id;


                                fs.writeFile(__dirname + '/config.json', JSON.stringify(settings), (err) => {
                                    if (err) console.log('Error writing file:', err)
                                    else process.exit(1);
                                })

                                console.log("Post and channel id set!");

                            });

                        }
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



                    function embedSettings() {
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
                            .setImage(config.chartFolderURL + '/' + config.chartFileName + '.png?ver=' + Math.floor((Math.random() * 999999) + 1))
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
                                imgGen(graphJson(data, config.hoursShown.embed), config.chartFileName + '.png');
                                // imgGen(graphJson(data, config.hoursShown.postHistory), config.chartFileName + '2.png');
                                imgGen(graphJson(dataCleaner(data, historyCleaner), config.hoursShown.postHistory), config.chartFileName + '2.png');
                                //console.log(graphJson(data, config.hoursShown.postHistory));
                            });

                            console.log(playerLogs);
                            embedSettings();
                            postUpdate(settings.postId.embed, fiveEmbed);
                            postUpdate(settings.postId.postHistory, config.chartFolderURL + '/' + config.chartFileName + '2.png?ver=' + Math.floor((Math.random() * 999999) + 1));

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
                                imgGen(graphJson(data, config.hoursShown.embed), config.chartFileName + '.png');
                                // imgGen(graphJson(data, config.hoursShown.postHistory), config.chartFileName + '2.png');
                                imgGen(graphJson(dataCleaner(data, historyCleaner), config.hoursShown.postHistory), config.chartFileName + '2.png');
                                //console.log(graphJson(data, config.hoursShown.postHistory));
                            });
                            embedSettings();
                            postUpdate(settings.postId.embed, fiveEmbed);
                            postUpdate(settings.postId.postHistory, config.chartFolderURL + '/' + config.chartFileName + '2.png?ver=' + Math.floor((Math.random() * 999999) + 1));
                            console.log(playerLogs);

                        });
                    // .then(function () {
                    //     // always executed
                    // });


                    function postUpdate(postId, postMessage) {
                        client.channels.cache.get(config.channelId).messages.fetch(postId).then(messageFeteched => messageFeteched.edit(postMessage));
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
function graphJson(dataList, chartLength) {

    let chartDateLimit = moment().add(-chartLength, 'hours')
    chartDateLimit = moment(chartDateLimit).add(-config.dateCorrection, 'hours')
    let firstData = [];


    dataList.forEach((row) => {

        if (moment(row.date).unix() > moment(chartDateLimit).unix()) {
            firstData.push(row);
        }

    });

    // console.table(firstData);

    let oldRow = firstData[0];
    let dataSelectJson = '{"x": "' + moment(oldRow.date).add(config.dateCorrection, 'hours').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + oldRow.count + '},';
    let dataSorted = [];
    dataSorted.push(firstData[0]);
    firstData = [];


    dataList.forEach((row) => {


        if (moment(row.date).isAfter(chartDateLimit)) {

            if (oldRow.count !== row.count) {
                dataSorted.push(oldRow);
                dataSorted.push(row);
            }

            oldRow = row;

        }

    });


    // Limit data length
    while (dataSorted.length > 1440) {
        dataSorted.shift();
    }
    //console.table(dataSorted);


    dataSorted.forEach((row) => {

        dataSelectJson += '{"x": "' + moment(row.date).add(config.dateCorrection, 'hours').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + row.count + '},';

    });


    let lastItem = dataList[dataList.length - 1];

    dataSelectJson += '{"x": "' + moment().add(3, 'seconds').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + lastItem.count + '},';

    //console.log(dataSelectJson);
    console.log(dataSorted.length);

    return dataSelectJson;

}

// Delete a part of the data
function dataCleaner(data, count) {

    let c = 0;
    let dataCleaned = [];

    data.forEach((row) => {

        if (c === count) {
            dataCleaned.push(row);
            c = 0;
        }
        else {
            c++;
        }

    });

    if (data.length % count !== 0) {

        dataCleaned.push(data[data.length - 1]);

    }

    //console.table(dataCleaned);

    return dataCleaned;
}


// Chart Generation
function imgGen(datasJson, chartFileName) {



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

    chart.toFile(config.chartLocation + '/' + chartFileName);



}




// login to Discord with your app's token
client.login(config.token);