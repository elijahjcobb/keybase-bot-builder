import Keybase from "keybase-bot";

export class KBLogger {

	private static status: boolean = true;
	public static bot: Keybase;

	public static log(msg: string): void {
		if (this.status) console.log(this.bot?.myInfo()?.username + "@keybase: " + msg);
	}

	public static enable(): void { this.status = true; }

	public static disable(): void { this.status = false; }

}