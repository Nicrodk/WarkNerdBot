module.exports = {
	name: 'cookiedaily',
	description: 'Grants daily cookie allowance to user',
	parameters: 'none',
	explanation: 'Command that grants you the daily amount of cookies',
	execute(message, text, db, twitchDb) {
		db.collection('cookies').findOne({"userID": message.author.id}).then(res => {
			const cookies = Math.floor(Math.random() * (25)) + 1;
			if (res == null) {
				const cookieEntry = {
					"userID": message.author.id,
					"guildID": message.guild.id,
					"cookies": cookies,
					"dailyReady": false
				};
				db.collection('cookies').insertOne(cookieEntry).then(() => {
					message.channel.send(`I have added you to the database and given you ${cookies} cookies`);
				});
			} else if (!res.dailyReady) {
				const curTime = new Date();
				let hours = (curTime.getHours() - 23) * -1;
				let mins = (curTime.getMinutes() - 60) * -1;
				if (mins == 60) {
					hours++;
					mins = 0;
				}
				message.reply(`You have already received your daily cookies\nThe next set of cookies are ready in ${hours} hours and ${mins} minutes`);
				return;
			} else if (res.dailyReady) {
				res.cookies += cookies;
				res.dailyReady = false;
				db.collection('cookies').replaceOne({"_id": res._id}, res).then(() => {
					message.reply(`You have been given ${cookies} cookies`);
				});
			}
		});
	},
};