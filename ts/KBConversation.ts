/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {ConvSummary} from "keybase-bot/lib/types/chat1";
 
export class KBConversation {

	private conversation: ConvSummary;

 	public constructor(conversation: ConvSummary) { this.conversation = conversation; }

	public getUserName(): string {

		const username: string | undefined = this.conversation.creatorInfo?.username;
		if (username === undefined) throw new Error("creator username not defined");

 		return username;

	}

	public getId(): string {

 		return this.conversation.id;

	}

}