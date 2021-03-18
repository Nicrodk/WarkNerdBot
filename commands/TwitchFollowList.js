module.exports = {
	name: 'twitchfollowlist',
	description: 'posts a list of the twitchfollows active for the server',
	parameters: 'none',
	explanation: 'posts a list of the twitchfollows active for the server',
	execute(message, text, db, twitchDb) {
		twitchDb.collection("followEntries").find({"guildID": message.guild.id}).toArray().then(entries => {
			let list = "";
			entries.forEach((entry, index) => {
				list += index+1 + ' ' + entry.name + '\n';
			});
			message.channel.send(list);
		}).catch(err => {
			console.log(err);
		});
	},
};