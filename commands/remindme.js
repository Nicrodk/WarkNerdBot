module.exports = {
	name: 'remindme',
	description: 'Create a reminder',
	parameters: 'Xidentifier Xidentifier Xidentifier text',
	explanation: 'Creates a countdown for pinging the person with "text"\nmaximum allowed days is 60, hours is 144, minutes is 1800 and seconds is 60000 (the limits are individual so you can do 1800minutes 144hours 60days)\nThe the identifiers can be just [s|S], [m|M], [h|H] or [d|D] but still works with full word, default behaviour for no identifier is Xminutes Xhours Xdays, you can do just 1 or 2 numbers+identifier if you only want to specify reminder in s/m/h/d or sm/sh/sd/mh/md/hd',
	//help: ' remindme Xidentifier Xidentifier Xidentifier text, creates a countdown for pinging the person with "text" maximum allowed days is 60, hours is 144, minutes is 1800 and seconds is 60000 (the limits are individual so you can do 1800minutes 144hours 60days) The the identifiers can be just [s|S], [m|M], [h|H] or [d|D] but still works with full word, default behaviour for no identifier is Xminutes Xhours Xdays, can do only 1 or 2 numbers+identifier if only want to specify reminder in s/m/h/d or sm/sh/sd/mh/md/hd',
	execute(message, text) {
		let times = text.match(/(\d+)(\w*)\s*(?:(\d+)(\w*)\s*)?(?:(\d+)(\w*))?/);
		let textArr = text.split(' ');
		let date = new Date();

		const local = {
			AddS: (date, amount) => {
				if (amount > 60000)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 1000);
				return date;
			},

			AddM: (date, amount) => {
				if (amount > 1800)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 60000);
				return date;
			},

			AddH: (date, amount) => {
				if (amount > 144)
					throw "Part of given time was above limit";
				date.setTime(date.getTime() + amount * 36e5);
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
			date = local["AddM"](date, times[1]);
		else
			date = local["Add"+times[2].toUpperCase().charAt(0)](date, times[1]);

		if (times[4] == null && times[3] != null)
			date = local["AddH"](date, times[3]);
		else if (times[3] != null)
			date = local["Add"+times[4].toUpperCase().charAt(0)](date, times[3]);

		if (times[6] == null && times[5] != null)
			date = local["AddD"](date, times[5]);
		else if (times[5] != null)
			date = local["Add"+times[6].toUpperCase().charAt(0)](date, times[5]);

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