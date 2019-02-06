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
		this.on("message", msg => {
			this.messageListening.forEach(el => {
				el(msg);
			});
		});
	}
	login(token) {
		super.login(token);
	}
	listenForMessages(func) {
		this.messageListening.push(func);
	}
}

const client = new COPBotClient();
client.login(secrets.token);
client.listenForMessages(msg => {
	if (msg.content == "meow") msg.channel.send("yeah");
});

module.exports = client;
