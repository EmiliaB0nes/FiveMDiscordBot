// require the discord.js module
const Discord = require('discord.js');
const config = require('./config.json');


// create a new Discord client
const client = new Discord.Client();



// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {

    console.log('Ready!');

});



// Only for first run!

client.on('message', message => {
	if (message.content === config.prefix + 'veryLongBotAdd') {
		// send back "Pong." to the channel the message was sent in
		message.channel.send('Hi!');
	}
});



// login to Discord with your app's token
client.login(config.token);



