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
		'\u0030\uFE0F\u20E3',
		'\u2B05\uFE0F',
		'\u27A1\uFE0F'
		];

//(65)\u0041 = A (90)\u005A = Z \u00C6 = Æ \u00D8 = Ø \u00C5 = Å

module.exports = {
	name: 'helpembed',
	description: 'embed to better show help',
	async execute(message, helpNames, helpParameters, helpDescriptions) {
		const leftArrow = '\u2B05\uFE0F';
		const rightArrow = '\u27A1\uFE0F';

		const pages = Math.ceil(helpNames.length/10);
		let pageEmbedArr = [];
		for (let currPage = 0; currPage < pages; currPage++) {
			let currEmbed = new discord.MessageEmbed()
				.setColor('#2D9900')
				.setTitle('List of commands')
				.setDescription('React with the appropiate numbered reaction to get specific information about the command or right arrow to change page');
			if (currPage == pages-1) {
				for (let i = 0; i < helpNames.length%10; i++) {
					currEmbed.addField('Command ' + (i+1+(currPage*10)), ' ' + helpNames[i+(currPage*10)]);
				}
				pageEmbedArr.push(currEmbed);
			} else {
				for (let i = 0; i < 10; i++) {
					currEmbed.addField('Command ' + (i+1+(currPage*10)), ' ' + helpNames[i+(currPage*10)]);
				}
				pageEmbedArr.push(currEmbed);
			}
		}
		let page = 0;
		const m = await message.channel.send(pageEmbedArr[page]);

		for (let i = 0; i < 10; i++) {
			await m.react(reactArr[i]);
		}
		await m.react(rightArrow);

		const filter = (reaction, user) => reactArr.includes(reaction.emoji.name) && user.id == message.author.id;
		const collector = m.createReactionCollector(filter, {time: 2*60*1000});

		collector.on('collect', async (reaction, user) => {
			const emojiName = reaction.emoji.name;
			const index = reactArr.indexOf(emojiName);
			m.reactions.removeAll();

			if (emojiName == rightArrow) {
				page++;
				if (page > pages-1)
					page = 0;
				m.edit(pageEmbedArr[page]);
				if (page == pages-1) {
					for (let i = 0; i < helpNames.length%10; i++) {
						await m.react(reactArr[i]);
					}
					await m.react(rightArrow);
				} else {
					for (let i = 0; i < 10; i++) {
						await m.react(reactArr[i]);	
					}
					await m.react(rightArrow);
				}
				collector.resetTimer({time: 2*60*1000});
			} else if (emojiName == leftArrow) {
				m.edit(pageEmbedArr[page]);
				if (page == pages-1) {
					for (let i = 0; i < helpNames.length%10; i++) {
						await m.react(reactArr[i]);
					}
					await m.react(rightArrow);
				} else {
					for (let i = 0; i < 9; i++) {
						await m.react(reactArr[i]);	
					}
					await m.react(rightArrow);
				}
				collector.resetTimer({time: 2*60*1000});
			} else {
				const embed = new discord.MessageEmbed()
					.setColor('#2D9900')
					.setTitle(helpNames[index+(page*10)])
					.setDescription('React with left arrow to go back')
					.addField('Parameters', helpParameters[index+(page*10)])
					.addField('Description', helpDescriptions[index+(page*10)]);

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