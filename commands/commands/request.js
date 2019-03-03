const Command = require(`${process.cwd()}/commands/command.js`);
const embed = require(`${process.cwd()}/util/embeds.js`);
const requestHandler = require(`${process.cwd()}/handler/requestHandler.js`);
const config = require(`${process.cwd()}/config/config.json`);

module.exports.Command = class RequestCommand extends Command {
	constructor() {
		super({
			name: "request",
			specificMessages: ["[R]"]
		});
	}
	async doInit(msg) {
		const waitMsg = await new embed.Embed(
			"Requesting API...",
			"Please hold on..."
		)
			.semoji(":clock630:")
			.scolor("#FFFF00")
			.setFooter("This will only happen once per bot start.")
			.send(msg.channel);
		const success = await requestHandler.init();
		await waitMsg.delete();
		if (!success) {
			if (requestHandler.notAvailable) {
				new embed.FailureEmbed(
					"DiscordRPG API not available",
					"The DRPG API is down. Please check the DRPG official server for more information. Try again later."
				).send(msg.channel);
				return false;
			}
			if (requestHandler.ratelimited) {
				new embed.FailureEmbed(
					"DiscordRPG API ratelimited",
					"I'm ratelimited by the DiscordRPG API. Please wait a minute and try again."
				).send(msg.channel);
				return false;
			}
		}
		return true;
	}
	async run(client, msg, args) {
		const item = args.join(" ");
		if (item === "") {
			new embed.FailureEmbed(
				"No item specified.",
				`(Help for this command: ${this.meta.helplong})`
			).send(msg.channel);
			return;
		}
		if (!requestHandler.hasInit) {
			const initSuccess = await this.doInit(msg);
			if (!initSuccess) return;
		}
		try {
			const itemBorrowable = requestHandler.getItemBorrowable(item);
			if (itemBorrowable) {
				try {
					const result = requestHandler.addRequest(item, msg.author);
					if (result) {
						new embed.SuccessEmbed(
							"Success",
							`Added request for ${item}.`
						).send(msg.channel);
					}
				} catch (err) {
					new embed.FailureEmbed(
						"An error occured!",
						`Please report this: ${err.msg}`
					).send(msg.channel);
				}
			} else {
				new embed.FailureEmbed(
					"Item not borrowable",
					"Item can't be borrowed. It is either untradable or disabled from borrowing."
				).send(msg.channel);
			}
		} catch (err) {
			if (err.name === "ItemNotFoundError") {
				// try approximating
				const approximated = requestHandler.approximateItem(item);
				if (!approximated) {
					new embed.FailureEmbed(
						"Item not found.",
						`This item does not exist. If it should exist, ask a ${
							config.adminName
						} to run \`${config.prefix}requestadmin refresh\`.`
					).send(msg.channel);
				} else {
					new embed.FailureEmbed(
						"Item not found.",
						`Did you mean \`${approximated}\`?`
					).send(msg.channel);
				}
			}
		}
	}
};
