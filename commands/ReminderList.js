module.exports = {
	name: 'reminderlist',
	description: 'posts a list of the reminders active for the server',
	parameters: 'none',
	explanation: 'posts a list of the reminders active for the server',
	execute(message, text, db, twitchDb) {
		let replyString = "";
		db.collection(message.guild.id).find({}).toArray((err, reminders) => {
			reminders.forEach((element, index) => {
				let name = message.guild.member(element.userID).nickname;
				if (name == null)
					name = message.guild.member(element.userID).user.username;
				replyString += index+1 + ": " + name + " " + element.text + "\n";
			});
			if (replyString != "")
				message.channel.send(replyString);
			else
				message.channel.send("No reminders found");
		});
	},
};