/**
 * Internal code for request command
 * @file
 */

const fetch = require("node-fetch");
const config = require(`${process.cwd()}/config/config.json`);
const secrets = require(`${process.cwd()}/config/secrets.json`);
const logger = require("js-logger");
const algro = require(`${process.cwd()}/util/algro.js`);
const db = require(`${process.cwd()}/db/db.js`);

class ItemNotFoundError extends Error {
	constructor() {
		super("Item not found.");
		this.name = "ItemNotFoundError";
	}
}

class RequestHandler {
	constructor() {
		// IF ratelimited, tell user to wait for 1 min for ratelimit to clear.
		this.ratelimited = false;
		// DRPG API not available (Response not OK = true)
		this.notAvailable = false;
		this.hasInit = false;
		this.drpgItems = {};
		/**
		 * Maps items (strings) to boolean indicating whether they can be borrowed. Untradable items are automatically disabled.
		 * @type Map<string, boolean>
		 */
		this.itemsAvailable = new Map();
		this.approximater = new algro.Approximater(this.itemsAvailable, 2);
	}
	async addItems() {
		this.itemsAvailable.clear();
		this.drpgItems.forEach(el => {
			const itemName = el.name.toLowerCase();
			let borrowable = true;

			if (!el.tradable) {
				borrowable = false;
			}

			this.itemsAvailable.set(itemName, borrowable);
		});
		await this.readDisabledItems();
	}
	// disable item and write to db
	async disableItem(item) {
		if (!this.itemsAvailable.has(item)) {
			logger.debug(
				`Refusing to disable item ${item} as it isn't in the API list.`
			);
			throw new ItemNotFoundError();
		}
		// if any of these throws, it will bubble up to the command to tell the user.
		this.setItemDisabled(item);
		const conn = await db.getPoolConnection();
		await conn.query("INSERT INTO disableditems VALUES (?)", [item]);
		return true;
	}
	// for init to disable from db
	setItemDisabled(item) {
		if (!this.itemsAvailable.has(item)) {
			logger.debug(
				`Ignoring disabled item ${item} - Item not found in API item list.`
			);
			throw new ItemNotFoundError();
		}
		this.itemsAvailable.set(item, false);
		logger.debug(`Disabled borrowing for ${item}`);
	}
	async readDisabledItems() {
		const conn = await db.getPoolConnection();
		try {
			const items = await conn.query("SELECT * FROM disableditems");
			items[0].forEach(el => {
				try {
					this.setItemDisabled(el.name);
				} catch (e) {
					// continues
				}
			});
		} catch (err) {
			logger.log(`Failed to read disabled items - ${err}`);
		}
		conn.release();
	}
	async init() {
		this.hasInit = true;
		async function requestAPI() {
			logger.debug("Fetching API");
			return await fetch(`${config.apiURL}/v3/all/items`, {
				headers: { authorization: secrets.drpgAPIToken }
			});
		}
		async function doRequest() {
			this.ratelimited = false;
			this.notAvailable = false;
			const res = await requestAPI();
			logger.debug(`API: ${res.status} (${res.statusText})`);
			const jsonRes = await res.json();
			this.drpgItems = jsonRes.data;
			return res;
		}
		const result = await doRequest.bind(this)();
		if (result.status === 429) {
			this.ratelimited = true;
			this.hasInit = false;
			return false;
		} else if (!result.ok) {
			this.notAvailable = true;
			this.hasInit = false;
			return false;
		}
		this.addItems();
		return true;
	}
	async addRequest(item, user, description) {
		const conn = await db.getPoolConnection();

		if (!item) {
			throw new Error("No item provided in request");
		}
		if (!user) {
			throw new Error("No user provided in request");
		}

		await conn.query(
			"INSERT INTO requests (item, userid, description) VALUES (?, ?, ?)",
			[item, user.id, description || "No description provided"]
		);
		conn.release();
		return true; // all ok
	}
	async removeRequest(id) {
		if (!id) {
			throw new Error("No id provided in request");
		}
		const conn = await db.getPoolConnection();

		const result = await conn.query("DELETE FROM requests WHERE id=?", [
			id
		]);
		conn.release();
		logger.log(result);
	}
	async viewRequests(page = 0) {
		const conn = await db.getPoolConnection();
		const requests = await conn.query(
			"SELECT * FROM requests WHERE id BETWEEN ? AND ?",
			[page * 100, page * 100 + 100]
		);
		conn.release();
		logger.log(requests);
		return requests;
	}
	enableItem() {}
	approximateItem(item) {
		return this.approximater.approximate(item);
	}
	getItemBorrowable(item) {
		if (this.itemsAvailable.has(item)) {
			return this.itemsAvailable.get(item);
		} else throw new ItemNotFoundError();
	}
}

const requestHandler = new RequestHandler();
module.exports = requestHandler;
