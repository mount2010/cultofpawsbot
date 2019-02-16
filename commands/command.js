const embeds = require(`${process.cwd()}/util/embeds.js`);

class Command {
	constructor(meta) {
		this.meta = meta;
	}
	// eslint-disable-next-line no-unused-vars
	run(client, msg, args) {
		msg.channel.send(
			new embeds.FailureEmbed(
				"Oops! This command has no functionality. Report this!"
			)
		);
	}
}

module.exports = Command;
