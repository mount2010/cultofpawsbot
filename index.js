const Discord = require("discord.js");
const Logger = require("js-logger");

const config = require("./config.json");
const secrets = require("./secrets.json");
const handler = require("./handler.js");

Logger.useDefaults();
process.env.debug
	? Logger.setLevel(Logger.DEBUG)
	: Logger.setLevel(Logger.INFO);

class COPBotClient extends Discord.Client {
	constructor() {
		super({});
		this.messageListening = [];
		this.handler = new handler.Handler(this);
	}
	setupEvents() {
		this.on("ready", () => {
			Logger.info(`Ready as ${this.user.username}!`);
			this.setStatus();
		});
		this.on("message", msg => {
			this.handler.handleMessage(msg);
		});
	}
	setStatus() {
		this.user.setActivity(
			config.status.replace("{{prefix}}", config.prefix)
		);
	}
	init(token) {
		this.setupEvents();
		this.login(token);
		this.loadCommands();
	}
	loadCommands() {
		this.handler.loadCommandsIn(config.commandDirectory);
	}
}

const client = new COPBotClient();
client.init(secrets.token);

module.exports = client;
