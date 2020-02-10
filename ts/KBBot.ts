import Keybase from "keybase-bot";
import {Dictionary} from "@ejc-tsds/dictionary";
import {MsgSummary} from "keybase-bot/lib/types/chat1";
import Minimist from "minimist";
import {KBCommand} from "./KBCommand";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";

export class KBBot {

	private keybaseBot: Keybase;
	private commands: Dictionary<string, KBCommand>;

	private constructor(keybaseBot: Keybase) {

		this.keybaseBot = keybaseBot;
		this.commands = new Dictionary<string, KBCommand>();

	}

	public start(): void {

		this.keybaseBot.chat.watchAllChannelsForNewMessages(async (msg: MsgSummary): Promise<void> => {

			const message: string | undefined = msg.content.text?.body;
			if (!message) return;
			const messageObj: string[] = message.split(" ");
			const commandInput: { _: string[] } = Minimist(messageObj) as unknown as {_: string[]};
			const commandName: string = commandInput._[0];
			const command: KBCommand | undefined = this.commands.get(commandName);
			if (!command) return;

			const messageObject: KBMessage = new KBMessage(msg, commandInput, command.parameters);
			const response: KBResponse = new KBResponse(msg, this.keybaseBot.chat);
			await command.handler(messageObject, response);


		})
			.then((): void => console.log("stopped watching"))
			.catch((err: any): void => console.error(err));

	}

	public command(command: KBCommand): void { this.commands.set(command.name, command); }
	public kill(): Promise<void> { return this.keybaseBot.deinit(); }

	public static async init(username: string, paperKey: string): Promise<KBBot> {

		const bot: Keybase = new Keybase();
		await bot.init(username, paperKey);

		return new KBBot(bot);

	}

}
