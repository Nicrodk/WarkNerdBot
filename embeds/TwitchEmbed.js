const discord = require('discord.js')

module.exports = {
	name: 'twitchembed',
	description: 'embed that does the pinging of twitch notification role',
	execute(client, userData, pingRoles, pingChannels) {
		const twitchEmbed = new discord.MessageEmbed()
				.setColor('#9147FF')
				.setTitle(userData.user_name + " has gone live!")
				.setDescription(userData.title + "\n" + `Playing ${userData.game_name}.`)
				.setImage(userData.thumbnail_url);

		pingChannels.forEach(entry => {
			const channel = client.channels.cache.get(entry.channelID);
			const pingRole = pingRoles.find(element => element.guildID == channel.guild.id);
			channel.send(`Oi ${pingRole.pingRole}, ${userData.user_name} has gone live!`, listEmbed);
			//Manual role ping setup `<@&${roleid}>`
		});
	},
};