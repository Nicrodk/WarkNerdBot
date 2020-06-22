module.exports = {
	name: 'ping',
	description: 'pingpong',
	help: ' ping, The pong to your ping',
	execute(message, text) {
		message.channel.send('Pong!');
	},
};