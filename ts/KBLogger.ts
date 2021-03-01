/**
 * This is a utility class to help with logging all interactions with the bot. It is enabled by default but to disable
 * call disableLogging() on the instance of KBBot that you are using.
 */

import Keybase from "keybase-bot";
import {Neon} from "@element-ts/neon";

export class KBLogger {

	private static hostname: string = "keybase";
	public static logger: Neon = new Neon();
	public static bot: Keybase;

	/**
	 * Will log the message pretty printed.
	 * @param msg
	 */
	public static log(msg: string): void {

		this.logger.log(this.bot?.myInfo()?.username + "@" + this.hostname + ": " + msg, false);

	}

	public static setHostname(value: string): void {

		this.hostname = value;
		this.logger.setTitle(value);

	}

	/**
	 * Will enable logging.
	 */
	public static enable(): void {

		this.logger.enable();
		this.logger.setTitle(this.hostname);

	}

	/**
	 * Will disable logging.
	 */
	public static disable(): void { this.logger.disable(); }

}
