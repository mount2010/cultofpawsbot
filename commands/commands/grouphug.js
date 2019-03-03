const Command = require(`${process.cwd()}/commands/command.js`);
const embeds = require(`${process.cwd()}/util/embeds.js`);

module.exports.Command = class extends Command {
	constructor() {
		super({
			name: "grouphug"
		});
	}
	run(client, msg) {
		new embeds.Embed(
			"Grouphug!",
			`${msg.author.username} hugs everyone here!`
		)
			.scolor("#C0FFEE")
			.send(msg.channel);
	}
};
