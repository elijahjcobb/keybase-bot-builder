import {MsgSummary} from "keybase-bot/lib/types/chat1";
import {KBCommandParameters} from "./KBTypes";
import { ObjectTypeDefinition, StandardType, ObjectType } from "typit";

export class KBMessage {

	private readonly parameters: KBCommandParameters;
	private readonly message: MsgSummary;
	private readonly command: object;

	public constructor(message: MsgSummary, command: object, parameters: KBCommandParameters) {

		this.message = message;
		this.parameters = parameters;
		this.command = command;

	}

	public getContent(): string {

		const content: string | undefined = this.message.content.text?.body;

		if (content === undefined) throw new Error("Body of message is undefined.");
		return content;

	}

	public getParameters<T extends object = object>(): T {

		if (this.parameters === undefined) throw new Error("Type parameters undefined but getParameters() was called.");

		const typeDef: ObjectTypeDefinition = {};

		for (const [k, v] of Object.entries(this.parameters)) {

			let value: StandardType<any> = StandardType.BOOLEAN;

			if (v === "string") value = StandardType.STRING;
			else if (v === "number") value = StandardType.NUMBER;
			else if (v === "boolean") value = StandardType.BOOLEAN;

			// @ts-ignore
			typeDef[k] = value;

		}

		const typitObj: ObjectType = new ObjectType(typeDef);
		const doConform: boolean = typitObj.checkConformity(this.command);
		if (!doConform) throw new Error("Parameters do not match specification.");

		return this.command as T;
	}

}