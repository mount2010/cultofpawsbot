const levenshtein = require("js-levenshtein");
const logger = require("js-logger");
const config = require(`${process.cwd()}/config/config.json`);

class ApproximateNameCache {
	/**
	 * Caches approximate (levenshtein) names and maps then to commands.
	 * @param {cmdStore} cmdStore Command store to operate upon
	 * @class
	 */
	constructor(cmdStore) {
		this.cache = new Map();
		this.cmdStore = cmdStore;
	}
	/**
	 * Adds an cache entry
	 * @param {string} name Name to cache
	 * @param {string} command Command this name approximates to
	 */
	add(name, command) {
		if (typeof name !== "string") {
			throw new Error("name for command cache must be string");
		}
		if (!this.cmdStore.has(command)) {
			logger.debug(
				`Refusing to map ${name} to ${command}: command does not exist`
			);
			return;
		}
		this.cache.set(name, command);
	}
	/**
	 * Return true if cache has string
	 * @param {string} str
	 * @returns {boolean}
	 */
	has(str) {
		return this.cache.has(str);
	}
	/**
	 * Returns cached match of str
	 * @param {string} str
	 * @returns {string}
	 */
	retrieve(str) {
		return this.cache.get(str);
	}
}

class Approximater {
	/**
	 * Utility class for string approximation
	 * @class
	 * @param {commandStore} cmdStore Command store to operate upon
	 */
	constructor(cmdStore) {
		this.cmdStore = cmdStore;
		this.cache = new ApproximateNameCache(this.cmdStore);
	}
	/**
	 * Find closest command name to string
	 * @param {string} str String to find an approxiamte of
	 * @returns {string}
	 */
	approximate(str) {
		// temporary solution
		if (this.cmdStore.has(str)) {
			return str;
		}
		// does the cache have it
		else if (this.cache.has(str)) {
			logger.debug(`cache of ${str} is ${this.cache.retrieve(str)}`);
			return this.cache.retrieve(str);
		}
		// no, approximate
		const keyIterator = this.cmdStore.commandNames.keys();
		let result = keyIterator.next();
		while (!result.done) {
			const el = result.value;
			const distance = levenshtein(el, str);
			if (distance <= config.approximateAllowedDistance) {
				// found a match, add to cache!
				this.cache.add(str, el);
				return el;
			}
			result = keyIterator.next();
		}
		return undefined;
	}
}

module.exports = { Approximater };
