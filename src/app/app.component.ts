import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {MessageService} from './message.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'websocket-frontend';
  input;

  @ViewChild('scroll', { static: true })
  scroll: ElementRef

  constructor(private messageService: MessageService) {
    messageService.connectApi();
  }

  ngOnInit(): void {
    //this.connect();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
    
    this.scrollEnd();
  }


  private sendMessage() {
    if (this.input) {
      this.messageService.sendMessage(this.input);
      this.input = '';
    }
  }

  private connect() {
    this.messageService.connectApi();
  }


  
  public getUser(username) {
    if(this.messageService.isUser(username)) {
      return "eu"
    }
    else{
      return username;
    }
  }

  public getSRC(username): String {
    let manager = "https://cdn-icons-png.flaticon.com/512/345/345636.png";
    let bot = "https://cdn-icons-png.flaticon.com/512/426/426196.png";
    let support = "https://cdn-icons-png.flaticon.com/256/1033/1033818.png";
    let client = "https://img.icons8.com/color/40/000000/guest-female.png";

    switch (username.toUpperCase()) {
      case "support".toUpperCase():
        return support;
      break;
      case "support master".toUpperCase():
        return manager;
      break;
      case "bot".toUpperCase():
        return bot;
      break;
      default: 
          return client;
   }

  }

  private scrollEnd() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }
}
