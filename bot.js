const MongoClient = require('mongodb').MongoClient;
const {prefix, token, mongoIP} = require('./config.json');
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

let db;
const mongoClient = new MongoClient(mongoIP, {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect(err => {
    if (err) {
        console.log("Could not connect to DB " + err);
        throw "could not connect to db";
    }
    const dbName = 'reminders';
    db = mongoClient.db(dbName);

    console.log(`Successfully connected to the ${dbName} database.`);
});

//random failed attempts at getting emotes programatically
/*let nyaissaknife, nyaissabap, nyaissabapped;
{
    const guilds = client.guilds.cache.map(guild => guild.id);
    guilds.forEach(async guild => {
        if (nyaissaknife == null)
            nyaissaknife = await guild.emojis.cache.get("591695615516213309");
        if (nyaissabap == null)
            nyaissabap = await guild.emojis.cache.get("578493406800773121");
        if (nyaissabapped == null)
            nyaissabapped = await guild.emojis.cache.get("578493464627642378");
    });
}*/
//const nyaissaknife = client.emojis.cache.get("591695615516213309");
//const nyaissabap = client.emojis.cache.get("578493406800773121");
//const nyaissabapped = client.emojis.cache.get("578493464627642378");
//console.log(nyaissaknife.name);

const checkReminders = async () => {
    const currTime = new Date().getTime();
    const guilds = client.guilds.cache.map(guild => guild.id);
    let remindersActive = false;
    for (let i = 0; i < guilds.length; i++) {
        const reminder = await db.collection(guilds[i]).find({}).toArray();
        let length = reminder.length;
        reminder.forEach(element => {
            if (currTime > element.time) {
                const channel = client.channels.cache.get(element.channelID);
                channel.send(`<@${element.userID}>, You wanted to be reminded about: ${element.text}`);
                db.collection(guilds[i]).deleteOne({'_id' : element._id});
                
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

const ParseCommand = (message, author) => {

    const lowerCase = message.content.toLowerCase();
    
    let args = lowerCase.substring(4).split(' ');
    const cmd = args[0];

    if (cmd == "help") {
        helpEmbed.execute(message, helpNames, helpParameters, helpDescriptions);
        return;
    }

    if (cmd == "reminderstatus") {
        message.channel.send("update: " + reminderUpdate);
        return;
    }

    if (!client.commands.has(cmd))
        return;

    messageText = message.content.split(prefix + ' ' + cmd);

    if (cmd == "remindme") {
        /*if (message.content.includes("<@")) { //check for pings
            message.reply("Pings are not allowed in reminders.");
            return;
        }*/
        try {
            client.commands.get(cmd).execute(message, messageText[1], db);
            if (reminderUpdate === false)
                reminderUpdate = setInterval(checkReminders, 30 * 1000);
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
        client.commands.get(cmd).execute(message, messageText[1], db);
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