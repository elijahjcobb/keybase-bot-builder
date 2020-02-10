import {KBBot, KBMessage, KBResponse} from "./index";

(async (): Promise<void> => {

	const bot: KBBot = await KBBot.init("otto_bot", "material paddle wave echo giant able machine control first tape say meat wet");

	bot.command({
		name: "add",
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {

			let t: number = 0;
			const nums: (string | number)[] = message.getParameters();
			for (const n of nums) if (typeof n === "number") t += n;

			await res.send(t);

		}
	});

	bot.command({
		name: "mult",
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {

			let t: number = 1;
			const nums: (string | number)[] = message.getParameters();
			for (const n of nums) if (typeof n === "number") t *= n;

			await res.send(t);

		}
	});

	bot.command({
		name: "pow",
		parameters: {
			a: "number",
			b: "number"
		},
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
			const body: {a: number, b: number} = message.getModifiers();
			await res.send(Math.pow(body.a, body.b));
		}
	});

	bot.command({
		name: "code",
		handler: async (message: KBMessage, res: KBResponse): Promise<void> => {
			await res.sendCodeBlock("let x: string = \"\";\nfor (let i: number = 0; i < 100; i++) x += \"HELLO \";\nconsole.log(x);");
		}
	});

	bot.start();

})().then((): void => {}).catch((err: any): void => console.error(err));