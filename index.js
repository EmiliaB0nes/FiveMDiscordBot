// require the discord.js module
const Discord = require('discord.js');
const config = require(__dirname + '/config.json');
const axios = require('axios').default;
const moment = require('moment');
const sqlite3 = require('sqlite3');
const QuickChart = require('quickchart-js');

//const db = new sqlite3.Database(__dirname + '/' + config.database);

// create a new Discord client
const client = new Discord.Client();



//
//
// Create a cron job to start the script at boot (Require GNU Screen )
//    @reboot /usr/bin/screen -dmS FiveMDiscordBot  /usr/bin/node /path/to/script/index.js
//
//



// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {

    console.log('Ready!');

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
                            //console.log(playerList[n].name);
                            playerName = playerName + zerofill(playerList[n].id, 3) + ": " + playerList[n].name.substring(0, 17) + '\n';
                            playerPing = playerPing + playerList[n].ping + ' ms\n';
                            playerCount++;
                            playerLogs = playerLogs + playerList[n].name + " - " + playerList[n].ping + 'ms \n';
                            colorStatus = '#006400';
                        }
                    } else {
                        playerName = '\u200B';
                        playerPing = '\u200B';
                        playerLogs = playerLogs + "No player Online";
                        colorStatus = '#FFFF00';
                    }

                    dataUpdate(playerCount);
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
                    colorStatus = '#FF0000';
                    playerLogs = playerLogs + "Server Offline";
                    dataUpdate(playerCount);
                    editStats();
                    embedEdit();
                    console.log(playerLogs);

                });
            // .then(function () {
            //     // always executed
            // });


            function embedEdit() {
                //imgGen();
                client.channels.cache.get(config.channelId).messages.fetch(config.postId).then(messageFeteched => messageFeteched.edit(fiveEmbed));
            }

        }, config.recurrence)

    }

    updateStats();


});




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



// Update data and purge old datas
function dataUpdate(jsonCount) {


    const db = new sqlite3.Database(__dirname + '/' + config.database);

    let query1 = 'INSERT INTO "nbConnected" ("id","count") VALUES (NULL, ' + jsonCount + ')';

    let query2 = "DELETE FROM nbConnected WHERE date <= datetime('now', '-" + config.dataStorageTime + " minutes')";

    let dataSelectJson = "";
    // db.run(query1, function (err) {
    //     if (err) {
    //         console.error(err.message);
    //     }
    // });




    // db.run(query2, function (err) {
    //     if (err) {
    //         console.error(err.message);
    //     }
    // });




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
            .all(`SELECT * FROM nbConnected`, [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                }

                rows.forEach((row) => {
                    //console.log(moment(row.date).add(2, 'hours').format( 'YYYY-MM-DD HH:mm:ss' ));
                    dataSelectJson += '{"x": "' + moment(row.date).add(config.dateCorrection, 'hours').format('YYYY-MM-DD HH:mm:ss') + '", "y": ' + row.count + '},';
                    //countList += '{"x": "' + row.date + '", "y": ' + row.count + '},';
                });
                imgGen(dataSelectJson);
            });

    });
    db.close();

}



// Chart Generation
function imgGen(datasJson) {



    // Chart generation
    const chart = new QuickChart();

    chart.setWidth(600);
    chart.setHeight(400);
    chart.setBackgroundColor('#2C2F33');


    var chartConf = '{\
                "type": "line",\
                "data": {\
                    "datasets": [\
                        {\
                            "label": "Joueurs",\
                            "backgroundColor": "rgba(255, 99, 132, 0.3)",\
                            "borderColor": "rgb(255, 99, 132)",\
                            "fill": true,\
                            "borderWidth": 1,\
                            "pointRadius": 0,\
                            "data": [' + datasJson + '\
                        ]\
                    },\
                ]\
            },\
            "options": {\
                "responsive": true,\
                "title": {\
                    "display": false,\
                    "text": "Nombre de joueurs"\
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
                            "major": {\
                                "enabled": true\
                            }\
                        },\
                        gridLines: {\
                            color: "rgba(119, 119, 119, 0.3)"\
                        }\
                    }],\
                    "yAxes": [{\
                        "display": true,\
                        "scaleLabel": {\
                            "display": true,\
                            "labelString": "Nombre"\
                        },\
                        ticks: {\
                            min: 0,\
                        },\
                        gridLines: {\
                            color: "rgba(119, 119, 119, 0.3)"\
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