module.exports = {
	name: 'pingrole',
	description: 'Command to set the role twitch notifications will ping',
	parameters: 'roleToPing',
	explanation: "Adds or updates this servers pingrole for twitch notifications",
	execute(message, text, reminderDb, twitchDb) {
		twitchDb.collection('pingRoles').findOne({'guildID': message.guild.id}).then(pingRole => {
			if (pingRole) {
				twitchDb.collection('pingRoles').updateOne({'guildID': message.guild.id}, {'pingRole': text})
					.then(() => {
						const role = message.guild.roles.cache.find(role => role.id == text.match(/(\d+)/));
						message.reply(`I have succesfully updated this servers pingrole to ${role.name}`);
					}).catch(err => {
						console.log(err);
						message.reply('An error happened while trying to update the ping role');
					});
			} else {
				twitchDb.collection('pingRoles').insertOne({'pingRole': text, 'guildID': message.guild.id})
					.then(() => {
						message.reply('Succesfully added a ping role for this server');
					}).catch(err => {
						console.log(err);
						message.reply('An error happened while trying to add a ping role for this server');
					});
			}
		});
	},
};