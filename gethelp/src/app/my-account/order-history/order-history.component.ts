import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteDialogComponent } from 'src/app/delete-dialog/delete-dialog.component';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { Role } from 'src/app/models/profiles.model';
import { Action, WorkOrder, WORKORDERSTATUS } from '../../models/work-order.model';
import { ProfilesService } from 'src/app/profile/profiles.service';
import { RescheduleComponent } from 'src/app/profile/reschedule/reschedule.component';
import { CommonService } from 'src/app/shared/common.service';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { WorkorderPriceComponent } from '../workorder-price/workorder-price.component';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})


export class OrderHistoryComponent {
  @ViewChild('msg', { static: true }) msg!: ElementRef;
  role!: string;
  workOrderList!: WorkOrder[];
  errorMessage!: string;
  successMessage!: string;
  
  constructor(private profileService: ProfilesService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              private commonService: CommonService){}

  ngOnInit(){
      this.role = localStorage.getItem('role')!;
      this.fetchWorkOrders();
  }

  fetchWorkOrders(){
    this.profileService.getAllWorkOrders(localStorage.getItem('userid')!, this.role).subscribe((response: WorkOrder[])=>{
      this.workOrderList = response;
    })
  }

  openDeleteDialog(workorder: WorkOrder) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { component: 'BookingComponent', workorderId: workorder.id, workorder: workorder},
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchWorkOrders();
    });
  }

  openRescheduleDialog(workorder: WorkOrder) {
    const dialogRef = this.dialog.open(RescheduleComponent, {
      data: {workorderid: workorder.id, workorder: workorder },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchWorkOrders();
    });
  }

  //3 hours window
  checkCancelRescheduleWindow(workorder: any, action: string){
      var data = {...workorder};
      let currentDate = new Date();
      if(new Date(data.date).toDateString() == currentDate.toDateString()){
        let timeDiff = data.bookingTime.seconds*1000 - currentDate.getTime()
        timeDiff = timeDiff/(1000 * 60 * 60) % 24;
        if(timeDiff<3){
          workorder.display = true
          this.errorMessage = "Reschedule/Cancel allowed 3 hours before the service";
          setTimeout(()=>{
            workorder.display = false;
            this.errorMessage = ''
          }, 5000);
          return;
        }
      }
      action == Action.RESCHEDULE ?  this.openRescheduleDialog(workorder) : this.openDeleteDialog(workorder)
  }

  changestatus(workorder: WorkOrder, status: string){
    let startTime = new Date().getTime();
    this.profileService.changeWorkOrderStatus(workorder.id, status, '', startTime).then((response)=>{
        this.fetchWorkOrders();
        this.commonService.sendMessage(MessageAction.STARTED,[workorder.customer], MessageEvenDescription.STARTED, workorder);
    })
  }

  openAddReviewComponent(workorder: WorkOrder) {
    this.router.navigate(['../review', workorder.id], {relativeTo: this.activatedRoute})
  }

  openPriceUpdateDialog(workorder: WorkOrder) {
    const dialogRef = this.dialog.open(WorkorderPriceComponent, {
      data: { workorder: workorder, price: workorder.price, startTime: workorder.startTime},
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.fetchWorkOrders()
    });
  }

  openMessageDialog(workorder: any) {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '50vw',
      data: workorder,
    });

    dialogRef.afterClosed().subscribe((result) => {
      const role = localStorage.getItem('role') == Role.PRO ? 'Customer' : 'Pro';
      workorder.display = true
          this.successMessage = 'The ' + role + ' had been notified!' ;
          setTimeout(()=>{
            workorder.display = false;
            this.successMessage = ''
          }, 5000);
    });
  }

  checkIfProCanStart(workorder: any){
    var data = {...workorder};
    let currentDate = new Date();
    if(new Date(data.date).toDateString() == currentDate.toDateString()){
      let timeDiff = data.bookingTime.seconds*1000 - currentDate.getTime()
      timeDiff = timeDiff/(1000 * 60 * 60) % 24;
      if(timeDiff>1){
        workorder.display = true;
        this.errorMessage = "You can start only 1 hour before your scheduled time.";
        setTimeout(()=>{
          workorder.display = false;
          this.errorMessage = '';
        }, 5000);
        return;
      }else{
        this.changestatus(workorder, WORKORDERSTATUS.INPROGRESS)
      }
    }else{
      workorder.display = true;
        this.errorMessage = "You can't start on a different date";
        setTimeout(()=>{
          workorder.display = false;
          this.errorMessage = '';
        }, 5000);
        return;
    }
  }

  navigateToProfile(workorder: WorkOrder){
    this.router.navigate(['profile/detail', workorder.category, workorder.pro])
  }   
}


