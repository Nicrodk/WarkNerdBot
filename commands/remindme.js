module.exports = {
	name: 'remindme',
	description: 'Create a reminder',
	help: ' remindme Xidentifier Xidentifier Xidentifier text, creates a countdown for pinging the person with text maximum allowed days is 60, hours is 144 and minutes is 1800 (the limits are individual so you can do 1800minutes 144hours 60days) The the identifiers can be just [m|M], [h|H] or [d|D] but still works with full word, default behaviour for no identifier is Xminutes Xhours Xdays, can do only 1 or 2 numbers+identifier if only want to specify reminder in m/h/d or mh/md/hd',
	execute(message, text) {
		text = text.toLowerCase();
		let times = text.match(/(\d+)(\w*)\s*(\d+)?(\w*)\s*(\d+)?(\w*)/);
		let textArr = text.split(' ');
		let date = new Date();

		const local = {
			AddM: (date, amount) => {
				if (amount > 1800)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 60000);
				return date;
			},

			AddH: (date, amount) => {
				if (amount > 144)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 3600000);
				return date;
			},

			AddD: (date, amount) => {
				if (amount > 60)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 864e5);
				return date;
			}
		};

		if (times[2] == null)
			date = AddM(date, times[1]);
		else
			date = local["Add"+times[2].toUpperCase()](date, times[1]);

		if (times[4] == null && times[3] != null)
			date = AddH(date, times[3]);
		else if (times[3] != null)
			date = local["Add"+times[4].toUpperCase()](date, times[3]);

		if (times[6] == null && times[5] != null)
			date = AddD(date, times[5]);
		else if (times[5] != null)
			date = local["Add"+times[6].toUpperCase()](date, times[5]);

		if (times[3] == null && times[5] == null) {
			textArr.splice(0, 2);
		} else if (times[5] == null) {
			textArr.splice(0, 3);
		} else {
			textArr.splice(0, 4);
		}

		let reminder = {
			channelID:	message.channel.id,
			userID: 	message.author.id,
			text: 		textArr.join(' '),
			time: 		0
		};

		reminder.time = date.getTime();
		const dateString = date.toString().split(' ');
		message.reply(`I have noted that you want to be reminded on the 
					${dateString[2]} of ${dateString[1]} ${dateString[3]} at 
					${dateString[4]} ${dateString[5]}`);
		return reminder;
	},
};