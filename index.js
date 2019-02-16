/**
 * Entrypoint for the bot.
 *
 * @module
 * @file
 * @author Mount2010
 */

const Discord = require("discord.js");
const Logger = require("js-logger");

const config = require(`${process.cwd()}/config/config.json`);
const secrets = require(`${process.cwd()}/config/secrets.json`);
const handler = require(`${process.cwd()}/handler/handler.js`);

Logger.useDefaults();
process.env.debug
	? Logger.setLevel(Logger.DEBUG)
	: Logger.setLevel(Logger.INFO);

class COPBotClient extends Discord.Client {
	/**
	 * Custom Discord bot client.
	 */
	constructor() {
		super({});
		this.messageListening = [];
		this.handler = new handler.Handler(this);
	}
	/**
	 * Sets up events for the bot
	 *
	 * @returns {undefined}
	 */
	setupEvents() {
		this.on("ready", () => {
			Logger.info(`Ready as ${this.user.username}!`);
			this.setStatus();
		});
		this.on("message", msg => {
			this.handler.handleMessage(msg);
		});
	}
	/**
	 * Sets up the bot's status
	 *
	 * @returns {undefined}
	 */
	setStatus() {
		this.user.setActivity(
			config.status.replace("{{prefix}}", config.prefix)
		);
	}
	/**
	 * Starts the bot.
	 *
	 * @returns {undefined}
	 */
	init(token) {
		this.setupEvents();
		this.login(token);
		this.loadCommands();
	}
	/**
	 * Loads commands using the handler
	 *
	 * @returns {undefined}
	 */
	loadCommands() {
		this.handler.loadCommandsIn(config.commandDirectory);
	}
}

const client = new COPBotClient();
client.init(secrets.token);

module.exports = client;
