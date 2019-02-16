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

class CommandStorage {
	constructor() {
		// map names to commands - alias to commands key
		this.commandNames = new Map();
		this.commands = new Map();
	}
	add(contents) {
		const cmd = new contents.Command();
		const meta = cmd.meta;
		const name = meta.name;
		const aliases = meta.aliases || [];

		this.commandNames.set(name, name);
		aliases.forEach(el => {
			this.commandNames.set(el, name);
		});

		this.commands.set(name, contents);
		logger.debug(`Loaded command ${name}`);
	}
	retrieveCommand(name) {
		if (this.commands.has(name)) {
			return this.commands.get(name);
		} else if (this.commandNames.has(name)) {
			return this.commands.get(this.commandNames.get(name));
		} else {
			return undefined;
		}
	}
	has(name) {
		return this.commands.has(name) || this.commandNames.has(name);
	}
}

class Handler {
	constructor(client) {
		if (!client) {
			throw new Error("Please pass a client object to Handler...");
		}
		this.client = client;
		this.cmdStore = new CommandStorage();
		this.approximater = new algro.Approximater(this.cmdStore);
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
				this.loadCommand(path.join(process.cwd(),  folder, file));
			}
		}
	}
	handleMessage(msg) {
		const command = msg.content.split(" ")[0].slice(config.prefix.length);
		const hasBotMention = (function(bot) {
			if (msg.mentions.users.first() !== undefined) {
				return msg.mentions.users.first().id === bot.user.id;
			} else return false;
		})(this.client);
		const hasPrefix =
			msg.content.startsWith(config.prefix) && msg.content !== "";

		if (!hasPrefix && !hasBotMention) {
			logger.debug(`Irrelevant message ${msg}`);
			// ignore, irrelevant message
			return;
		}
		if (!this.cmdStore.has(command)) {
			// not found, can we approximate
			const approximated = this.approximater.approximate(command);
			if (!approximated) {
				// no, exit
				return;
			}
			// yes, suggest
			new embeds.Embed(
				`Command ${command} not found.`,
				`Did you mean \`${approximated}\`?`
			).send(msg.channel);
			logger.debug(`Approximated command ${command} to ${approximated}`);
			return;
		}
		logger.debug(`Valid command ${command}`);
		// command exists, run it
		this.run(command, msg);
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

		// first element is the command
		const args = msg.content.split(" ");

		const savedCommand = this.cmdStore.retrieveCommand(command);
		const cmdToRun = new savedCommand.Command();
		cmdToRun.run(this.client, msg, args);
	}
}

module.exports = { Handler };
