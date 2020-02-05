/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import Keybase from "keybase-bot";
import {MsgSummary} from "keybase-bot/lib/types/chat1";

type Types = "string" | "int" | "double" | "boolean" | "char";

interface Message {
	keybaseMessage: MsgSummary;
	content: string;
	senderId: string;
	channel: string;
	deviceName: string;
	username: string;
	time: number;
}

interface Command {
	name: string;
	parameters: {
		key: string;
		type: Types
	}[];
	handler: (message: Message) => Promise<string>;
}

interface CommandModule {
	name: string;
	commands: Command[];
}

(async (): Promise<void> => {

	const bot: Keybase = new Keybase();

	console.log("Will Init User");
	await bot.init("otto_bot", "material paddle wave echo giant able machine control first tape say meat wet");
	console.log("Did Init User");

	console.log("Now Listening");
	await bot.chat.watchAllChannelsForNewMessages(async(message: MsgSummary): Promise<void> => {
		message.
		console.log(`${message.sender.username}@${message.sender.deviceName} '${message.content.text?.body}'`);
		await bot.chat.send(message.channel, {body: `No you are a ${message.content.text?.body}!`});
		await bot.chat.command

	});

	await bot.deinit();

})().then((): void => {}).catch((err: any): void => console.error(err));