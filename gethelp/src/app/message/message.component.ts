import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../models/message.model';
import { CommonService } from '../shared/common.service';
import { MessageAction } from '../models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Output() clicked = new EventEmitter<void>();
  messageAction = MessageAction;
  messages!: Message[];
  unread!: number;
  role!: string;

  constructor(private commonService: CommonService,
              private router: Router) {}

  ngOnInit() {
    this.getNotifications();
    this.getUnreadMessages();
    this.role = localStorage.getItem('role')!;
  }

  getNotifications() {
    this.commonService.getNotifications().subscribe((response: Message[]) => {
      this.messages = response;
    });
  }

  getUnreadMessages() {
    this.commonService.unreadMessage.subscribe((unread: number) => {
      this.unread = unread;
    });
  }

  markread(messageId: string) {
    this.commonService.markRead(messageId).then((response) => {
      let res = response;
    });
  }

  markAllRead() {
    this.commonService.markAllRead();
  }

  navigateToMessageDetails(messageId: string) {
      this.clicked.emit();
      this.markread(messageId);
      this.router.navigate(['my-account/notifications', messageId]);
  }

  navigateToProfile(messageId: string){
    this.clicked.emit();
    this.markread(messageId);
    this.router.navigate(['my-account']);
  }
}

