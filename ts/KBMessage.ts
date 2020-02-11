import {MsgSummary} from "keybase-bot/lib/types/chat1";
import {KBCommandModifiers} from "./KBTypes";
import { ObjectTypeDefinition, StandardType, ObjectType, OptionalType } from "typit";

export class KBMessage {

	private readonly modifierTypeRequirements: KBCommandModifiers;
	private readonly message: MsgSummary;
	private readonly convertedMessage: object;

	public constructor(message: MsgSummary, command: object, parameters: KBCommandModifiers) {

		this.message = message;
		this.modifierTypeRequirements = parameters;
		this.convertedMessage = command;

	}

	public getContent(): string {

		const content: string | undefined = this.message.content.text?.body;

		if (content === undefined) throw new Error("Body of message is undefined.");
		return content;

	}

	public getParameters(): (string | number)[] {

		const msg: {_: string[]} = (this.convertedMessage as {_: string[]});
		const params: string[] = msg["_"];

		return params.slice(1);

	}

	public getModifiers<T extends object = object>(): Partial<T> {

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

}