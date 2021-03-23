const seed = require('seedrandom')

const msgArr = [
		"It is certain",
		"It is decidedly so",
		"Without a doubt",
		"Yes - definitely",
		"You may rely on it",
		"As I see it, yes",
		"Most likely",
		"Outlook good",
		"Yes",
		"Signs point to yes",
		"You must consult the great squirrel council about this matter",
		"Reply hazy, try again",
		"Ask again later",
		"Better not tell you now",
		"Cannot predict now",
		"Concentrate and ask again",
		"Don't count on it",
		"My reply is no",
		"My sources say no",
		"Outlook not so good",
		"Very doubtful"
		];

module.exports = {
	name: '8ball',
	description: 'Answers for the questions',
	parameters: 'inqury',
	explanation: 'Ask the 8ball whatever you please and it will respond',
	execute(message, text, db, twitchDb) {
		const rand = seed(text + new Date().getHours() + message.author.id);
		const number = rand();
		msgArr.forEach((element, index) => {
			if (number < 1/msgArr.length * (index+1) &&
				number > 1/msgArr.length * index)
				message.channel.send(msgArr[index]);
		});
	},
};