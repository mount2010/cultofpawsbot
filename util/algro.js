const levenshtein = require("js-levenshtein");
const logger = require("js-logger");

class ApproximateNameCache {
	/**
	 * Caches approximate (levenshtein) names and maps them to their names.
	 * @class
	 */
	constructor() {
		this.cache = new Map();
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
	 * @param {Map} store Map of names to approximate with (will check against the names in this variable)
	 * @class
	 */
	constructor(store, distance = 1) {
		this.store = store;
		this.cache = new ApproximateNameCache();
		this.distance = distance;
	}
	/**
	 * Find closest command name to string
	 * @param {string} str String to find an approxiamte of
	 * @returns {string}
	 */
	approximate(str) {
		// temporary solution
		if (this.store.has(str)) {
			return str;
		}
		// does the cache have it
		else if (this.cache.has(str)) {
			logger.debug(`cache of ${str} is ${this.cache.retrieve(str)}`);
			return this.cache.retrieve(str);
		}
		// no, approximate
		const keyIterator = this.store.keys();
		let result = keyIterator.next();
		while (!result.done) {
			const el = result.value;
			const distance = levenshtein(el, str);
			if (distance <= this.distance) {
				// found a match, add to cache!
				this.cache.add(str, el);
				return el;
			}
			result = keyIterator.next();
		}
		// no match  record that
		this.cache.add(str, null);
		return undefined;
	}
}

module.exports = { Approximater };
