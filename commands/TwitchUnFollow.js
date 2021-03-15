module.exports = {
	name: 'twitchunfollow',
	description: 'Command to remove a channelID from the notification list',
	parameters: 'streamName',
	explanation: "Removes a channel from the list being checked",
	execute(message, text, reminderDb, twitchDb) {
		twitchDb.collection('followEntries').deleteOne({"name": text, "guildID": message.guild.id}).then(() => {
			message.reply(`I have removed ${text} from the follow DB`);
		}).catch(err => {
			console.log(err);
			message.reply("An error happened while trying to remove that channel from the DB");
		});
	},
};