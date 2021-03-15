module.exports = {
	name: 'wafflecannon',
	description: 'A command only Doka can do which will post a message and ping a target person',
	parameters: 'PingTarget',
	explanation: "Doka's waffle cannon targeting service",
	execute(message, text, db, twitchDb) {
		if (message.author.id == 178356872192065539) {
			target = text.match(/(\d+)/);
			message.channel.send(`Firing a delicious waffle at <@${target[0]}>`);
		} else {
			message.reply("only the Doka has the power to use the waffle cannon");
		}
	},
};