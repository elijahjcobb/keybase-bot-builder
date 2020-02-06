/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import Keybase from "keybase-bot";
import {MsgSummary} from "keybase-bot/lib/types/chat1";
import Minimist from "minimist";
import {Dictionary} from "@ejc-tsds/dictionary";
import {ObjectType, StandardType, ObjectTypeDefinition} from "typit";

type Types = "string" | "number" | "boolean";


class Message {

	private readonly parameters: CommandParameters;
	private readonly message: MsgSummary;

	public constructor(message: MsgSummary, parameters: CommandParameters) {

		this.message = message;
		this.parameters = parameters;

	}

	public getContent(): string {

		const content: string | undefined = this.message.content.text?.body;

		if (content === undefined) throw new Error("Body of message is undefined.")
		return content;

	}

	public getParameters<T extends object = object>(): T {

		if (this.parameters === undefined) throw new Error("Type parameters undefined but getParameters() was called.");
		const body: string | undefined = this.message.content.text?.body;
		if (body === undefined) throw new Error("Body of message is undefined.");
		const obj: object = JSON.parse(body);

		const typeDef: ObjectTypeDefinition = {};

		for (const [k, v] of Object.entries(this.parameters)) {

			let value: StandardType<any> = StandardType.BOOLEAN;

			if (v === "string") value = StandardType.STRING;
			else if (v === "number") value = StandardType.NUMBER;
			else if (v === "boolean") value = StandardType.BOOLEAN;

			// @ts-ignore
			typeDef[k] = value;

		}

		const typitObj: ObjectType = new ObjectType(typeDef);
		const doConform: boolean = typitObj.checkConformity(obj);
		if (!doConform) throw new Error("Parameters do not match specification.");

		return obj as T;
	}

}

type CommandParameters = { [key: string]: Types; } | undefined;

interface Command {
	name: string;
	parameters?: CommandParameters;
	handler: (message: Message, response: Response) => Promise<void>;
}

class Response {


	public async sendFile(value: string): Promise<void> {}
	public async sendCodeBlock(value: string): Promise<void> {}
	public async send(value: string | number | boolean): Promise<void> {}
	public async sendObject(value: object): Promise<void> {}
	public async sendArray(value: any[]): Promise<void> {}
}

class Bot {

	private keybaseBot: Keybase;
	private commands: Dictionary<string, Command>;

	private constructor(keybaseBot: Keybase) {

		this.keybaseBot = keybaseBot;
		this.commands = new Dictionary<string, Command>();

	}

	public start(): void {

		this.keybaseBot.chat.watchAllChannelsForNewMessages(async (msg: MsgSummary): Promise<void> => {

			const message: string | undefined = msg.content.text?.body;
			if (!message) return;
			const messageObj: string[] = message.split(" ");
			const commandInput: { _: string } = Minimist(messageObj) as unknown as {_: string};
			const commandName: string = commandInput._;
			const command: Command | undefined = this.commands.get(commandName);
			if (!command) return;


		})
			.then((): void => console.log("stopped watching"))
			.catch((err: any): void => console.error(err));

	}

	public command(command: Command): void { this.commands.set(command.name, command); }
	public kill(): Promise<void> { return this.keybaseBot.deinit(); }

	public static async init(username: string, paperKey: string): Promise<Bot> {

		const bot: Keybase = new Keybase();
		await bot.init(username, paperKey);

		return new Bot(bot);

	}

}

(async (): Promise<void> => {

	const bot: Bot = await Bot.init("otto_bot", "material paddle wave echo giant able machine control first tape say meat wet");

	bot.command({
		name: "add",
		parameters: {
			x: "number",
			y: "number"
		},
		handler: async (message: Message, res: Response): Promise<void> => {

			const body: {x: number, y: number} = message.getParameters();
			await res.send(body.x + body.y);

		}
	});

	await bot.kill();

	// const bot: Keybase = new Keybase();
	//
	// console.log("Will Init User");
	// await bot.init("otto_bot", "material paddle wave echo giant able machine control first tape say meat wet");
	// console.log("Did Init User");
	//
	// console.log("Now Listening");
	//
	// await bot.chat.clearCommands();
	// await bot.chat.advertiseCommands({
	// 	advertisements: [
	// 		{
	// 			type: "public",
	// 			commands: [
	// 				{
	// 					name: "!echo",
	// 					description: "Sends out your message to the current channel.",
	// 					usage: "x",
	// 				},
	// 			]
	// 		}
	// 	]
	// });
	//
	// await bot.chat.watchAllChannelsForNewMessages(async(message: MsgSummary): Promise<void> => {
	// 	const args: object = Minimist((message.content.text?.body?.split(" ") || []));
	// 	console.log(`${message.sender.username}@${message.sender.deviceName} - `);
	// 	console.log(args);
	// 	await bot.chat.send(message.conversationId, {body: "`" + JSON.stringify(args) + "`"});
	// });
	//
	//
	//
	// await bot.deinit();

})().then((): void => {}).catch((err: any): void => console.error(err));