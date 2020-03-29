/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import * as FS from "fs";
import * as Path from "path";
import {KBBot, KBResponse, KBMessage, KBConversation} from "./index";

(async (): Promise<void> => {

	// The third parameter to the KBBot.init() static method is optional but is shown below
	// with all optional properties defined.
	const paperKey: string = FS.readFileSync(Path.resolve("./paperkey.txt")).toString("utf8");
	const bot: KBBot = await KBBot.init("otto_bot", paperKey, {
		logging: true, // whether all events should be logged
		debugging: true, // whether debugging mode should be enabled (allows extra commands)
		hostname: "my-keybase-bot", // the hostname to show up in logs
		checkAllMessages: true // whether all messages should be executed or just those that start with '!'
	});

	bot.onNewConversation(async(conv: KBConversation, res: KBResponse): Promise<void> => {

		await res.send(`Hello ${conv.getUserName()}! Nice of you to chat with me, use a \`!\` to execute my commands.`);

	});

	bot.command({
		name: "add",
		description: "Add all the parameters together.",
		usage: "!add 1 2 3",
		handler: async (msg: KBMessage, res: KBResponse): Promise<void> => {

			const nums: (number | string)[] = msg.getParameters();
			let total: number = 0;
			for (const num of nums) if (typeof num === "number") total += num;

			await res.send(total);

		}
	});

	bot.start();

})();