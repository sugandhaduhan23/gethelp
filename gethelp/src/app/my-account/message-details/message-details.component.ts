import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Message, MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { Role } from 'src/app/models/profiles.model';
import { CommonService } from 'src/app/shared/common.service';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.scss']
})
export class MessageDetailsComponent {
  role!: string;
  messageId !: string;
  message !: Message;
  messageAction = MessageAction;
  replyForm !: FormGroup
  showReplyBox = false;


  constructor(private activatedRoute : ActivatedRoute,
              private commonService: CommonService,
              private fb: FormBuilder){
  }

  ngOnInit(){
    this.role = localStorage.getItem('role')!;
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.messageId = paramMap.get('id')!;
      this.getNotification();
    });
    this.replyForm = this.fb.group({
      message: ['']
    })
  }

  getNotification(){
    this.commonService.getNotificationsById(this.messageId).subscribe((response: Message)=>{
        this.message = response;
    })
  }

  sendReply(){
    this.showReplyBox = false;
    const data = {
      message: this.replyForm.controls['message'].value,
      postedBy: localStorage.getItem('role') == Role.PRO ? this.message.workorder.proName : this.message.workorder.customerName,
      postedOn: this.commonService.customDateFormat(new Date())
    }
    this.commonService.sendReply(this.messageId, [this.message.workorder.pro, this.message.workorder.customer],  data).then(()=>{
      this.getNotification();
      this.replyForm.reset();
    })
  }
  
}
