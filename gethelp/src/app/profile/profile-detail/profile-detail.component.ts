import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile, Role } from 'src/app/models/profiles.model';
import { Review } from 'src/app/models/reviews.model';
import { Tasktype } from 'src/app/models/tasktype.model';
import { ProfilesService } from '../profiles.service';
import { DocumentReference } from '@angular/fire/firestore';
import { WorkOrder } from 'src/app/models/work-order.model';
import { WorkOrderAppState } from 'src/app/store/state/app.state';
import { Store } from '@ngrx/store';
import { CommonService } from 'src/app/shared/common.service';
import { Category } from 'src/app/models/categories.model';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';


@Component({
  selector: 'profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss'],
})
export class ProfileDetailComponent implements OnInit {
  profile!: Profile;
  customer!: Profile;
  page = 1;
  pageSize = 2;
  bookingForm!: FormGroup;
  category!: string;
  categoryName!: string;
  tasktype!: Tasktype[];
  profileId!: any;
  reviews!: Review[];
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<WorkOrderAppState>,
    private profileService: ProfilesService,
    private commonService: CommonService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    this.bookingForm = this.fb.group({
      taskType: ['', Validators.required],
      bookingDate: ['', Validators.required],
      bookingTime: ['', Validators.required],
      address: ['', Validators.required],
      additionalDetails: ['']
    });

    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.profileId = paramMap.get('id');
      this.category = paramMap.get('category')!;
    });

    this.fetchProfileDetails();
    this.fetchTaskType();
    this.fetchCategory();
    this.fetchReviews();
    this.fetchCustomerDetails();
  }

  get f() {
    return this.bookingForm.controls;
  }

  fetchProfileDetails() {
    this.spinnerService.setLoadingStatus(true);
    this.commonService
      .getProfiles(this.profileId)
      .subscribe((response: Profile) => {
        this.profile = response;
        if (!response.profilePhoto)
          this.profile.profilePhoto = 'assets/image/avatar.png';
        this.spinnerService.setLoadingStatus(false);
      });
  }

  fetchCustomerDetails() {
    let customerUserId = localStorage.getItem('userid');
    if(customerUserId){
      this.commonService
      .getProfiles(customerUserId)
      .subscribe((response: Profile) => {
        this.customer = response;
        if (!response.profilePhoto)
          this.customer.profilePhoto = 'assets/image/avatar.png';
      });
    }
  }

  fetchTaskType() {
    this.profileService.getTaskType().subscribe((response: Tasktype[]) => {
      this.tasktype = response;
    });
  }

  fetchCategory() {
    this.commonService.fetchCategories().subscribe((response: Category[]) => {
      let category = response.find((element: Category) => {
        return (element.id = this.category);
      });
      this.categoryName = category!.name;
    });
  }

  fetchReviews() {
    this.profileService.getReviews(Role.PRO, this.profileId).subscribe((response: any) => {
      if (response) 
        this.reviews = response;
    });
  }

  hireProfessional() {
    this.spinnerService.setLoadingStatus(true);
    let data: WorkOrder = {...this.bookingForm.value};
    data.proPhoto = this.profile.profilePhoto;
    data.proName = this.profile.name;
    data.category = this.category;
    data.categoryName = this.categoryName
    data.date = this.commonService.customDateFormat(data.bookingDate);
    data.tasktypeName = (this.tasktype.find((element: Tasktype) => (element.id = data.taskType)))!.name;
    data.status = 'created';
    data.time = data.bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    data.proEmail = this.profile.email!;
    data.price = this.profile.serviceCost;
    data.customer = localStorage.getItem('userid') || '';
    data.pro = this.profileId;
    if(this.customer){
      data.customerName = this.customer.name;
      data.customerEmail = this.customer.email;
      data.customerPhoto = this.customer.profilePhoto;
      this.commonService
      .bookService(data)
      .then(async (response: DocumentReference) => {
        this.updateHiredDetails(response.id)
        data.id = response.id;
        this.commonService.sendBookingConfirmation(data, this.customer);
        this.spinnerService.setLoadingStatus(false);
        this.commonService.sendMessage(MessageAction.CREATED,[data.customer, data.pro], MessageEvenDescription.CREATED, data);
        this.router.navigate(['../../../booking', response.id], {
          relativeTo: this.activatedRoute,
        });
      });
    }else{
      this.spinnerService.setLoadingStatus(false);
      this.router.navigate(['/auth'])
      this.createWorkOrderState(data);
    }
  }

  mapTaskType(tt: any) {
    return this.tasktype.find((element: Tasktype) => {
      return (element.id = tt);
    });
  }

  updateHiredDetails(workOrderId: string){
    this.profileService.updateHireDetails(this.profileId, workOrderId).then(response=>{
        let res = response;
    })
  }

  createWorkOrderState(data: WorkOrder) {
    this.store.dispatch({
      type: 'CREATE_WORKORDER',
      payload: data
    });
  }
}
