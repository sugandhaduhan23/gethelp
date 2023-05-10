import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Message, MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { Role } from 'src/app/models/profiles.model';
import { CommonService } from 'src/app/shared/common.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
  messageForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinnerService: SpinnerService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.messageForm = this.fb.group({
      workOrderId: [{ value: this.data.id, disabled: true }],
      customerName: [{ value: this.data.customerName, disabled: true }],
      proName: [{ value: this.data.proName, disabled: true }],
      customTitle: [
        '',
        [Validators.required, Validators.max(20), Validators.maxLength(20)],
      ],
      customMessage: [
        '',
        [Validators.required, Validators.max(250), Validators.maxLength(250)],
      ],
    });
  }

  sendMessage() {
    this.spinnerService.setLoadingStatus(true);
    let message: Message = { ...this.messageForm.getRawValue() };
    message.title = MessageAction.NEWMESSAGE
    const role = localStorage.getItem('role');
    if(role == Role.PRO){
      message.sentTo = [this.data.customer];
      message.message = MessageEvenDescription.NEWPROMESSAGE;
    }else{
      message.sentTo = [this.data.pro];
      message.message = MessageEvenDescription.NEWCUSTOMERMESSAGE;
    } 
    message.customerRead = false;
    message.proRead = false;
    message.createdAt = new Date();
    message.date = this.commonService.customDateFormat(new Date());
    message.workorder = this.data;
    message.reply = [];
    message.reply.push({
      message: this.messageForm.controls['customMessage'].value,
      postedBy: localStorage.getItem('role') == Role.PRO ? this.data.proName : this.data.customerName,
      postedOn: this.commonService.customDateFormat(new Date())
    })
    this.commonService.saveNotifications(message).then((response) => {
      this.spinnerService.setLoadingStatus(false);
      const res = response;
    });
  }
}
