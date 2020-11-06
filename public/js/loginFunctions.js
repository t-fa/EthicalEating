function onlyAlphanumerical(str) {
	return str.match('^[A-Za-z0-9]+$');
}

function validatePassword(password) {
	let letter = false;
	let number = false;
	for (let i = 0; i < password.length; i++) {
		let str = password[i];
		if (str.match('^[A-Za-z]+$')) {
			letter = true;
		} else if (str.match('^[0-9]+$')) {
			number = true;
		}
	}
	if (letter && number && password.length > 7) {
		return true;
	} else {
		return false;
	}
}

module.exports = { onlyAlphanumerical, validatePassword };
