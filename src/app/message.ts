export class Message {
    
    public ticket: String;
    public username : String;
    public message: String;

    constructor(ticket:String, username: String, message: String) {
        this.ticket = ticket;
        this.username = username;
        this.message = message;
    }
    
}
