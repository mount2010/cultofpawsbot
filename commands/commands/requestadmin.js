const Command = require(`${process.cwd()}/commands/command.js`);
const embed = require(`${process.cwd()}/util/embeds.js`);
const requestCmd = require(`${process.cwd()}/commands/commands/request.js`);
const requestHandler = require(`${process.cwd()}/handler/requestHandler.js`);

module.exports.Command = class extends Command {
	constructor() {
		super({
			name: "requestadmin",
			aliases: ["rqa"]
		});
	}
	async run(client, msg, args) {
		// split 0 as it is a subcommand
		const item = args.slice(1).join(" ");
		switch (args[0]) {
			case "refresh": {
				const result = await new requestCmd.Command().doInit(msg);
				if (result) {
					new embed.SuccessEmbed(
						"Success",
						"Item list refreshed."
					).send(msg.channel);
				}
				break;
			}
			case "disable": {
				try {
					if (!item.match(/\w/)) {
						new embed.FailureEmbed(
							"No item specified!",
							"Please specify an item to disable."
						).send(msg.channel);
						return;
					}
					const result = await requestHandler.disableItem(item);
					if (result) {
						new embed.SuccessEmbed(
							"Success",
							`Disabled item ${item}`
						).send(msg.channel);
					}
				} catch (err) {
					new embed.FailureEmbed(
						"Error!",
						`An error occured.\n\`\`\`${err}\`\`\``
					).send(msg.channel);
				}
				break;
			}
			default: {
				new embed.Embed(
					"Request Administration tools",
					"This is a temporary message."
				).send(msg.channel);
			}
		}
	}
};
