import Keybase from "keybase-bot";
import {Dictionary} from "@ejc-tsds/dictionary";
import {MsgSummary, ConvSummary, MessageText} from "keybase-bot/lib/types/chat1";
import Minimist from "minimist";
import {KBCommand} from "./KBCommand";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";
import {KBLogger} from "./KBLogger";
import {KBConversation} from "./KBConversation";
import {Neon} from "@element-ts/neon";
import FS from "fs";
import Path from "path";

/**
 * An interface for a configuration profile.
 *
 * logging - This will log every event that happens from the bot.
 * debugging - This will add some debug commands to the bot.
 * hostname - The name of the host in the logs, defaults to 'keybase'.
 * checkAllMessages - If false, it will only run on messages that start with '!', if true, it will run on all messages.
 */
export interface KBBotConfig {
	logging?: boolean;
	debugging?: boolean;
	hostname?: string;
	checkAllMessages?: boolean;
}

/**
 * The KBBot is the actual thing you will be creating and interfacing with. Create a new instance using the static
 * init method.
 */
export class KBBot {

	private readonly keybaseBot: Keybase;
	private commands: Dictionary<string, KBCommand>;
	private readonly config: KBBotConfig | undefined;
	private normalMessageHandler: ((msg: KBMessage, res: KBResponse) => Promise<void>) | undefined;

	/**
	 * Do not use!
	 * @param keybaseBot
	 * @param config
	 */
	private constructor(keybaseBot: Keybase, config?: KBBotConfig) {

		this.keybaseBot = keybaseBot;
		this.commands = new Dictionary<string, KBCommand>();
		this.config = config;

		this.onMessage = this.onMessage.bind(this);

		if (this.config?.logging === true) KBLogger.enable();
		else KBLogger.disable();

		if (this.config?.hostname) KBLogger.setHostname(this.config.hostname);

	}

	/**
	 * This will send the a message that is much like a 404.
	 * @param msg
	 */
	private async sendIDKMessage(msg: MsgSummary): Promise<void> {

		KBLogger.log("Received invalid command.");
		await this.keybaseBot.chat.send(msg.conversationId, {body: "I do not know that command. Use a `!` to see all commands I can help with. :smile:"});

	}

	/**
	 * This will advertise all commands to the chat window.
	 */
	private async advertiseCommands(): Promise<void> {

		KBLogger.log("Will advertise commands.");
		const commands: {name: string, description: string, usage: string}[] = [];

		for (const command of this.commands.values()) {

			commands.push({
				name: command.name,
				description: command.description ?? "",
				usage: command.usage ?? ""
			});

		}

		await this.keybaseBot.chat.advertiseCommands({advertisements: [{type: "public", commands}]});
		KBLogger.log("Did advertise commands.");
	}

	/**
	 * This will add all the default commands that this package provides.
	 */
	private addDefaultCommands(): void {

		KBLogger.log("Will add default commands.");

		this.command({
			name: "die",
			description: "Kill the bot's process.",
			usage: "!die",
			handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
				await res.send("Bye, bye!");
				await this.kill();
			}
		});

		this.command({
			name: "commands",
			description: "Deal with commands for keybase -l for load, -c for clear.",
			usage: "!commands -l -c",
			parameters: {
				"l": "boolean",
				"c": "boolean"
			},
			handler: async (message: KBMessage, res: KBResponse): Promise<void> => {

				const msg: {l?: boolean, c?: boolean} = message.getModifiers();

				if (msg.c) await this.clearCommands();
				if (msg.l) await this.advertiseCommands();
				await res.send("Done!");
			}
		});

