const {prefix, token} = require('./config.json');
const discord = require('discord.js');
const logger = require('winston');
const fs = require('fs');

// Initialize discord client
const client = new discord.Client();

client.autorun = true;
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter( file => file.endsWith('.js'));

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

//In milis so 60 * 1000 is once a minute, clearInterval(reminderUpdate); to stop
/*const reminderUpdate = setInterval(//TODO: input update function name
, 60 * 1000);*/

const parseCommand = (message, author) => {

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

    parseCommand(message, author);
});