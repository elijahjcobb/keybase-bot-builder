import {MsgSummary} from "keybase-bot/lib/types/chat1";
import ChatClient from "keybase-bot/lib/chat-client";

/**
 * This is the object that will be passed to you in the handler of the object passed to a command() call on KBBot. You
 * will never have to create an instance of this class as it will be created for you.
 */
export class KBResponse {

	private readonly conversationId: string;
	private readonly chat: ChatClient;

	/**
	 * Create a new instance of a KBResponse.
	 * @param conversationId The conversationId.
	 * @param chat A ChatClient provided by keybase-bot package.
	 */
	public constructor(conversationId: string, chat: ChatClient) {

		this.conversationId = conversationId;
		this.chat = chat;

	}

	/**
	 * Send a file to the client.
	 * @param value The absolute path to a file in your file system.
	 */
	public async sendFile(value: string): Promise<void> {

		await this.chat.attach(this.conversationId, value);

	}

	/**
	 * Send a code block to the client.
	 * @param value The message to be contained within the code block.
	 */
	public async sendCodeBlock(value: string): Promise<void> {

		await this.send("```\n" + value + "\n```");

	}

	/**
	 * Send an object to the client. It will be stringified and then sent through a code block.
	 * @param value The object to be sent.
	 */
	public async sendObject(value: object): Promise<void> {

		await this.sendCodeBlock(JSON.stringify(value, null, 4));

	}

	/**
	 * Send an array to the client. This just calls sendObject underneath the hood.
	 * @param value Any type array.
	 */
	public async sendArray(value: any[]): Promise<void> {

		await this.sendObject(value);

	}

	/**
	 * Send a string, number, or boolean. If it is a string, it will send normally but if it is a number or boolean it
	 * will be sent with code ticks. Boolean will be sent as `true` or `false` respectively.
	 * @param value The value to be sent to the client.
	 */
	public async send(value: string | number | boolean): Promise<void> {

		let msg: string = "";
		if (typeof value === "number") msg = "`" + value + "`";
		else if (typeof value === "boolean") msg = "`" + value ? "true" : "false" + "`";
		else msg = value;

		await this.chat.send(this.conversationId, {body: msg});

	}
}