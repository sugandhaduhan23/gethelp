import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouteConfigLoadEnd } from '@angular/router';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { ProfilesService } from 'src/app/profile/profiles.service';
import { CommonService } from 'src/app/shared/common.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { WORKORDERSTATUS } from '../../models/work-order.model';

@Component({
  selector: 'app-workorder-price',
  templateUrl: './workorder-price.component.html',
  styleUrls: ['./workorder-price.component.scss'],
})
export class WorkorderPriceComponent {
  priceForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkorderPriceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private profileService: ProfilesService,
    private spinnerService: SpinnerService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.priceForm = this.fb.group({
      price: [this.data.price, Validators.required],
    });
  }

  updateWorkOrderPrice() {
    this.spinnerService.setLoadingStatus(true);
    const totalTime = this.calculateTotalTimeTaken();
    this.profileService
      .changeWorkOrderStatus(
        this.data.workorder.id,
        WORKORDERSTATUS.COMPLETE,
        this.priceForm.controls['price'].value,
        this.data.startTime,
        totalTime + ' Hrs'
      )
      .then(() => {
        this.commonService.sendMessage(MessageAction.COMPLETE,[this.data.workorder.customer], MessageEvenDescription.COMPLETE, this.data.workorder);
        this.spinnerService.setLoadingStatus(false);
      });
  }

  calculateTotalTimeTaken() {
    const currentTime = new Date().getTime()
    let timeDiff = currentTime - this.data.startTime;
    return (timeDiff/(1000 * 60 * 60) % 24).toFixed(2);
  }
}
