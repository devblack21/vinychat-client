import { ElementRef, Injectable, OnInit, ViewChild, ViewChildren } from '@angular/core';
declare var SockJS;
declare var Stomp;
import {environment} from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ResponseEntity } from './retorno';
import { Message } from './message';
import { MessagesListResponse } from './messages';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnInit {

  private stompClient;
  private ticket: String = localStorage.getItem("ticket");
  private username : String = "Anonymous";
  public messages : Message[] = []

  constructor(private http: HttpClient) {}


  sendMessage(message: String) {
    let msg = new Message(this.ticket, this.username, message);
    this.stompClient.send('/app/send/message' , {}, JSON.stringify(msg));
  }

  ngOnInit(): void {
    //this.connectApi();
  }

  connectApi() {
    if (this.ticket) {
      this.initializeWebSocketConnection();
    } else {
      this.handshake();
    }
  }

  initializeWebSocketConnection() {
    if (this.ticket) {
    
        const serverUrl = environment.app_socket_url;
        const ws = new SockJS(serverUrl);
        this.stompClient = Stomp.over(ws);
        const that = this;
        this.stompClient.connect({}, function(frame) {
          that.getMessages();
          that.listener(that);
        }, errorCallback => {
          this.stompClient.unsubscribe();
          this.stompClient.disconnect();
          this.stompClient = null;
          ws.close(1000, "Work complete");
          console.log("TERMINATE: ");
          console.log("ERRO: ");
        });
  

    }
  }

  private listener(that) {

    that.stompClient.subscribe('/queue/message/'+that.ticket, (message) => {
      if (message.body) {
        
        let response = JSON.parse(message.body);
        that.messages.push(new Message(response.ticket, response.username, response.message.replaceAll("\\n","\n")));
        that.verifyHandshake(response);
      }  
     
    });
  }


  handshake() {
    
    let message: Message = {username: this.username, ticket: null, message: ""}

    this.openConnection(message).subscribe((response) => {
      if(response.ticket) {
        this.ticket = response.ticket;
        localStorage.setItem("ticket", this.ticket+"");
        this.initializeWebSocketConnection();  
        this.firstConnection();
      }
    });


  }


  openConnection(message: Message): Observable<Message> {
    const serverUrl = environment.app_rest_url;
    const headers = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          })
        }

    return this.http.post<Message>(serverUrl+'/handshake', JSON.stringify(message), headers);
  }


  verifyHandshake(message) {
    if (message.ticket) {
      if (message.ticket !== this.ticket) {
        this.ticket = message.ticket;
        this.connectApi();
      }
    }
  }

  firstConnection() {

      let message: Message = new Message(this.ticket, this.username, "");

      this.firstConnectionObservable(message).subscribe((response) => {
        
      });
      
  }

  firstConnectionObservable(message: Message): Observable<Message> {
    const serverUrl = environment.app_rest_url;
    const headers = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          })
        }

    return this.http.post<Message>(serverUrl+'/connection/first', JSON.stringify(message), headers);
  }

  getMessages() {
    this.getMessagesObservable().subscribe((response) =>{
      if(response.messages) {
        response.messages.forEach((msg:Message) => {  
          msg.message = msg.message.split("\\n").join("\n");

        });  
        this.messages = this.messages.concat(this.messages, response.messages);
      }
    });
  }

  getMessagesObservable(): Observable<MessagesListResponse> {
    const serverUrl = environment.app_rest_url;
    const headers = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          })
        }

    return this.http.get<MessagesListResponse>(serverUrl+'/backup/messages/'+this.ticket, headers);
  }

  isUser(username: String) : boolean {
    return this.username == username;
  }


}
