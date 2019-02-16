const Command = require(`${process.cwd()}/commands/command.js`);

module.exports.Command = class extends Command {
	constructor() {
		super({
			name: "cookie"
		});
	}
	run(client, msg) {
		if (msg.author.id === "209293630370873344") {
			msg.channel.send(["youll get diabetes :cookie:", "h :cookie:", "meh fishcat :cookie:"][(Math.floor(Math.random() * 3))]);
			return;
		}
		msg.channel.send("ok here u go :cookie:");
	}
};
