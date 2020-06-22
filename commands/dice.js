module.exports = {
	name: 'roll',
	description: 'Rolling dice with format "!nb roll <diceAmount>d<diceSize>+-<modifier>"',
	help: ' roll <diceAmount>d<diceSize>+-<modifier>, It does not care about spacing after "roll "',
	execute(message, text) {

		let withMod = true;
		let parts = text.match(/(\d+)\s*d\s*(\d+)\s*([+|-])\s*(\d+)/);

		if (parts == null) {
			parts = text.match(/(\d+)\s*d\s*(\d+)/);
			parts.length = 3;
			withMod = false;
		}

		const diceAmount = parts[1];
		const diceSize	 = parts[2];

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