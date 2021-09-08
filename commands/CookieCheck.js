module.exports = {
	name: 'cookiecheck',
	description: 'Lets a user check their cookieamount',
	parameters: 'none',
	explanation: 'Command that lets you check your current amount of cookies',
	execute(message, text, db, twitchDb) {
		db.collection('cookies').findOne({"userID": message.author.id})
		.then(res => {
			if (res == null)
				throw "not found";
			message.reply(`you have ${res.cookies} cookies`);
		}).catch(err => {
			if (err == "not found")
				message.reply("I could not find you in the database");
			console.error(err);
		});
	},
};