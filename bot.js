const twitchEmbed = require('./embeds/TwitchEmbed.js');
const helpEmbed = require('./embeds/HelpEmbed.js');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const discord = require('discord.js');
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
        const foundIndex = newArr.findIndex(element => element.name == entry.name);
        if (foundIndex >= 0 && !newArr[foundIndex].channelIDs.includes(entry.channelID))
            newArr[foundIndex].channelIDs.push(entry.channelID);
        else if (foundIndex == -1)
            newArr.push({'name': entry.name, 'status': "offline", 'channelIDs': [entry.channelID]});
    }
    for (let i = 0; i < newArr.length; i++) {
        const foundIndex = onlineStatus.findIndex(element => element.name == entry.name);
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
    reminderDb = mongoClient.db('testReminders');
    console.log(`Successfully connected to the reminders database.`);

    twitchDb = mongoClient.db('testTwitchStuff');
    console.log(`Successfully connected to the twitchStuff database.`);

    initializeOnlineStatus();
});

let twitchAccessToken;

const accessTokenRequest =
    'https://id.twitch.tv/oauth2/token' +
    `?client_id=${config.twitchClientID}` +
    `&client_secret=${config.twitchClientSecret}` +
    '&grant_type=client_credentials';

const getTwitchAccessToken = () => {
    axios.post(accessTokenRequest, {}).then(res => {
        console.log(`statusCode: ${res.status} statusMessage: ${res.statusText}`);
        console.log(res.data);
        twitchAccessToken = res.data.access_token;
    }).catch(err => {
        console.error(err);
    });
}

const checkTwitchChannels = () => {
    if (onlineStatus.length > 0) {
        twitchDb.collection('pingRoles').find({}).toArray().then(pingRoles => {
            if (pingRoles.length > 0) {
                let twitchGetRequest = `https://api.twitch.tv/helix/streams?user_login=${onlineStatus[0].name}`;
                for (let i = 1; i < onlineStatus.length; i++) {
                    twitchGetRequest += '&user_login=' + onlineStatus[i].name;
                }
                axios.get(twitchGetRequest, {
                    headers: {'client-id': config.twitchClientID, Authorization: 'Bearer ' + twitchAccessToken}
                }).then(response => {
                    console.log(response.data);
                    let foundArr = [];
                    response.data.forEach(entry => {
                        const foundIndex = onlineStatus.findIndex(element => element.name == entry.user_login);
                        if (found >= 0 && onlineStatus[found].status != entry.type) {
                            foundArr.push(entry.user_login);
                            onlineStatus[found].status = entry.type;
                            twitchEmbed.execute(client, entry, pingRoles, onlineStatus[found].channelIDs);
                        } else if (found == -1) {
                            console.log("Stream data received for non followed stream");
                        }
                    });
                    onlineStatus.forEach((element, index) => {
                        if (!foundArr.includes(element.name))
                            onlineStatus[index].status = "offline";
                    });
                }).catch(err => {
                    console.log(err.response.data);
        
                    if (err.response.status == 401) {
                        getTwitchAccessToken();
                        setTimeout(checkTwitchChannels, 3000);
                    }
                });
            }
        });
    }
}

const checkReminders = async () => {
    const currTime = new Date().getTime();
    const guilds = client.guilds.cache.map(guild => guild.id);
    let remindersActive = false;
    for (let i = 0; i < guilds.length; i++) {
        const reminder = await reminderDb.collection(guilds[i]).find({}).toArray();
        let length = reminder.length;
        reminder.forEach(element => {
            if (currTime > element.time) {
                const channel = client.channels.cache.get(element.channelID);
                channel.send(`<@${element.userID}>, You wanted to be reminded about: ${element.text}`);
                reminderDb.collection(guilds[i]).deleteOne({'_id' : element._id});
                
                const filter = message => message.author.id == element.userID;
                const collector = new discord.MessageCollector(channel, filter, {time: 5*60*1000});
                collector.on('collect', message => {
                    if (message.content.toLowerCase().includes('bitch'))
                        message.reply(`<:nyaissaknife:591695615516213309>`);
                    else if (message.content.includes('aissabap'))
                        message.channel.send(`<:nyaissabapped:578493464627642378>`);

                    collector.stop("User send a message");
                });
                length--;
            }
        });
        if (length >= 1)
            remindersActive = true;
    }
    if (!remindersActive) {
        reminderUpdate = false;
    }
}

//In milis so 60 * 1000 is once a minute, clearInterval(reminderUpdate); to stop
let reminderUpdate = setInterval(checkReminders, 30 * 1000);
let twitchUpdate = setInterval(checkTwitchChannels, 15 * 1000);
let onlineStatusUpdate = setInterval(updateOnlineStatus, 60 * 1000);

const ParseCommand = (message, author) => {

    const lowerCase = message.content.toLowerCase();
    
    let args = lowerCase.substring(config.prefix.length + 1).split(' ');
    const cmd = args[0];

    if (cmd === "help") {
        helpEmbed.execute(message, helpNames, helpParameters, helpDescriptions);
        return;
    } else if (cmd === "helplist") {
        client.commands.get(cmd).execute(message, helpNames);
        return;
    } else if (cmd === "reminderstatus") {
        message.channel.send("update: " + reminderUpdate);
        return;
    } else if (!client.commands.has(cmd))
        return;

    messageText = message.content.split(config.prefix + ' ' + cmd);

    if (cmd === "remindme") {
        /*if (message.content.includes("<@")) { //check for pings
            message.reply("Pings are not allowed in reminders.");
            return;
        }*/
        try {
            client.commands.get(cmd).execute(message, messageText[1], reminderDb, twitchDb);
            if (reminderUpdate === false)
                reminderUpdate = setInterval(checkReminders, 30 * 1000);
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