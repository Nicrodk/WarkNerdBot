const twitchEmbed = require('./embeds/TwitchEmbed.js');
const helpEmbed = require('./embeds/HelpEmbed.js');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const discord = require('discord.js');
const cron = require('node-cron');
const logger = require('winston');
const axios = require('axios');
const fs = require('fs');

// Initialize discord client
const client = new discord.Client();

client.autorun = true;
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(
	file => file.endsWith('.js'));

let helpNames = [];
let helpParameters = [];
let helpDescriptions = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	helpNames.push(command.name);
	helpParameters.push(command.parameters);
	helpDescriptions.push(command.explanation);
}

client.login(config.token);

client.on('ready', () => {
	console.log('Connected');
	console.log('Logged in as: ' + client.user.username + ' - (' + client.user.id + ')');
	client.user.setActivity("Trying its best");
});

let reminderDb, twitchDb;
let onlineStatus = [];

const initializeOnlineStatus = async () => {
	const streamNames = await twitchDb.collection('followEntries').find({}).toArray();
	streamNames.forEach(entry => {
		const foundIndex = onlineStatus.findIndex(element => element.name == entry.name);
		if (foundIndex >= 0 && !onlineStatus[foundIndex].channelIDs.includes(entry.channelID))
			onlineStatus[foundIndex].channelIDs.push(entry.channelID);
		else if (foundIndex == -1)
			onlineStatus.push({'name': entry.name, 'status': "offline", 'channelIDs': [entry.channelID]});
	});
}

const updateOnlineStatus = async () => {
	const streamNames = await twitchDb.collection('followEntries').find({}).toArray();
	let newArr = [];
	for (let i = 0; i < streamNames.length; i++) {
		const foundIndex = newArr.findIndex(element => element.name == streamNames[i].name);
		if (foundIndex >= 0 && !newArr[foundIndex].channelIDs.includes(streamNames[i].channelID))
			newArr[foundIndex].channelIDs.push(streamNames[i].channelID);
		else if (foundIndex == -1)
			newArr.push({'name': streamNames[i].name, 'status': "offline", 'channelIDs': [streamNames[i].channelID]});
	}
	for (let i = 0; i < newArr.length; i++) {
		const foundIndex = onlineStatus.findIndex(element => element.name == streamNames[i].name);
		if (foundIndex >= 0)
			newArr[i].status = onlineStatus[foundIndex].status;
	}
	onlineStatus = newArr;
}

