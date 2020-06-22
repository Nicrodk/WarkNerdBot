module.exports = {
	name: 'remindme',
	description: 'Create a reminder',
	help: ' remindme Xminutes Xhours Xdays text, creates a countdown for pinging ther person with text',
	execute(message, text) {
		const times = text.split(' ', 4);
		let textArr = text.split(' ');
		textArr.splice(0, 4);

		let reminder = {
			channelID:	message.channel.id,
			userID: 	message.author.id,
			text: 		textArr.join(' '),
			time: 		0
		};

		if (times[1].includes("minute")
			&& times[2].includes("hour")
			&& times[3].includes("day")) {

			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			let date = new Date();
			date = AddDays(date, times[3]);
			date = AddHours(date, times[2]);
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			const dateString = date.toString().split(' ');
			message.reply(`I have noted that you want to be reminded on the ${dateString[2]} of ${dateString[1]} at ${dateString[4]}`);
			return reminder;

		} else if (times[1].includes("minute")
				   && times[2].includes("hour")) {

			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			let date = new Date();
			date = AddHours(date, times[2]);
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			message.reply(`I have noted that you want to be reminded on the ${dateString[2]} of ${dateString[1]} at ${dateString[4]}`);
			return reminder;

		} else if (times[1]. includes("minute")) {

			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			let date = new Date();
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			message.reply(`I have noted that you want to be reminded on the ${dateString[2]} of ${dateString[1]} at ${dateString[4]}`);
			return reminder;
		}
	},
};

const AddMinutes = (date, amount) => {
	date.setTime(date.getTime() + amount * 60000);
	return date;
}

const AddHours = (date, amount) => {
	date.setTime(date.getTime() + amount * 3600000);
	return date;
}

const AddDays = (date, amount) => {
	date.setTime(date.getTime() + amount * 864e5);
	return date;
}