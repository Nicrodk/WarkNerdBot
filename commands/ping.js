module.exports = {
	name: 'ping',
	description: 'pingpong',
	execute(message, args) {
		message.channel.send('Pong!');
	},
};