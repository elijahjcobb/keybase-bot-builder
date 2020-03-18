import {KBCommandModifiers} from "./KBTypes";
import {KBMessage} from "./KBMessage";
import {KBResponse} from "./KBResponse";

/**
 * This is the interface to follow when using the bot.command(); method.
 */
export interface KBCommand {

	/**
	 * The name of the command.
	 */
	name: string;

	/**
	 * A description of the command.
	 */
	description?: string;

	/**
	 * An example of how the command could be entered.
	 */
	usage?: string;

	/**
	 * The parameters that exist on the command that will be type checked.
	 */
	parameters?: KBCommandModifiers;

	/**
	 * A handler that returns a promise providing a message and response object.
	 * @param message
	 * @param response
	 */
	handler: (message: KBMessage, response: KBResponse) => Promise<void>;
}