		KBLogger.log("Did add default commands.");

	}

	/**
	 * This will clear all the commands that the bot has previously registered.
	 */
	private async clearCommands(): Promise<void> {

		KBLogger.log("Will clear commands");
		await this.keybaseBot.chat.clearCommands();
		KBLogger.log("Did clear commands");

	}

	private async onMessage(msg: MsgSummary): Promise<void> {

		// Skip non-text messages.
		if (msg.content.text === undefined) return;

		let message: string | undefined = msg.content.text?.body;

		if (message?.charAt(0) !== "!") {

			if (this.config?.checkAllMessages === true) {
				KBLogger.log("Got message that is not a command and checkAllMessages is enabled, sending 404 message.");
				return await this.sendIDKMessage(msg);
			} else {
				KBLogger.log("Got message that is not a command and checkAllMessages is disabled, ignoring.");

				const messageObject: KBMessage = new KBMessage(msg, {}, {});
				const response: KBResponse = new KBResponse(msg.conversationId, this.keybaseBot.chat);

				if (this.normalMessageHandler) return await this.normalMessageHandler(messageObject, response);

				return;
			}
		}

		if (message?.charAt(0) === "!") message = message.slice(1);
		if (!message) return await this.sendIDKMessage(msg);
		const messageObj: string[] = message.split(" ");
		const commandInput: { _: string[] } = Minimist(messageObj) as unknown as {_: string[]};
		KBLogger.log("Received message '" + JSON.stringify(commandInput) + "' from " + msg.sender.username + "@" + msg.sender.deviceName + ".");
		const commandName: string = commandInput._[0];
		KBLogger.log("Looking for command '" + commandName + "'.");
		const command: KBCommand | undefined = this.commands.get(commandName);
		if (!command) return await this.sendIDKMessage(msg);

		const messageObject: KBMessage = new KBMessage(msg, commandInput, command.parameters);
		const response: KBResponse = new KBResponse(msg.conversationId, this.keybaseBot.chat);

		KBLogger.log("Will pass control to command handler.");

		try {

			await command.handler(messageObject, response);

		} catch (e) {

			KBLogger.log("Command handler did fail with message: " + e);
			await response.sendCodeBlock(e);

		} finally {

			KBLogger.log("Received control from command handler.");

		}

	}

	/**
	 * Programmatically invoke a command on the bot.
	 * @param command A message that simulates a message from the user.
	 * @param message A reference object that provides the context.
	 */
	public async invoke(command: string, message: KBMessage): Promise<void> {

		const msg: MsgSummary = message.getKeyBaseMessageSummary();
		const text: MessageText | undefined = msg.content.text;
		if (text === undefined) return;
		text.body = command;
		msg.content.text = text;
		msg.sentAtMs = Date.now();

		await this.onMessage(msg);

	}

	/**
	 * This will make the bot start listening for new messages.
	 */
	public start(): void {

		KBLogger.bot = this.keybaseBot;
		KBLogger.log("Starting Bot");

		(async(): Promise<void> => {

			await this.clearCommands();
			if (this.config?.debugging === true) this.addDefaultCommands();
			await this.advertiseCommands();

			KBLogger.log("Will watch for messages.");
			await this.keybaseBot.chat.watchAllChannelsForNewMessages(this.onMessage);
			KBLogger.log("Did watch for messages.");

		})()
			.then((): void => console.log("stopped watching for messages"))
			.catch((err: any): void => Neon.err(err, true));


	}

	/**
	 * Use this to respond to messages that are not commands (don't start with "!"). Note, checkAllMessages must
	 * be disabled.
	 * @param handler A handler.
	 */
	public onNormalMessage(handler: (msg: KBMessage, res: KBResponse) => Promise<void>): void {

		this.normalMessageHandler = handler;

	}

	/**
	 * Use this to respond to new conversations and send intro messages.
	 * @param handler A handler to use to send intro messages.
	 */
	public onNewConversation(handler: (conv: KBConversation, res: KBResponse) => Promise<void>): void {

		this.keybaseBot.chat.watchForNewConversation((conv: ConvSummary): void => {

			const conversation: KBConversation = new KBConversation(conv);
			const response: KBResponse = new KBResponse(conversation.getId(), this.keybaseBot.chat);

			KBLogger.log("Will pass control to new conversation handler.");

			handler(conversation, response).then((): void => {

				KBLogger.log("Received control from new conversation handler.");

			}).catch((e: any): void => {

				KBLogger.log("new message handler did fail with message: " + e);

				response.sendCodeBlock(e).catch((): void => {

					KBLogger.log("new message handler did fail to send error message : " + e);

				});

			});

		}, (err: Error): void => { throw err; })
			.then((): void => Neon.log("stopped watching for new messages"))
			.catch((err: any): void => Neon.err(err, true));
	}

	/**
	 * This will register a command that the bot can respond to.
	 * @param command An object following the KBCommand interface.
	 */
	public command(command: KBCommand): void { this.commands.set(command.name, command); }

	/**
	 * This will kill the bot.
	 */
	public kill(): Promise<void> { return this.keybaseBot.deinit(); }

	/**
	 * Use this to create a new bot as it needs to be async.
	 * @param username The username of the bot.
	 * @param pathToPaperKey A path to the paper key for the bot.
	 * @param config A configuration profile that follows the KBBotConfig interface.
	 */
	public static async init(username: string, pathToPaperKey: string, config?: KBBotConfig): Promise<KBBot> {

		const bot: Keybase = new Keybase();
		const absolutePath: string = Path.resolve(pathToPaperKey);
		if (!FS.existsSync(absolutePath)) throw new Error(`The paper key does not exist: ${absolutePath}.`);
		const paperKey: string = FS.readFileSync(absolutePath).toString("utf8");
		await bot.init(username, paperKey);

		return new KBBot(bot, config);

	}

}
