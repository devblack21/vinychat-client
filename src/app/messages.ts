import { Message } from "./message";

export class MessagesListResponse {
    
    public messages: Message[];

    constructor(messages:Message[]) {
        this.messages = messages;
    }
    
}
