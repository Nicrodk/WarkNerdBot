module.exports = {
	name: 'reminderlist',
	description: 'posts a list of the reminders active for the server',
	parameters: 'none',
	explanation: 'posts a list of the reminders active for the server',
	execute(message, text, db) {
		let replyString = "";
		db.collection(message.guild.id).find({}).toArray((err, reminders) => {
			reminder.forEach((element, index) => {
				replyString += `${index}: ${element.userID} ${element.text}\n`;
			});
		});
		message.channel.send(replyString);
	},
};