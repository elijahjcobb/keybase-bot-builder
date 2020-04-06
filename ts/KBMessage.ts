import {MsgSummary} from "keybase-bot/lib/types/chat1";
import {KBCommandModifiers} from "./KBTypes";
import { ObjectTypeDefinition, StandardType, ObjectType, OptionalType } from "typit";
import {KBConversation} from "./KBConversation";

/**
 * When the bot receives a message a KBMessage instance is created and provided to you through the handler on a object
 * passed to command() on a KBBot instance.
 *
 * You will never need to create an instance of this class yourself.
 */
export class KBMessage {

	private readonly modifierTypeRequirements: KBCommandModifiers;
	private readonly message: MsgSummary;
	private readonly convertedMessage: object;

	/**
	 * You will never need to manually create a KBMessage instance but this is the constructor for one.
	 * @param message An instance of a MsgSummary from the keybase-bot package.
	 * @param command The command that is passed in which is parsed from the original message.
	 * @param parameters The command modifiers specified in the object passed to command() for type checking.
	 */
	public constructor(message: MsgSummary, command: object, parameters: KBCommandModifiers) {

		this.message = message;
		this.modifierTypeRequirements = parameters;
		this.convertedMessage = command;

	}

	/**
	 * This will return the raw message that was received and will not parse or type check. It will throw an error if
	 * the message is undefined.
	 */
	public getContent(): string {

		const content: string | undefined = this.message.content.text?.body;

		if (content === undefined) throw new Error("Body of message is undefined.");
		return content;

	}

	/**
	 * This will return the parameters of the command so if a command is !x 1 2 3 -a A -b B it would return [1, 2, 3].
	 */
	public getParameters(): (string | number)[] {

		const msg: {_: string[]} = (this.convertedMessage as {_: string[]});
		const params: string[] = msg["_"];

		return params.slice(1);

	}

	/**
	 * This will return the modifiers on the command. It is also is generic so pass in a type definition for the type
	 * and it will type check for you during runtime and give you types provided by the generic argument.
	 *
	 * If the command is !x 1 2 3 -a A -b B this would return {a: "A", b: "B"}.
	 */
	public getModifiers<T extends object = object>(): T {

		if (this.modifierTypeRequirements === undefined) throw new Error("Type requirements undefined but getModifiers() was called.");

		const typeDef: ObjectTypeDefinition = {};

		for (const [k, v] of Object.entries(this.modifierTypeRequirements)) {

			let value: OptionalType<any> = new OptionalType(StandardType.BOOLEAN);

			if (v === "string") value = new OptionalType(StandardType.STRING);
			else if (v === "number") value = new OptionalType(StandardType.NUMBER);
			else if (v === "boolean") value = new OptionalType(StandardType.BOOLEAN);

			// @ts-ignore
			typeDef[k] = value;

		}

		const typitObj: ObjectType = new ObjectType(typeDef);
		const doConform: boolean = typitObj.checkConformity(this.convertedMessage);
		if (!doConform) throw new Error("Modifiers do not match specification.");

		return this.convertedMessage as T;
	}

	/**
	 * Get the id of the conversation.
	 */
	public getConversationId(): string {

		return this.message.conversationId;

	}

	/**
	 * Get the id of the device that sent the message.
	 */
	public getDeviceId(): string {

		return this.message.sender.deviceId;

	}

	/**
	 * Get the username of the user who sent the message.
	 */
	public getUsername(): string {

		if (this.message.sender.username === undefined) throw new Error("Username of sender is undefined.");
		return this.message.sender.username;

	}

	/**
	 * Get the name of the device that sent the message.
	 */
	public getDeviceName(): string {

		if (this.message.sender.deviceName === undefined) throw new Error("Device name of sender is undefined.");
		return this.message.sender.deviceName;

	}

}