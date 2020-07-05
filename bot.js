/*const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');*/
const {prefix, token} = require('./config.json');
const helpEmbed = require('./HelpEmbed.js');
const discord = require('discord.js');
const logger = require('winston');
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

client.login(token);

client.on('ready', () => {

    console.log('Connected');
    console.log('Logged in as: ' +
        client.user.username + ' - (' + client.user.id + ')');
});

/*let db;
const mongoClient = new MongoClient("mongodb://127.0.0.1:33000", {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect(err => {
    assert.equal(null, err);
    const dbName = 'reminders';
    console.log(`Successfully connected to the ${dbName} database.`);

    db = mongoClient.db(dbName);
});
*/

let reminderArr = [];

const checkReminders = () => {
    const currTime = new Date().getTime();
    /*const guilds = client.guilds.cache.map(guild => guild.id);
    guilds.forEach(guild => {
        db.collection(guild).find({}).toArray((err, reminder) => {
            reminder.forEach(element => {
                if (currTime > element.time) {
                    const channel = client.channels.cache.get(element.channelID);
                    channel.send(`<@${element.userID}>, You wanted to be reminded about: ${element.text}`);
                    db.collection(guild).deleteOne({'_id' : element._id});
                }
            });
        });
    });*/
    let delArr = [];
    if (reminderArr.length > 0) {
        reminderArr.forEach((element, index) => {
            if (currTime > element.time) {
                const channel = client.channels.cache.get(element.channelID);
                channel.send(`<@${element.userID}>, You wanted to be reminded about: ${element.text}`);
                delArr.unshift(index);
            }
        });
        delArr.forEach(element => {
            reminderArr.splice(element, 1);
        });
    }
}

//In milis so 60 * 1000 is once a minute, clearInterval(reminderUpdate); to stop
const reminderUpdate = setInterval(checkReminders, 15 * 1000);

const ParseCommand = (message, author) => {

    const lowerCase = message.content.toLowerCase();
    
    let args = lowerCase.substring(4).split(' ');
    const cmd = args[0];

    if (cmd == "help") {
        helpEmbed.execute(message, helpNames, helpParameters, helpDescriptions);
        return;
    }

    if (!client.commands.has(cmd))
        return;

    messageText = message.content.split(prefix + ' ' + cmd);

    if (cmd == "remindme") {
        try {
            reminderArr.push(client.commands.get(cmd).execute(message, messageText[1]/*, db*/));
        } catch (error) {
            console.error(error);
            if (error === "Part of given time was above limit") {
                message.reply("One of the given parameters were above limit");
            } else {
                message.reply(`there was an error trying to create the reminder`);
            }
        }
        return;
    }

    try {
        client.commands.get(cmd).execute(message, messageText[1]);
    } catch (error) {
        console.error(error);
        message.reply(`there was an error trying to execute that command`);
    }
}

client.on('message', (message) => {

    const author = message.author;

    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    ParseCommand(message, author);
});