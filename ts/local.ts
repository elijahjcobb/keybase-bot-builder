import {KBBot, KBMessage, KBResponse} from "./index";
import * as FS from "fs";

(async (): Promise<void> => {

	const bot: KBBot = await KBBot.init("otto_bot", "material paddle wave echo giant able machine control first tape say meat wet");

	bot.command({
		name: "add",
		parameters: {
			x: "number",
			y: "number"
		},
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {

			const body: {x: number, y: number} = message.getParameters();
			await res.send(body.x + body.y);

		}
	});

	bot.command({
		name: "multiply",
		parameters: {
			x: "number",
			y: "number"
		},
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
			const body: {x: number, y: number} = message.getParameters();
			await res.send(body.x * body.y);
		}
	});

	bot.command({
		name: "code",
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
			await res.sendCodeBlock("let x: string = \"\";\nfor (let i: number = 0; i < 100; i++) x += \"HELLO \";\nconsole.log(x);");
		}
	});

	bot.command({
		name: "die",
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
			await res.send("Bye, bye!");
			await bot.kill();
		}
	});

	bot.start();

})().then((): void => {}).catch((err: any): void => console.error(err));