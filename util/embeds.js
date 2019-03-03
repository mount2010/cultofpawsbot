const Discord = require("discord.js");
// const logger = require("js-logger");

class Embed extends Discord.RichEmbed {
	/**
	 * Embed interface, making Discord.js' RichEmbed even easier
	 *
	 * @class
	 * @see {@link https://discord.js.org/#/docs/main/stable/class/RichEmbed}
	 */
	constructor(title = "", description = "") {
		super();
		this.title = title;
		this.description = description;
		this.emoji = [];
	}
	scolor(what) {
		super.setColor(what);
		return this;
	}
	semoji(what) {
		this.emoji.push(what);
		this.title = `${this.emoji.join(" ")} ${this.title}`;
		return this;
	}
	send(channel) {
		return channel.send(this);
	}
}
module.exports.Embed = Embed;

class SuccessEmbed extends Embed {
	/**
	 * Embed with green color and check mark emoji
	 *
	 * @class
	 */
	constructor(title = "", description = "") {
		super(title, description);
		super.scolor("#00ff00");
		super.semoji(":white_check_mark:");
	}
}
module.exports.SuccessEmbed = SuccessEmbed;

class FailureEmbed extends Embed {
	/**
	 * Embed with red color and cross emoji
	 *
	 * @class
	 */
	constructor(title = "", description = "") {
		super(title, description);
		super.scolor("#ff0000");
		super.semoji(":x:");
	}
}
module.exports.FailureEmbed = FailureEmbed;

/*
module.exports.Responser = class {
	**
	 * Utility for adding reaction based choice selection
	 * 
	 * @class
	 * @param {[Emoji, function]} emojiMapped Emojis and the actions to take when clicked
	 * @param {object} options Options for the reponser
	 *
	constructor(emojiMapped, options) {
		logger.log("Meow");
	}
	**
	 * Set timeout for reactions in ms
	 * 
	 * @param {int} ms Timeout for reactions
	 *
	timeOut (ms) {
		logger.log("Mia");
	}
}
*/
