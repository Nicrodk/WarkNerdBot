const discord = require('discord.js')

const reactArr = [
		':one:',
		':two:',
		':three:',
		':four:',
		':five:',
		':six:',
		':seven:',
		':eight:',
		':nine:'
		];

module.exports = {
	name: 'helpembed',
	description: 'embed to better show help',
	execute(message, helpNames, helpParameters, helpDescriptions) {
		const listEmbed = new discord.MessageEmbed()
				.setColor('#007FFF')
				.setTitle('List of commands');
				.setDescription('React with the appropiate numbered reaction to get specific information about the command');

		for (let i = 0; i < helpNames; i++) {
			listEmbed.addField((i+1) + ' ' + helpNames[i]);
		}
		message.channel.send(listEmbed)
			.then(async (m) => {
				let collectorArr = [];
				for(let i = 0; i < helpNames; i++) {
					const emoji = message.guild.emojis.cache.find(emoji => emoji.name == reactArr[i]);
					await m.react(emoji.id);
					const filter = (reaction, user) => reaction.emoji.name == reactArr[i] && user.id == message.author.id;
					collectorArr.push(m.createReactionCollector(filter, {max: 1, time: 5*60*1000}));
				}
				collectorArr.forEach((element, index) => {
					element.on('collect', () => {
						m.reactions.removeAll();

						const embed = new discord.MessageEmbed()
							.setColor('#007FFF')
							.setTitle(helpNames[index])
							.addField('Parameters', helpParameters[index])
							.addField('Description', helpDescriptions[index]);

						m.edit(embed);
					});
				});
			});
		
	},
};

/*for (let i = 0; i < helpNames.length; i++) {
			listEmbed.addFields(
				{name: 'Parameters', value: helpNames[i]},
				{name: 'Description', value: helpDescriptions[i]},
			);
		}*/