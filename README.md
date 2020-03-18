# keybase-bot-builder
This is a nice wrapper for a keybase bot that has built in support for type checking and parsing. Also, it has really
easy methods for sending things to the client and receiving commands.

## Example
```typescript
import {KBBot, KBResponse, KBMessage} from "keybase-bot-builder";

(async (): Promise<void> => {
	
	const bot: KBBot = await KBBot.init("the-bot-username", "a-paperkey-for-the-bot");
	
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
```

## Documentation
Everything is completely documented. You can view the
[declaration files](https://github.com/elijahjcobb/request/keybase-bot-builder/master/dts) or even the
[source code](https://github.com/elijahjcobb/keybase-bot-builder/tree/master/ts) on GitHub.

## Bugs
If you find any bugs please [create an issue on GitHub](https://github.com/elijahjcobb/keybase-bot-builder/issues) or
if you are old fashioned email me at [elijah@elijahcobb.com](mailto:elijah@elijahcobb.com).