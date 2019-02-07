const Discord = require("discord.js");
const Logger = require("js-logger");
const secrets = require("./secrets.json");

Logger.useDefaults();

class COPBotClient extends Discord.Client {
	constructor() {
		super();
		this.messageListening = [];
		this.setupEvents();
	}
	setupEvents() {
		this.on("ready", () => {
			Logger.info(`Ready as ${this.user.username}!`);
		});
	}
	login(token) {
		super.login(token);
	}
}

const client = new COPBotClient();
client.login(secrets.token);

module.exports = client;
