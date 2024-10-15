/**
 * Generates a random string of the specified length.
 *
 * @param length - The length of the random string to generate.
 * @returns A random string consisting of uppercase letters, lowercase letters, and digits.
 */
export function random(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

/**
 * Generates a random OTP (One-Time Password) of the specified length.
 *
 * @param length - The length of the OTP to be generated.
 * @returns A string representing the generated OTP consisting of numeric characters.
 */
export function randomOTP(length: number) {
	let result = '';
	const characters = '0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}
