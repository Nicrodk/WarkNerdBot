module.exports = {
	name: 'ping',
	description: 'pingpong',
	execute(message, text, args) {
		message.channel.send('Pong!');
	},
};