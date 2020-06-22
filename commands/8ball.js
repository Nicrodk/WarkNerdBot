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
		"Reply hazy, try again",
		"Ask again later",
		"Better not tell you now",
		"Cannot predict now",
		"Concentrate and ask again",
		"Don't count on it",
		"My reply is no",
		"My sources say no",
		"Outlook not so good",
		"Very doubtful"];

module.exports = {
	name: '8ball',
	description: 'Answers for the questions',
	help: ' 8ball <inqury>, What does the 8ball have to say today',
	execute(message, text) {
		const rand = seed(text + new Date().getHours());
		const number = rand();
		msgArr.forEach((element, index) => {
			if (number < 1/msgArr.length * (index+1) &&
				number > 1/msgArr.length * index)
				message.channel.send(msgArr[index]);
		});
	},
};