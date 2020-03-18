import Keybase from "keybase-bot";

/**
 * This is a utility class to help with logging all interactions with the bot. It is enabled by default but to disable
 * call disableLogging() on the instance of KBBot that you are using.
 */
export class KBLogger {

	private static status: boolean = true;
	public static bot: Keybase;

	/**
	 * Will log the message pretty printed.
	 * @param msg
	 */
	public static log(msg: string): void {
		if (this.status) console.log(this.bot?.myInfo()?.username + "@keybase: " + msg);
	}

	/**
	 * Will enable logging.
	 */
	public static enable(): void { this.status = true; }

	/**
	 * Will disable logging.
	 */
	public static disable(): void { this.status = false; }

}