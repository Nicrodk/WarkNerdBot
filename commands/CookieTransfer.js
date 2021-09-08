const discord = require('discord.js');

module.exports = {
	name: 'cookietransfer',
	description: 'Command that allows transfer of cookies between people',
	parameters: 'cookieAmount userPing',
	explanation: "Command that will let you give some or all of your cookies to someone else",
	execute(message, text, db, twitchDb) {
		if (typeof text == 'undefined')
			throw ("args are undefined");
		try {
		const target = text.match(/<@!(\d+)>/);
		if (target == null)
			throw("target is null");
		let amount = text.match(/(\d+)\s*\w*/);
		if (amount == null)
			throw("amount is null");
		amount = parseInt(amount[1]);
		if (isNaN(amount))
			throw("could not parse amount");
		db.collection('cookies').findOne({"userID": message.author.id})
		.then(async (res) => {
			if (res.cookies >= amount && amount >= 0) {
				const member = await message.guild.members.fetch(message.author.id);
				const m = await message.channel.send(`<@${target[1]}> ${member.displayName} would like to give you ${amount} of their cookies, send a "y" to accept or a "n" to decline.`);
				const filter = mes => mes.author.id == parseFloat(target[1]);
				const targetCollector = new discord.MessageCollector(message.channel, filter, {time: 1*60*1000});
				targetCollector.on('collect', reply => {
					if (reply.content.charAt(0) == 'y') {
						targetCollector.stop("Transfer accepted");
						db.collection('cookies').findOne({"userID": target[1]})
						.then(dbTarget => {
							db.collection('cookies').updateOne({"userID": target[1]}, {$inc:{"cookies": amount}})
							.then(async () => {
								const progressMsg = await message.channel.send(`I have added the cookies to ${member.displayName}`);
								db.collection('cookies').updateOne({"userID": message.author.id}, {$inc:{"cookies": amount * -1}})
								.then(() => {
									progressMsg.edit("I have finished the transfer");
								});
							});
						});
					} else if (reply.content.charAt(0) == 'n') {
						targetCollector.stop("Transfer declined");
					} else {
						reply.reply('The first character in your message was not "n" or "y" please try again');
						targetCollector.resetTimer({time: 1*60*1000});
					}
				});
				targetCollector.on('end', (collected, reason) => {
					if (reason == "Transfer accepted")
						m.edit("Transfer was accepted");
					else if (reason == "Transfer declined")
						m.edit("Transfer was declined");
					else 
		        		m.edit("Time's up");
		    	});
			} else {
				message.reply(`either you do not have that many cookies, you have ${res.cookies} cookies or you are trying to transfer negative cookies`);
			}
		});
	} catch (err) {
		if (err == "target is null")
			message.reply("please ping a user as your target");
		if (err == "amount is null")
			message.reply("I was not able to find a number for the amount");
		if (err == "could not parse amount")
			message.reply("I could not parse the amount as an integer");
		console.error(err);
	}},
};