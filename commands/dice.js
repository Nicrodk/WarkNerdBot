module.exports = {
	name: 'roll',
	description: 'Rolling dice with format "!nb roll <diceAmount>d<diceSize>+-<modifier>"',
	help: ' roll <diceAmount>[d|D]<diceSize>+-<modifier>, It does not care about spacing after "roll " diceamount left out will set it to 1, limits are set to 99 amount and 1000 size and amount <= 0 will be set to 1',
	execute(message, text) {

		let withMod = true;
		let parts = text.match(/(\d*)\s*[dD]\s*(\d+)\s*([+|-])\s*(\d+)/);

		if (parts == null) {
			parts = text.match(/(\d*)\s*[dD]\s*(\d+)/);
			parts.length = 3;
			withMod = false;
		}

		const diceAmount = parts[1];
		const diceSize	 = parts[2];

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

		if (parts[3] == "+")
			total += parseInt(parts[4]);
		else if (parts[3] == "-")
			total -= parseInt(parts[4]);

		if (withMod)
			message.channel.send(`${diceArr.join(" ")} ${parts[3]} ${parts[4]} = ${total}`);
		else
			message.channel.send(`${diceArr.join(" ")} = ${total}`);
	}
};

function RollDice(size) {
	return Math.floor(Math.random() * (size)) + 1;
}