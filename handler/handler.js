/**
 * @file Handles new messages and runs their respective commands.
 * @author Mount2010
 */

const fs = require("fs");
const logger = require("js-logger");
const path = require("path");
const algro = require(`${process.cwd()}/util/algro.js`);
const embeds = require(`${process.cwd()}/util/embeds.js`);
const config = require(`${process.cwd()}/config/config.json`);

/**
 * Stores and manages commands
 *
 */
class CommandStorage {
	constructor() {
		// map names to commands - alias to commands key
		this.commandNames = new Map();
		this.commands = new Map();
		this.specificMessages = new Map();
	}
	/**
	 * Add command to storage
	 */
	add(contents) {
		const cmd = new contents.Command();
		const meta = cmd.meta;
		const name = meta.name;
		const aliases = meta.aliases || [];
		const specificMessages = meta.specificMessages || undefined;

		this.commandNames.set(name, name);
		aliases.forEach(el => {
			logger.debug(`Added alias ${el}`);
			this.commandNames.set(el, name);
		});
		if (specificMessages) {
			specificMessages.forEach(el => {
				logger.debug(`Added specific message ${el}`);
				this.commandNames.set(el, name);
				this.specificMessages.set(el, name);
			});
		}

		this.commands.set(name, contents);
		logger.debug(`Loaded command ${name}`);
	}
	/**
	 * Retrieve command from storage
	 */
	retrieveCommand(name) {
		if (this.commands.has(name)) {
			return this.commands.get(name);
		} else if (this.commandNames.has(name)) {
			return this.commands.get(this.commandNames.get(name));
		} else {
			return undefined;
		}
	}
	/**
	 * Check if a command is in the storage
	 */
	has(name) {
		return this.commands.has(name) || this.commandNames.has(name);
	}
	getMetas() {
		const ret = [];
		this.commands.forEach(el => {
			ret.push(new el.Command().meta);
		});
		return ret;
	}
}

/**
 * For Handler.verifyMessage to specify actions to be taken.
 *
 * @see Handler.verifyMessage()
 */
class VerifiedActions {
	constructor(obj) {
		this.approximate = obj.approximate || false;
		this.ignore = obj.ignore || false;
		this.specificMessageRun = obj.specificMessageRun || false;
		this.regularRun = obj.regularRun || false;
	}
}

class Loader {
	constructor() {
		this.cmdStore = new CommandStorage();
	}
	verifyContents(contents) {
		if (!contents.Command) {
			throw new Error(
				`Command ${name} has no command object to run. Export a command, please!`
			);
		}
		const cmd = new contents.Command();
		const name = cmd.meta.name;
		const aliases = cmd.meta.aliases;

		if (!name) {
			throw new Error(
				`A command has no name. The rest of the meta is ${
					contents.meta
				}`
			);
		}
		if (aliases && !Array.isArray(aliases)) {
			throw new Error(
				`Command ${name} has aliases but it is not an array.`
			);
		}
		return true;
	}
	loadCommand(file) {
		const contents = require(file);
		this.verifyContents(contents);

		this.cmdStore.add(contents);
	}
	loadCommandsIn(folder) {
		const files = fs.readdirSync(folder);
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.match(/.js$/)) {
				this.loadCommand(path.join(process.cwd(), folder, file));
			}
		}
	}
}

class Handler {
	constructor(client) {
		if (!client) {
			throw new Error("Please pass a client object to Handler...");
		}
		this.client = client;
		this.loader = new Loader();
		this.cmdStore = this.loader.cmdStore;
		this.approximater = new algro.Approximater(
			this.cmdStore.commandNames,
			1
		);

		// Object.keys() kills this apparently
		this.approximateMessage = this.approximateMessage.bind(this);
		this.specificMessageRun = this.specificMessageRun.bind(this);
		this.run = this.run.bind(this);
	}
	approximateMessage(command, msg) {
		const approximated = this.approximater.approximate(command);
		if (!approximated) {
			// no, exit
			return;
		}
		// yes, return
		logger.debug(`Approximated command ${command} to ${approximated}`);
		new embeds.Embed(
			`Command ${command} not found.`,
			`Did you mean \`${approximated}\`?`
		)
			.semoji(":information_source:")
			.send(msg.channel);
		return approximated;
	}
	specificMessageRun(command, msg) {
		logger.debug(
			`Running ${msg.content.split(" ")[0]} via specific message`
		);
		this.run(
			this.cmdStore.specificMessages.get(msg.content.split(" ")[0]),
			msg
		);
	}
	run(command, msg) {
		if (!command) {
			throw new Error("Please pass Command to run().");
		}
		if (!msg) {
			throw new Error(
				"Please pass the message that triggered this command to run()"
			);
		}
		logger.debug(`Valid command ${command}`);

		// first element is the command
		const args = msg.content.split(" ").slice(1);
		const flags = msg.content.match(/-(\w)+/i);

		const savedCommand = this.cmdStore.retrieveCommand(command);
		const cmdToRun = new savedCommand.Command();
		cmdToRun.run(this.client, msg, args, flags);
	}
	verifyMessage(msg) {
		const command = msg.content.split(" ")[0].slice(config.prefix.length);
		const hasBotMention = (function(bot) {
			if (msg.mentions.users.first() !== undefined) {
				return msg.mentions.users.first().id === bot.user.id;
			} else return false;
		})(this.client);
		const hasPrefix =
			msg.content.startsWith(config.prefix) && msg.content !== "";
		const hasSpecificMessage = this.cmdStore.specificMessages.has(
			msg.content.split(" ")[0]
		);
		const hasCommand =
			this.cmdStore.has(command) &&
			this.approximater.cache.retrieve(command) !== null;
		const isBot = msg.author.bot;

		return {
			actions: new VerifiedActions({
				specificMessageRun: hasSpecificMessage,
				approximate: !hasCommand && !hasSpecificMessage,
				regularRun:
					hasCommand &&
					(hasPrefix || hasBotMention) &&
					!hasSpecificMessage,
				ignore:
					(!hasCommand &&
						!hasPrefix &&
						!hasBotMention &&
						!hasSpecificMessage) ||
					isBot
			}),
			command
		};
	}
	handleMessage(msg) {
		const verified = this.verifyMessage(msg);

		if (verified.actions.ignore) {
			logger.debug(`Ignored message ${msg.content}`);
			return;
		}
		const actions = {
			specificMessageRun: this.specificMessageRun,
			regularRun: this.run,
			approximate: this.approximateMessage
		};

		Object.keys(verified.actions)
			.filter(el => el in actions)
			.forEach(el => {
				if (verified.actions[el]) {
					actions[el](verified.command, msg);
				}
			});
	}
}

module.exports = { Handler };
