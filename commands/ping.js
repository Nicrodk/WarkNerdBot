module.exports = {
	name: 'ping',
	description: 'pingpong',
	parameters: 'none',
	explanation: 'Check if the bot lives',
	execute(message, text, db) {
		message.channel.send('Pong!');
	},
};