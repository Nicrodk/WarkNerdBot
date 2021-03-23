module.exports = {
	name: 'ping',
	description: 'pingpong',
	parameters: 'none',
	explanation: 'Check if the bot lives',
	execute(message, text, db, twitchDb) {
		message.channel.send('Pong!');
	},
};