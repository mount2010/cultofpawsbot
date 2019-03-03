const Command = require(`${process.cwd()}/commands/command.js`);
const embeds = require(`${process.cwd()}/util/embeds.js`);

module.exports.Command = class extends Command {
	constructor() {
		super({
			name: "help",
			aliases: ["h"],
			help: "List commands"
		});
	}
	listCommands(msg, cmds) {
		const embed = new embeds.Embed("List of commands").scolor("#C0FFEE");
		function makeField(cmd) {
			return [
				`${cmd.name}`,
				`${
					cmd.aliases
						? "**(aliases: " + cmd.aliases.join(",") + ")**"
						: ""
				} - ${cmd.help}`
			];
		}

		cmds.forEach(el => {
			embed.addField(...makeField(el));
		});
		embed.send(msg.channel);
	}
	/*	specificCommand (msg, cmd) {
		const embed = 
	}*/
	run(client, msg) {
		const cmds = client.handler.cmdStore;
		const metas = cmds.getMetas();

		this.listCommands(msg, metas);
	}
};
