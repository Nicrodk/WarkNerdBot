const discord = require('discord.js')

module.exports = {
	name: 'twitchembed',
	description: 'embed that does the pinging of twitch notification role',
	execute(client, userData, pingRoles, pingChannels) {
		let imageURL = userData.thumbnail_url.replace("{width}x{height}", "1920x1080");

		const twitchEmbed = {
			color: 0x9147FF,
			title: userData.user_name + " has gone live!",
			description: userData.title + "\n" + `Playing ${userData.game_name}.`,
			image: {
				url: imageURL
			}
		};
		//Manual role ping setup `<@&${roleid}>`
		pingChannels.forEach(entry => {
			const channel = client.channels.cache.get(entry);
			const pingRole = pingRoles.find(element => element.guildID == channel.guild.id);
			const messageText = `Oi ${pingRole.pingRole}, ${userData.user_name} has gone live!`;
			channel.send(messageText, {embed: twitchEmbed});
		});
	},
};