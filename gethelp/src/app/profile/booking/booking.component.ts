import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilesService } from '../profiles.service';
import { Action, WorkOrder } from 'src/app/models/work-order.model';
import { Tasktype } from 'src/app/models/tasktype.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/delete-dialog/delete-dialog.component';
import { RescheduleComponent } from '../reschedule/reschedule.component';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  @ViewChild('errorAlert', { static: true }) errorAlert!: ElementRef;
  workOrderId!: any;
  workorder!: WorkOrder;
  workOrderCancelled = false;
  subscription!: Subscription;
  errorMessage = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfilesService,
    private spinnerService: SpinnerService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.workOrderId = paramMap.get('workorder');
    });

    if (this.workOrderId) 
        this.fetchWorkOrder();
  }

  fetchWorkOrder() {
    this.spinnerService.setLoadingStatus(true);
    this.subscription = this.profileService
      .getWorkOrder(this.workOrderId)
      .subscribe((response: WorkOrder) => {
        if (response && response.status != 'cancelled') {
          this.workorder = response;
          this.workorder.proPhoto = this.workorder?.proPhoto
            ? this.workorder?.proPhoto
            : 'assets/image/avatar.png';
          this.getMapLocation();
        }else
            this.workOrderCancelled = true;
        this.spinnerService.setLoadingStatus(false);
      });
  }

  getMapLocation() {
    let src =
      'https://www.google.com/maps/embed/v1/place?key=AIzaSyB-2NhQ_1aczR7fRfboF64f-phiZvWecYA&q=';
    this.workorder.maplocation =
      src + this.workorder.address.replace(/\s/g, '');
  }


  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { component: 'BookingComponent', workorderId: this.workOrderId, workorder: this.workorder},
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.workOrderCancelled = true
    });
  }

  openRescheduleDialog() {
    const dialogRef = this.dialog.open(RescheduleComponent, {
      data: { workorderid: this.workOrderId, workorder: this.workorder },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.fetchWorkOrder();
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  checkCancelRescheduleWindow(action: string){
    var data = {...this.workorder};
    let currentDate = new Date();
    if(new Date(data.date).toDateString() == currentDate.toDateString()){
      let timeDiff = data.bookingTime.seconds*1000 - currentDate.getTime()
      timeDiff = timeDiff/(1000 * 60 * 60) % 24;
      if(timeDiff<3){
        this.errorMessage = true;
        setTimeout(()=>{
          this.errorMessage = false;
        }, 5000);
        return;
      }
    }
    action == Action.RESCHEDULE ?  this.openRescheduleDialog() : this.openDeleteDialog()
  }
}
