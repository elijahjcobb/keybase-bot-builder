import {KBCommandModifiers} from "./KBTypes";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";

export interface KBCommand {
	name: string;
	description?: string;
	usage?: string;
	parameters?: KBCommandModifiers;
	handler: (message: KBMessage, response: KBResponse) => Promise<void>;
}
