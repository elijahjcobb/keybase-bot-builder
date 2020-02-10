import Keybase from "keybase-bot";
import {Dictionary} from "@ejc-tsds/dictionary";
import {MsgSummary} from "keybase-bot/lib/types/chat1";
import Minimist from "minimist";
import {KBCommand} from "./KBCommand";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";
import {KBLogger} from "./KBLogger";

export class KBBot {

	private readonly keybaseBot: Keybase;
	private commands: Dictionary<string, KBCommand>;

	private constructor(keybaseBot: Keybase) {

		this.keybaseBot = keybaseBot;
		this.commands = new Dictionary<string, KBCommand>();

	}

	private async sendIDKMessage(msg: MsgSummary): Promise<void> {

		KBLogger.log("Received invalid command.");
		await this.keybaseBot.chat.send(msg.conversationId, {body: "I do not know that command. Use a `!` to see all commands I can help with. :smile:"});

	}

	private async advertiseCommands(): Promise<void> {

		KBLogger.log("Will advertise commands.");
		const commands: {name: string, description: string, usage: string}[] = [];

		for (const command of this.commands.values()) {

			commands.push({
				name: command.name,
				description: "x",
				usage: JSON.stringify(command.parameters)
			});

		}

		await this.keybaseBot.chat.advertiseCommands({advertisements: [{type: "public", commands}]});
		KBLogger.log("Did advertise commands.");
	}

	private addDefaultCommands(): void {

		KBLogger.log("Will add default commands.");

		this.command({
			name: "die",
			handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
				await res.send("Bye, bye!");
				await this.kill();
			}
		});

		this.command({
			name: "clearCommands",
			handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
				await this.clearCommands();
				await res.send("Done!");
			}
		});

		this.command({
			name: "reAdvertiseCommands",
			handler: async (message: KBMessage, res: KBResponse): Promise<void> => {

				await this.clearCommands();
				await this.advertiseCommands();
				await res.send("Done!");

			}
		});

		KBLogger.log("Did add default commands.");

	}

	private async clearCommands(): Promise<void> {

		KBLogger.log("Will clear commands");
		await this.keybaseBot.chat.clearCommands();
		KBLogger.log("Did clear commands");

	}

	public start(): void {

		KBLogger.bot = this.keybaseBot;
		KBLogger.log("Starting Bot");

		(async(): Promise<void> => {

			await this.clearCommands();
			this.addDefaultCommands();
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

	public enableLogging(): void { KBLogger.enable(); }
	public disableLogging(): void { KBLogger.disable(); }

	public command(command: KBCommand): void { this.commands.set(command.name, command); }
	public kill(): Promise<void> { return this.keybaseBot.deinit(); }

	public static async init(username: string, paperKey: string): Promise<KBBot> {

		const bot: Keybase = new Keybase();
		await bot.init(username, paperKey);

		return new KBBot(bot);

	}

}
