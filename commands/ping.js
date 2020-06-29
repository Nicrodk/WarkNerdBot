module.exports = {
	name: 'ping',
	description: 'pingpong',
	parameters: 'none',
	explanation: 'Check if the bot lives',
	//help: ' ping, The pong to your ping',
	execute(message, text) {
		message.channel.send('Pong!');
	},
};