import type { RandomStringProvider } from "@/lib/RandomStringProvider";

export class RandomStringProviderImpl implements RandomStringProvider {
	randomString(length: number): string {
		const firstAlphabet = "CFGHJKLMNPRTVWXYZ";
		const alphabet = "1234567890CFGHJKLMNPRTVWXYZ";
		let result = firstAlphabet[Math.floor(Math.random() * firstAlphabet.length)];
		for (let i = 1; i < len; i++) {
			result += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return result;
	}
}
