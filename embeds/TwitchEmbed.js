const discord = require('discord.js')

module.exports = {
	name: 'twitchembed',
	description: 'embed that does the pinging of twitch notification role',
	async execute(client, userData, pingRoles, pingChannels) {
		const curTime = Date.now();
		let actualPingChannels = [];
		for (let i = 0; i < pingChannels.length; i++) {
			const channel = client.channels.cache.get(pingChannels[i]);
			let collection = await channel.messages.fetch();
			collection = collection.filter(msg => msg.author.id == client.user.id);
			const messageArr = collection.array();
			let foundMessages = [];
			for (let j = 0; j < messageArr.length; j++) {
				console.log(messageArr[j].createdTimestamp + 30*60*1000);
				if (messageArr[j].createdTimestamp + 30*60*1000 > curTime
					&& messageArr[j].content.includes(userData.user_name)) {
					foundMessages.push(pingChannels[i]);
				}
			}
			if (foundMessages.length <= 0) {
				actualPingChannels.push(pingChannels[i]);
			}
		}
		let imageURL = userData.thumbnail_url.replace("{width}x{height}", "1920x1080");
		imageURL += '?' + Math.floor(Math.random() * 10000000);

		const twitchEmbed = {
			color: 0x9147FF,
			title: userData.user_name + " has gone live!",
			description: `${userData.title}\nPlaying ${userData.game_name}.\n[Watch now, click here](https://twitch.tv/${userData.user_name})`,
			image: {
				url: imageURL
			}
		};
		//Manual role ping setup `<@&${roleid}>`
		actualPingChannels.forEach(entry => {
			const channel = client.channels.cache.get(entry);
			const pingRole = pingRoles.find(element => element.guildID == channel.guild.id);
			const messageText = `Oi ${pingRole.pingRole}, ${userData.user_name} has gone live!`;
			channel.send(messageText, {embed: twitchEmbed});
		});
	},
};