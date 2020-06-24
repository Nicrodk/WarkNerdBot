const {prefix, token} = require('./config.json');
const discord = require('discord.js');
const logger = require('winston');
const fs = require('fs');

// Initialize discord client
const client = new discord.Client();

client.autorun = true;
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(
                file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

let helpString = "```";

client.commands.each(element => {
    helpString += "\n" + prefix + element.help;
});
helpString += "```";

client.login(token);

client.on('ready', () => {

    console.log('Connected');
    console.log('Logged in as: ' +
        client.user.username + ' - (' + client.user.id + ')');
});

let reminderArr = [];

const checkReminders = () => {
    const currTime = new Date().getTime();
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
const reminderUpdate = setInterval(checkReminders, 30 * 1000);

const ParseCommand = (message, author) => {

    const lowerCase = message.content.toLowerCase();
    
    let args = lowerCase.substring(4).split(' ');
    const cmd = args[0];

    if (cmd == "help") {
        message.reply(helpString);
        return;
    }

    if (!client.commands.has(cmd))
        return;

    messageText = message.content.split(prefix + ' ' + cmd);

    if (cmd == "remindme") {
        try {
            reminderArr.push(client.commands.get(cmd).execute(message, messageText[1]));
        } catch (error) {
            console.error(error);
            if (error.includes("Part of given time was above limit")) {
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