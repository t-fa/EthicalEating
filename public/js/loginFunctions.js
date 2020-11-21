function onlyAlphanumerical(str) {
	return str.match('^[A-Za-z0-9]+$');
}

function verifyPasswordCharacters(password) {
	let letter = false,
		number = false;
	for (let i = 0; i < password.length; i++) {
		let str = password[i];
		if (str.match('^[A-Za-z]+$')) {
			letter = true;
		} else if (str.match('^[0-9]+$')) {
			number = true;
		}
	}
	return letter && number;
}

function verifyPasswordLength(password, length) {
	return password.length >= length;
}

module.exports = { onlyAlphanumerical, verifyPasswordCharacters, verifyPasswordLength };
