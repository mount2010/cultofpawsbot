const path = require("path");
const Command = require(path.join(process.cwd(), "command"));

module.exports.Command = class extends Command {
	constructor () {
		super({
			name: "h"			
		});
	}
};
