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

const reactNames = [
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
		];

/*var arr = [1,2,3];
var max = arr.reduce(function(a, b) {
    return Math.max(a, b);
});*/

module.exports = {
	name: 'poll',
	description: 'Command to create a poll of the given parameters',
	parameters: 'Question;option1;option2;option3;...;option10',
	explanation: 'Create a poll with upwards of 10 different entries which will have reactions put on the message allowing people to vote',
	execute(message, text, db) {
		const parts = text.split(';');
		let reply = `<@${message.author.id}> asks: ` + parts[0] + "\n";
		parts.splice(0, 1);

		for (let i = 0; i < parts.length; i++) {
			reply += reactNames[i] + parts[(i)] + "\n";
		}

		message.channel.send(reply)
		.then(m => {
			for (let i = 0; i < parts.length; i++) {
				m.react(reactArr[i]);
			}
		});
	},
};