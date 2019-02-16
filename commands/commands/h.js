const Command = require(`${process.cwd()}/commands/command.js`);

module.exports.Command = class extends Command {
	constructor () {
		super({
			name: "help",
			aliases: ["h"]
		});
	}
};
