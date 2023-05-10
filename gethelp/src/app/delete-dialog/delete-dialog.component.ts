import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageAction, MessageEvenDescription } from '../models/message.model';
import { ProfilesService } from '../profile/profiles.service';
import { CommonService } from '../shared/common.service';
import { SpinnerService } from '../spinner/spinner.service';


@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
    title !: string;
    message !: string;
    action : any;

    constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private profileService : ProfilesService,
                private spinnerService: SpinnerService,
                private commonService: CommonService){}


    ngOnInit(){
      switch(this.data.component){
        case 'BookingComponent':
              this.title = 'Cancel Booking';
              this.message = 'Are you sure you want to cancel the service?';
              this.action = this.cancelBooking;
              break
      }
    }

    cancelBooking(){
      this.spinnerService.setLoadingStatus(true);
        this.profileService.cancelBooking(this.data.workorderId).then(response=>{
          this.commonService.sendMessage(MessageAction.CANCELLED,[this.data.workorder.customer, this.data.workorder.pro], MessageEvenDescription.CANCELLED, this.data.workorder);
            this.updateHiredDetailsOnDelete();
            this.dialogRef.close();
        })
    }


  updateHiredDetailsOnDelete(){
    this.profileService.updateHireDetailsonDelete(this.data.workorder.pro, this.data.workorderId).then(()=>{
      this.spinnerService.setLoadingStatus(false);
    })
  }

}
