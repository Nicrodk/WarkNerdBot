module.exports = {
	name: 'twitchfollow',
	description: 'Command to add a twitch channel to the list for checking going live and putting it in the database',
	parameters: 'streamName',
	explanation: "Adds a channel to the list being checked",
	execute(message, text, reminderDb, twitchDb) {
		text = text.toLowerCase();
		twitchDb.collection('followEntries').findOne({"name": text, "channelID": message.channel.id}).then(entry => {
			if (entry) {
				message.reply("That entry is already in the database");
			} else {
				const twitchEntry = {
				"name": 	text,
				"status": 	"offline",
				"channelID":message.channel.id,
				"guildID": 	message.guild.id
				};

				twitchDb.collection('followEntries').insertOne(twitchEntry).then(() => {
					message.reply(`I have added ${text} to the follow DB`);
				}).catch(err => {
					console.log(err);
					message.reply("An error happened while trying to add that channel to the database");
				});
			}
		}).catch(err => {
			console.log(err);
		});
	},
};