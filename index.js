const Discord = require("discord.js");
const Logger = require("js-logger");
const secrets = require("./secrets.json");

Logger.useDefaults();

class COPBotClient extends Discord.Client {
	constructor (token) {
		super();
		this.messageListening = [];
		this.on("ready", ()=>{
			Logger.info(`Ready as ${this.user.username}!`);
		});
		this.on("message", (msg)=>{
			this.messageListening.forEach((el) => {el(msg);});
		});
		this.login(token);
	}
	listenForMessages (func) {
		this.messageListening.push(func);
	}
}

const client = new COPBotClient(secrets.token);
client.listenForMessages((msg) => {if (msg.content == "meow") msg.channel.send("yeah")});

module.exports = client;

