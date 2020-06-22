module.exports = {
	name: 'roll',
	description: 'Rolling dice with format "!nb roll <diceAmount>d<diceSize>+-<modifier>"',
	execute(message, text, args) {

		let parts = text.match(/(\d+)\s*d\s*(\d+)\s*([+|-])\s*(\d+)/);

		const diceAmount = parts[1];
		const diceSize	 = parts[2];

		let diceArr = [];

		let total = 0;

		for (let i = 0; i < diceAmount; i++) {
			diceArr.push(RollDice(diceSize));
			total += diceArr[i];
		}

		if (parts[3] == "+")
			total += parseInt(parts[4]);
		else if (parts[3] == "-")
			total -= parseInt(parts[4]);

		message.channel.send(`${diceArr} ${parts[3]} ${parts[4]} = ${total}`);
	}
};

function RollDice(size) {

	return Math.floor(Math.random() * (size)) + 1;
	

	/*let result = 0;
	let diceAmount
	let size;

	const die = roll.indexOf('d');

	if (die == -1) {
		try {
			return parseInt(roll);
		} catch (e) {
			if (roll.charAt(0) == '+')
				return parseInt(roll.substring(2));
			else
				return parseInt(roll.substring(2)) * -1;
		}
	}

	if (isDigit(roll.substring(die - 2, die).charAt(0))) {
		diceAmount = parseInt(roll.substring(die - 2, die));
	} else if (isDigit(roll.substring(die - 1, die).charAt(0))) {
		diceAmount = parseInt(roll.substring(die - 1, die));
	} else {
		diceAmount = 1;
	}

	if (roll.substring(die + 1).length >= 3 && isDigit(roll.substring(die + 1).charAt(2))) {
		size = parseInt(roll.substring(die + 1, die + 4));
	} else if (roll.substring(die + 1).length == 2 && isDigit(roll.substring(die + 1).charAt(1))) {
		size = parseInt(roll.substring(die + 1, die + 3));
	} else {
		size = parseInt(roll.substring(die + 1, die + 2));
	}

	for (let j = 0; j < diceAmount; j++) {
		result += 
	}

	if (roll.startsWith("-")) {
		result = -result;
	}

	return result;*/
}

/*function isDigit (char) {
	if (char >= '0' && char <= '9')
		return true;
	else
		return false;
}*/