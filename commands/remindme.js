module.exports = {
	name: 'remindme',
	description: 'Create a reminder',
	help: ' remindme Xm(inute(s)) Xh(our(s)) Xd(ay(s)) text, creates a countdown for pinging ther person with text maximum allowed days is 60, hours is 144 and minutes is 1800 (the limits are individual so you can do 1800minutes 144hours 60days)',
	execute(message, text) {
		let times = text.match(/(\d)\w*\s*(\d)\w*\s*(\d)\w*/);
		let textArr = text.split(' ');
		textArr.splice(0, 4);
		let mhd = true;
		let mh, m = false;

		if (times == null) {
			mhd = false;
			mh = true;
			times = text.match(/(\d)\w*\s*(\d)\w*/);
			textArr = text.split(' ');
			textArr.splice(0, 3);

			if (times == null) {
				mh = false;
				m = true;
				times = text.match(/(\d)\w*/);
				textArr = text.split(' ');
				textArr.splice(0, 2);
			}
		}

		let reminder = {
			channelID:	message.channel.id,
			userID: 	message.author.id,
			text: 		textArr.join(' '),
			time: 		0
		};

		if (mhd) {
			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			if (times[3] > 60 || times[2] > 144 || times[1] > 1800) {
				return;
			}
			let date = new Date();
			date = AddDays(date, times[3]);
			date = AddHours(date, times[2]);
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			const dateString = date.toString().split(' ');
			message.reply(`I have noted that you want to be reminded on the 
						${dateString[2]} of ${dateString[1]} ${dateString[3]} at 
						${dateString[4]} ${dateString[5]}`);
			return reminder;

		} else if (mh) {
			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			if (times[2] > 144 || times[1] > 1800) {
				return;
			}
			let date = new Date();
			date = AddHours(date, times[2]);
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			const dateString = date.toString().split(' ');
			message.reply(`I have noted that you want to be reminded on the 
						${dateString[2]} of ${dateString[1]} ${dateString[3]} at 
						${dateString[4]} ${dateString[5]}`);
			return reminder;

		} else if (m) {
			times.forEach((element, index) => {
				times[index] = element.match(/\d+/);
			});
			if (times[1] > 1800) {
				return;
			}
			let date = new Date();
			date = AddMinutes(date, times[1]);
			
			reminder.time = date.getTime();
			const dateString = date.toString().split(' ');
			message.reply(`I have noted that you want to be reminded on the 
						${dateString[2]} of ${dateString[1]} ${dateString[3]} at 
						${dateString[4]} ${dateString[5]}`);
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