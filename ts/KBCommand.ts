import {KBCommandParameters} from "./KBTypes";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";

export interface KBCommand {
	name: string;
	parameters?: KBCommandParameters;
	handler: (message: KBMessage, response: KBResponse) => Promise<void>;
}
