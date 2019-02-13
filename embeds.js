const Discord = require("discord.js");
const logger = require("js-logger");

class Embed extends Discord.RichEmbed {
	/**
	 * Embed interface, making Discord.js' RichEmbed even easier
	 *
	 * @class
	 * @see {@link https://discord.js.org/#/docs/main/stable/class/RichEmbed}
	 */
	constructor(title = "", description = "", msg) {
		super();
		this.title = title;
		this.description = description;
		this.emoji = [];
		this.msg = msg;
	}
	color(what) {
		super.setColor(what);
		return this;
	}
	emoji(what) {
		this.emoji.push(what);
		this.title = `${this.emoji.join(" ")} ${this.title}`;
		return this;
	}
	send() {
		if (!this.msg) {
			logger.debug("Can't .send() message without passing a message in");
			return;
		} else {
			this.msg.channel.send(this);
		}
	}
}

class SuccessEmbed extends Embed {
	/**
	 * Embed with green color and check mark emoji
	 *
	 * @class
	 */
	constructor(title = "", description = "") {
		super(title, description);
		super.color("#00ff00");
		super.emoji(":white_check_mark:");
	}
}

class FailureEmbed extends Embed {
	/**
	 * Embed with red color and cross emoji
	 *
	 * @class
	 */
	constructor(title = "", description = "") {
		super(title, description);
		super.color("#ff0000");
		super.emoji(":x:");
	}
}

module.exports = {
	Embed,
	SuccessEmbed,
	FailureEmbed
};
