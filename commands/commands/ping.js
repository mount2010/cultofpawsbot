const Command = require(`${process.cwd()}/commands/command.js`);

module.exports.Command = class extends Command {
	constructor() {
		super({
			name: "ping"
		});
	}
	run(client, msg) {
		msg.channel.send(`Pong. ${client.ping}ms to Discord.`);
	}
};
