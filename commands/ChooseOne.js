module.exports = {
	name: 'chooseone',
	description: 'Chooses between the given options at random',
	parameters: 'option1;option2;option3;...;optionX',
	explanation: 'Have the bot pick an option for you.',
	execute(message, text, db) {
		const parts = text.split(';');
		const num = Math.floor(Math.random() * (parts.length));
		message.reply(parts[num]);
	},
};