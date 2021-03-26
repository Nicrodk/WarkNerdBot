module.exports = {
	name: 'reminderlist',
	description: 'posts a list of the reminders active for the server',
	parameters: 'none',
	explanation: 'posts a list of the reminders active for the server',
	async execute(message, text, db, twitchDb) {
		let replyString = "";
		const reminders = await db.collection(message.guild.id).find({}).toArray();
		for (let i = 0; i < reminders.length; i++) {
			const member = await message.guild.members.fetch(reminders[i].userID);
			replyString += i+1 + ": " + member.displayName + " " + reminders[i].text + "\n";
		}
		if (replyString != "")
			message.channel.send(replyString);
		else
			message.channel.send("No reminders found");
	},
};