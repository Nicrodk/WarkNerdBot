const {prefix, token} = require('./config.json');
const discord = require('discord.js');
const logger = require('winston');
const fs = require('fs');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    format: logger.format.simple(),
});

logger.level = 'debug';

// Initialize discord client
const client = new discord.Client();

client.autorun = true;
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(token);

client.on('ready', () => {

    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.user + ' - (' + client.id + ')');
});

//In milis so 60 * 1000 is once a minute, clearInterval(reminderUpdate); to stop
/*const reminderUpdate = setInterval(//TODO: input update function name
, 60 * 1000);*/

const parseCommand = (message, author) => {

    const lowerCase = message.content.toLowerCase();
    
    let args = lowerCase.substring(4).split(' ');
    const cmd = args[0];
    args = args.splice(1);

    if (!client.commands.has(cmd))
        return;

    messageText = message.content.split(prefix + ' ' + cmd);

    try {
        client.commands.get(cmd).execute(message, messageText[1], args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command');
    }
}

client.on('message', (message) => {

    let author = message.author;

    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    parseCommand(message, author);
});