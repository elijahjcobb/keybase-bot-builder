import Keybase from "keybase-bot";
import {Dictionary} from "@ejc-tsds/dictionary";
import {MsgSummary} from "keybase-bot/lib/types/chat1";
import Minimist from "minimist";
import {KBCommand} from "./KBCommand";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";
import {KBLogger} from "./KBLogger";

/**
 * An interface for a configuration profile.
 *
 * logging - This will log every event that happens from the bot.
 * debugging - This will add some debug commands to the bot.
 * hostname - The name of the host in the logs, defaults to 'keybase'.
 */
export interface KBBotConfig {
	logging?: boolean;
	debugging?: boolean;
	hostname?: string;
}

/**
 * The KBBot is the actual thing you will be creating and interfacing with. Create a new instance using the static
 * init method.
 */
export class KBBot {

	private readonly keybaseBot: Keybase;
	private commands: Dictionary<string, KBCommand>;
	private readonly config: KBBotConfig | undefined;

	/**
	 * Do not use!
	 * @param keybaseBot
	 * @param config
	 */
	private constructor(keybaseBot: Keybase, config?: KBBotConfig) {

		this.keybaseBot = keybaseBot;
		this.commands = new Dictionary<string, KBCommand>();
		this.config = config;

		if (this.config?.logging === true) KBLogger.enable();
		else KBLogger.disable();

		if (this.config?.hostname) KBLogger.hostname = this.config.hostname;

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
			await this.keybaseBot.chat.watchAllChannelsForNewMessages(async (msg: MsgSummary): Promise<void> => {

				let message: string | undefined = msg.content.text?.body;
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
				const response: KBResponse = new KBResponse(msg, this.keybaseBot.chat);

				KBLogger.log("Will pass control to command handler.");

				try {

					await command.handler(messageObject, response);

				} catch (e) {

					KBLogger.log("Command handler did fail with message: " + e);
					await response.sendCodeBlock(e);

				} finally {

					KBLogger.log("Received control from command handler.");

				}


			});

			KBLogger.log("Did watch for messages.");

		})()
			.then((): void => console.log("stopped watching"))
			.catch((err: any): void => console.error(err));


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
	 * @param paperKey A paper key for the bot.
	 * @param config A configuration profile that follows the KBBotConfig interface.
	 */
	public static async init(username: string, paperKey: string, config?: KBBotConfig): Promise<KBBot> {

		const bot: Keybase = new Keybase();
		await bot.init(username, paperKey);

		return new KBBot(bot, config);

	}

}
