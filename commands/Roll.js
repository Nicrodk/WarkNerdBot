module.exports = {
	name: 'roll',
	description: 'Rolling dice with format "!nb roll <diceAmount>d<diceSize>+-<modifier>"',
	parameters: '<diceAmount>d<diceSize><+-><modifier>',
	explanation: 'Roll some dice\ndiceAmount is limited to 99 and diceSize is limited to 1000\nleaving out diceAmount or putting it negative will have it set to 1 and then rolling\n+-<modifier> is optional and command does not care about spacing after "roll "',
	execute(message, text, db, twitchDb) {

		let withMod = true;
		let parts = text.match(/(\d*)\s*[dD]\s*(\d+)\s*([+-])\s*(\d+)/);

		if (parts == null) {
			parts = text.match(/(\d*)\s*[dD]\s*(\d+)/);
			withMod = false;
		}

		let diceAmount 	= parts[1];
		let diceSize	= parts[2];

		if (diceAmount == null || diceAmount <= 0) 
			diceAmount = 1;

		if (diceAmount > 99 && diceSize > 1000) {
			message.reply("Both Amount and Size are above their limits, setting amount to 99 and size to 1000 and rolling");
			diceAmount = 99;
			diceSize = 1000;

		} else {
			if (diceAmount > 99) {
				message.reply("Amount is over 99, setting it to 99 and rolling");
				diceAmount = 99;
			}

			if (diceSize > 1000) {
				message.reply("Size is over 1000, setting it to 1000 and rolling");
				diceSize = 1000;
			}
		}

		let diceArr = [];
		let total = 0;

		for (let i = 0; i < diceAmount; i++) {
			diceArr.push(RollDice(diceSize));
			total += diceArr[i];
		}

		diceArr.forEach((element, index) => {
			diceArr[index] = "[" + element + "]";
		});

		if (withMod) {
			if (parts[3] == "+")
				total += parseInt(parts[4]);
			else if (parts[3] == "-")
				total -= parseInt(parts[4]);

			message.channel.send(`${diceArr.join(" ")} ${parts[3]} ${parts[4]} = ${total}`);
		} else {
			message.channel.send(`${diceArr.join(" ")} = ${total}`);
		}
	}
};

function RollDice(size) {
	return Math.floor(Math.random() * (size)) + 1;
}