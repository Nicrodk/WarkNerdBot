module.exports = {
	name: 'cookieroulette',
	description: 'Feed the cookie eating machine, 50% loss, 30% 1.5x return, 19% 2x return, 1% 10x return',
	parameters: 'cookieAmount',
	explanation: 'Command that lets you gamble your cookies, results can be, loss, 1.5x return, 2x return or 3x return',
	execute(message, text, db, twitchDb) {
		db.collection('cookies').findOne({"userID": message.author.id}).then(res => {
			try {
				let cookieAmount = parseInt(text);
				if (isNaN(cookieAmount))
					throw("Argument could not be converted to a whole number");
				if (cookieAmount <= 0)
					throw("why");
				if (cookieAmount > res.cookies)
					throw("Not enough cookies");

				const rand = Math.random();
				if (rand < 0.5) {
					db.collection('cookies').updateOne({"userID": message.author.id}, {$inc:{"cookies": cookieAmount * -1}}).then(() => {
						message.reply(`you lost your ${cookieAmount} cookies and now have ${res.cookies - cookieAmount} cookies left`);
					});
				} else if (rand < 0.8) {
					db.collection('cookies').updateOne({"userID": message.author.id}, {$inc:{"cookies": cookieAmount * 0.5}}).then(() => {
						message.reply(`congratulations you won 0.5 times the gambled cookies and now have ${res.cookies + (cookieAmount*0.5)}`);
					});
				} else if (rand < 0.99) {
					db.collection('cookies').updateOne({"userID": message.author.id}, {$inc:{"cookies": cookieAmount * 1}}).then(() => {
						message.reply(`congratulations you won 1 times the gambled cookies and now have ${res.cookies + (cookieAmount*1)}`);
					});
				} else if (rand < 1.00) {
					db.collection('cookies').updateOne({"userID": message.author.id}, {$inc:{"cookies": cookieAmount * 9}}).then(() => {
						message.reply(`congratulations you won 9 times the gambled cookies and now have ${res.cookies + (cookieAmount*9)}`);
					});
				} else {
					message.reply("something went wrong and it was not decided if you won or not (your cookies are safe)");
				}
			} catch (err) {
				if (err == "Argument could not be converted to a whole number") {
					message.reply("I could not read the argument as a whole number please try again");
				} else if (err == "Not enough cookies") {
					message.reply("you do not have that many cookies");
				} else if (err == "why") {
					message.reply("Why are you trying to gamble 0 or less cookies?");
				} else {
					message.reply("there was an error while trying to handle your cookies");
					console.log(err);
				}
			}
		});
	},
};