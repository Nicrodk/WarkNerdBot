const discord = require('discord.js')

module.exports = {
	name: 'helplist',
	description: 'embed to better show help',
	parameters: 'None',
	explanation: "Makes an embed of the full command list",
	execute(message, helpNames) {
		const listEmbed = new discord.MessageEmbed()
				.setColor('#2D9900')
				.setTitle('List of commands')
				.setDescription('React with the appropiate numbered reaction to get specific information about the command or right arrow to change page');
		for (let i = 0; i < helpNames.length; i++) {
			listEmbed.addField('Command ' + (i+1), ' ' + helpNames[i]);
		}
		message.channel.send(listEmbed);
	},
};