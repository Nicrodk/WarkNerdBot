const discord = require('discord.js')

const reactArr = [
		'\u0031\uFE0F\u20E3',
		'\u0032\uFE0F\u20E3',
		'\u0033\uFE0F\u20E3',
		'\u0034\uFE0F\u20E3',
		'\u0035\uFE0F\u20E3',
		'\u0036\uFE0F\u20E3',
		'\u0037\uFE0F\u20E3',
		'\u0038\uFE0F\u20E3',
		'\u0039\uFE0F\u20E3',
		'\u0030\uFE0F\u20E3'
		];

//(65)\u0041 = A (90)\u005A = Z \u00C6 = Æ \u00D8 = Ø \u00C5 = Å
/*const reactNames = [
		'1️⃣',
		'2️⃣',
		'3️⃣',
		'4️⃣',
		'5️⃣',
		'6️⃣',
		'7️⃣',
		'8️⃣',
		'9️⃣',
		'0️⃣'
		];*/

module.exports = {
	name: 'helpembed',
	description: 'embed to better show help',
	async execute(message, helpNames, helpParameters, helpDescriptions) {
		const leftArrow = '\u2B05\uFE0F';

		const listEmbed = new discord.MessageEmbed()
				.setColor('#2D9900')
				.setTitle('List of commands')
				.setDescription('React with the appropiate numbered reaction to get specific information about the command');

		for (let i = 0; i < helpNames.length; i++) {
			listEmbed.addField('Command ' + (i+1), ' ' + helpNames[i]);
		}

		const m = await message.channel.send(listEmbed);

		for(let i = 0; i < helpNames.length; i++) {
			//const emoji = message.guild.emojis.cache.find(emoji => emoji.name == reactArr[i]);
			await m.react(reactArr[i]);
		}

		const filter = (reaction, user) => (reactArr.includes(reaction.emoji.name) || reaction.emoji.name == leftArrow) && user.id == message.author.id;
		const collector = m.createReactionCollector(filter, {time: 2*60*1000});

		collector.on('collect', async (reaction, user) => {
			const emojiName = reaction.emoji.name;
			console.log({"name": emojiName});
			const index = reactArr.indexOf(emojiName);
			m.reactions.removeAll();

			if (emojiName == leftArrow) {
				m.edit(listEmbed);
				for(let i = 0; i < helpNames.length; i++) {
					//const emoji = message.guild.emojis.cache.find(emoji => emoji.name == reactArr[i]);
					await m.react(reactArr[i]);
				}
				collector.resetTimer({time: 2*60*1000});
			} else {
				const embed = new discord.MessageEmbed()
					.setColor('#2D9900')
					.setTitle(helpNames[index])
					.setDescription('React with left arrow to go back')
					.addField('Parameters', helpParameters[index])
					.addField('Description', helpDescriptions[index]);

				collector.resetTimer({time: 2*60*1000});
				m.edit(embed);
				await m.react(leftArrow);
			}
		});
		
		collector.on('end', () => {
			m.reactions.removeAll();
		});
	},
};