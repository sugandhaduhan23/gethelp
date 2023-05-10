import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { CommonService } from 'src/app/shared/common.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { ProfilesService } from '../profiles.service';

@Component({
  selector: 'app-reschedule',
  templateUrl: './reschedule.component.html',
  styleUrls: ['./reschedule.component.scss'],
})
export class RescheduleComponent {
  bookingForm!: FormGroup;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RescheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private profileService: ProfilesService,
    private spinnerService: SpinnerService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.bookingForm = this.fb.group({
      bookingDate: [new Date(this.data.workorder.bookingDate.seconds * 1000), Validators.required],
      bookingTime: [new Date(this.data.workorder.bookingTime.seconds * 1000), Validators.required],
      address: [this.data.workorder.address, Validators.required],
      additionalDetails: [this.data.workorder.additionalDetails],
    });
  }

  get f() {
    return this.bookingForm.controls;
  }

  rescheduleService() {
    this.spinnerService.setLoadingStatus(true);
    
    const messageData = {
      oldDate: this.data.workorder.date,
      oldTime: this.data.workorder.time,
      oldLocation: this.data.workorder.address,
    }
    
    let data = {...this.bookingForm.value}
    data.date = this.commonService.customDateFormat(data.bookingDate);
    data.time = data.bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.data.workorder.bookingDate= data.bookingDate;
    this.data.workorder.bookingTime =data.bookingTime;
    this.data.workorder.date = data.date;
    this.data.workorder.time = data.time;
    this.data.workorder.address = data.address;
    this.data.workorder.additionalDetails = data?.additionalDetail || '';
    
    this.profileService
      .rescheduleBooking(this.data.workorderid, data)
      .then(() => {
        this.spinnerService.setLoadingStatus(false);
        this.dialogRef.close();
        this.commonService.sendMessage(MessageAction.RESCHEDULED,[this.data.workorder.customer, this.data.workorder.pro], MessageEvenDescription.RESCHEDULED, this.data.workorder, messageData);
      });
  }
}
