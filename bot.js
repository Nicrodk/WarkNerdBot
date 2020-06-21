const fs = require('fs');
const discord = require('discord.io');
const logger = require('winston');
const {prefix, token} = require('./config.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize discord client
const client = new discord.Client();

client.commands = new discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', function (evt) {

    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.username + ' - (' + client.id + ')');
});

//In milis so 60 * 1000 is once a minute, clearInterval(reminderUpdate); to stop
/*const reminderUpdate = setInterval(//TODO: input update function name
, 60 * 1000);*/

const parseCommand = (message, author) => {

    const lowerCase = message.toLowerCase();
    
    let args = lowerCase.substring(4).split(' ');
    const cmd = args[0];
       
    args = args.splice(1);
    switch(cmd) {
        // !ping
        case 'ping':
            client.commands.get('ping').execute(message, args);
        break;
    }
}

client.on('message', function (user, userID, channelID, message, evt) {

    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    parseCommand(message, author);
});

client.login(token);