const mongoClient = new MongoClient(config.mongoIP, {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect(err => {
	if (err) {
		console.log("Could not connect to db " + err);
		throw "could not connect to db";
	}
	reminderDb = mongoClient.db('reminders');
	console.log(`Successfully connected to the reminders database.`);

	twitchDb = mongoClient.db('TwitchStuff');
	console.log(`Successfully connected to the twitchStuff database.`);

	initializeOnlineStatus();
});

let twitchAccessToken;

const accessTokenRequest =
	'https://id.twitch.tv/oauth2/token' +
	`?client_id=${config.twitchClientID}` +
	`&client_secret=${config.twitchClientSecret}` +
	'&grant_type=client_credentials';

const getTwitchAccessToken = () =>
	axios.post(accessTokenRequest, {}).then(res => {
		console.log(`statusCode: ${res.status} statusMessage: ${res.statusText}`);
		console.log(res.data);
		twitchAccessToken = res.data.access_token;
	}).catch(console.error);

let logTwitch = false;
const checkTwitchChannels = async () => {
	if (onlineStatus.length === 0) {
		return;
	}
	const pingRoles = await twitchDb.collection('pingRoles').find({}).toArray();
	if (pingRoles.length === 0) {
		return;
	}
	let twitchGetRequest = `https://api.twitch.tv/helix/streams?user_login=${onlineStatus[0].name}`;
	for (let i = 1; i < onlineStatus.length; i++) {
		twitchGetRequest += '&user_login=' + onlineStatus[i].name;
	}
	try {
		const response = await axios.get(twitchGetRequest, {
			headers: { 'client-id': config.twitchClientID, Authorization: 'Bearer ' + twitchAccessToken }
		});
		if (logTwitch) {
			console.log(Date(), response.data.data);
			logTwitch = false;
		}
		let foundArr = [];
		for (let i = 0; i < response.data.data.length; i++) {
			const foundElement = onlineStatus.find(element => element.name == response.data.data[i].user_login)
			if (foundElement) {
				foundArr.push(response.data.data[i].user_login);
				if (foundElement.status != response.data.data[i].type) {
					foundElement.status = response.data.data[i].type;
					twitchEmbed.execute(client, response.data.data[i], pingRoles, foundElement.channelIDs);
				}
			} else {
				console.log("Stream data received for non followed stream");
			}
		}
		onlineStatus.forEach(element => {
			if (!foundArr.includes(element.name))
				element.status = "offline";
		});
	} catch (err) {
		console.log(err.response.data);
		if (err.response.status == 401) {
			await getTwitchAccessToken()
			.then(checkTwitchChannels);
		}
	}
}

const checkReminders = async () => {
	const currTime = Date.now()
	const guildIds = client.guilds.cache.map(guild => guild.id);
	const reminderCollections = await Promise.all(
		guildIds.map(
			guildId => reminderDb.collection(guildId).find({}).toArray()
			)
		);
	const remindersToSend = reminderCollections.reduce((carry, collection) => {
		return [...carry, ...collection]
	}, []).filter(element => element.time < currTime);
	//Might want "await Promise.all(remimderCollection.map(async collection =>" if race conditions act up
	remindersToSend.forEach(async element => {
		const channel = client.channels.cache.get(element.channelID);
		channel.send(`<@${element.userID}>, You wanted to be reminded about: ${element.text}`);
		reminderDb.collection(element.guildID).deleteOne({'_id' : element._id});

		const filter = message => message.author.id == element.userID;
		const collector = new discord.MessageCollector(channel, filter, {time: 5*60*1000, max: 1});
		collector.on('collect', message => {
			if (message.content.toLowerCase().includes('bitch')) {
				message.reply(`<:nyaissaknife:591695615516213309>`);
			} else if (message.content.includes('aissabap')) {
				message.channel.send(`<:nyaissabapped:578493464627642378>`);
			}
		});
	});
}

const cookieDaily = () => {
	reminderDb.collection('cookies').updateMany({}, {$set:{"dailyReady": true}});
}

cron.schedule('*/30 * * * * *', () => {
	checkReminders();
});
cron.schedule('*/15 * * * * *', () => {
	checkTwitchChannels();
});
cron.schedule('* * * * *', () => {
	updateOnlineStatus();
});
cron.schedule('0 0 * * *', () => {
	cookieDaily();
});

const ParseCommand = (message, author) => {

	const lowerCase = message.content.toLowerCase();

	let args = lowerCase.substring(config.prefix.length + 1).split(' ');
	const cmd = args[0];

	if (cmd == "logtwitch" && message.author.id == config.botCreatorID)
		logTwitch = true;

	if (cmd === "help") {
		helpEmbed.execute(message, helpNames, helpParameters, helpDescriptions);
		return;
	} else if (cmd === "helplist") {
		client.commands.get(cmd).execute(message, helpNames);
		return;
	} else if (!client.commands.has(cmd)) {
		return;
	}

	const messageText = message.content.split(config.prefix + ' ' + cmd + ' ');

	if (cmd === "remindme") {
		try {
			client.commands.get(cmd).execute(message, messageText[1], reminderDb, twitchDb);
		} catch (error) {
			console.error(error);
			if (error === "Part of given time was above limit") {
				message.reply("One of the given parameters were above limit");
			} else {
				message.reply(`There was an error trying to create the reminder`);
			}
		}
		return;
	}

	try {
		client.commands.get(cmd).execute(message, messageText[1], reminderDb, twitchDb);
	} catch (error) {
		console.error(error);
		message.reply(`There was an error trying to execute that command`);
	}
}

client.on('message', (message) => {

	const author = message.author;

	if (!message.content.startsWith(config.prefix) || message.author.bot)
		return;

	ParseCommand(message, author);
});
