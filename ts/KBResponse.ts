import {MsgSummary} from "keybase-bot/lib/types/chat1";
import ChatClient from "keybase-bot/lib/chat-client";
import { ObjectType } from "typit";

export class KBResponse {

	private readonly message: MsgSummary;
	private readonly chat: ChatClient;

	public constructor(message: MsgSummary, chat: ChatClient) {

		this.message = message;
		this.chat = chat;

	}

	public async sendFile(value: string): Promise<void> {

		await this.chat.attach(this.message.conversationId, value);

	}

	public async sendCodeBlock(value: string): Promise<void> {

		await this.send("```\n" + value + "\n```");

	}

	public async sendObject(value: object): Promise<void> {

		await this.sendCodeBlock(JSON.stringify(value, null, 4));

	}

	public async sendArray(value: any[]): Promise<void> {

		await this.sendObject(value);

	}

	public async send(value: string | number | boolean): Promise<void> {

		let msg: string = "";
		if (typeof value === "number") msg = "`" + value + "`";
		else if (typeof value === "boolean") msg = "`" + value ? "true" : "false" + "`";
		else msg = value;

		await this.chat.send(this.message.conversationId, {body: msg});

	}
}