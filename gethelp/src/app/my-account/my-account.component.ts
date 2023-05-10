import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ViewChild } from '@angular/core'; 
import {
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { linkWithCredential, User } from 'firebase/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { Review } from '../models/reviews.model';
import { ProfilesService } from '../profile/profiles.service';
import { AppState } from '../store/state/app.state';
import { CommonService } from '../shared/common.service';
import { Category } from '../models/categories.model';
import { WorkOrder, WORKORDERSTATUS } from '../models/work-order.model';
import { Profile, Role } from '../models/profiles.model';
import { ProfileImageModalComponent } from './profile-image-modal/profile-image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SpinnerService } from '../spinner/spinner.service';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as duration from 'dayjs/plugin/duration';
import * as dayjs from 'dayjs';

dayjs.extend(isSameOrAfter);
dayjs.extend(duration)

type UserInfo = { 
  uid: string;
  profilePhoto: string | null;
  phoneNumber: string;
  displayName: string;
  [key: string]: any,
} & User & Profile;

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {
  profileImage = '/assets/image/avatar.png';
  userRole: Role = Role.CUSTOMER;
  @ViewChild('baseAccountForm', { static: false }) baseAccountForm!: NgForm;
  @ViewChild('billingAccountForm', { static: false }) billingAccountForm!: NgForm;
  @ViewChild('serviceInfoAccountForm', { static: false }) serviceInfoAccountForm!: NgForm;
  categories: Category[] = [];
  isProfessionalProfile: boolean = false;
  CountryISO = CountryISO;
  userInfo: UserInfo = {
    uid: '',
    profilePhoto: '',
    phoneNumber: '',
    displayName: '',
  } as UserInfo;
  PhoneNumberFormat = PhoneNumberFormat;

  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.India,
  ];
  selectedPhotos = [] as any[];
  files: any[] = [];
  urls: any[] = [];
  page = 1;
  pageSize = 2;

  testProfiles = {
    pro: 'Bjx9PCGy2Bbb4eG3UweJ',
    customer: 'iuFcASqrhAdT7ACPNjIGdLrElBN2'
  }

  taskHistory = {
    cancelled: [] as WorkOrder[],
    completed: [] as WorkOrder[],
    created: [] as WorkOrder[],
    inProgress: [] as WorkOrder[],
  };

  isProfessional = () => this.userInfo.role === Role.PRO;

  myAccountForm = this.formBuilder.group({
    email: ['', Validators.required],
    name: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    profilePhoto: ['', Validators.required],
  });

  myAccountBillingForm = this.formBuilder.group({
    selectedPayments: [[''], Validators.required]
  });

  myAccountServiceInfoForm = this.formBuilder.group({
    about: ['', this.isProfessional() && Validators.required],
    bio: ['', this.isProfessional() && Validators.required],
    employees: [1, Validators.required],
    serviceCost: [0, Validators.required],
    servingLocations: ['', this.isProfessional() && Validators.required],
    selectedCategories: [ [] as string[], Validators.required],
    socialFB: [ ''],
    socialInsta: [ ''],
    yearsinbusiness: [1, Validators.required],
  });

  paymentMethods = [
    {
      checked: false,
      icon: '',
      id: 'venmo',
      name: 'Venmo',
    },
    {
      checked: false,
      icon: '',
      id: 'cash',
      name: 'Cash',
    },
    {
      icon: '',
      id: 'zelle',
      checked: false,
      name: 'Zelle',
    },
    {
      checked: false,
      icon: '',
      name: 'Check',
      id: 'check',
    }
  ];

  socialConfig = {
    fb: {
      icon: '',
      id: 'facebook',
      name: 'Facebook',
      link: '',
    },
    insta: {
      icon: '',
      id: 'instagram',
      checked: false,
      name: 'Instagram',
      link: '',
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private profileService: ProfilesService,
    private commonService: CommonService,
    public dialog: MatDialog,
    private storage: AngularFireStorage,
    private spinnerService: SpinnerService
  ) {}

  firstName: string = '';
  lastName: string = '';
  panelOpenState = false;
  config = {
    profileWidth: 30,
    profileHeight: 30,
  };

  counterConfig = {
    enableScrollSpy: false,
    duration: 10,
  };

  billingSummary = {
    billingInPastWeek: 0,
    billingInPastMonth: 0,
    billingInPastYear: 0,
    lifeTime: 0,
  };

  reviews: Review[] | [] = [];

  ngOnInit(): void {
    this.fetchCategories();
    this.getUserInfo();
  }

  showLoading(loading = true) {
    this.spinnerService.setLoadingStatus(loading);
  }

  populateForm() {
    this.myAccountForm.setValue({
      email: this.userInfo.email,
      name: this.userInfo.name || this.userInfo.displayName,
      phoneNumber: this.userInfo.phoneNumber || '',
      profilePhoto: this.userInfo.profilePhoto || '',
      
    });

    const savedPaymentMethods = this.userInfo.paymentMethod?.map(method => method.trim().toLowerCase() || '') || [];
    this.myAccountBillingForm.setValue({
      selectedPayments: [...savedPaymentMethods]
    })

    this.userInfo.role === Role.PRO && this.myAccountServiceInfoForm.setValue({
      employees: this.userInfo.employees || 1,
      servingLocations: this.userInfo.servingLocations?.join(',') || '',
      bio: this.userInfo.bio || '',
      about: this.userInfo.about || '',
      serviceCost: this.userInfo.serviceCost || 0.00,
      selectedCategories: this.userInfo.categories?.map(cat => cat.toString()) || null,
      socialFB: this.userInfo.social?.find(option => option.id === this.socialConfig.fb.id)?.link || '',
      socialInsta: this.userInfo.social?.find(option => option.id === this.socialConfig.insta.id)?.link || '',
      yearsinbusiness: this.userInfo.yearsinbusiness || 1,
    });

    this.selectedPhotos = this.userInfo.featuredPhoto?.map(photo => photo.path) || [];
  }

  onProfileExpand() {
    this.config.profileWidth *= 4;
    this.config.profileHeight *= 4;
  }

  onProfileCollapse() {
    this.config.profileWidth /= 4;
    this.config.profileHeight /= 4;
  }

  fetchCategories() {
    this.commonService.fetchCategories().subscribe((categories: Category[]) => {
      this.categories = [...categories];
    });
  }

  getUserAccountDetails (uid: string) {
    this.showLoading();
    this.commonService.getProfiles(uid).subscribe((accountInfo) => {
      if (!accountInfo) return;
      this.userInfo = {
        ...this.userInfo,
        ...accountInfo,
        profilePhoto: accountInfo.profilePhoto,
      };
      this.isProfessionalProfile = this.userInfo.role === Role.PRO;
      this.getWorkOrders();
      this.fetchReviews();
      this.populateForm();
      this.showLoading(false);
    });
  }

  getUserInfo() {
    this.store
      .select((state) => state.user)
      .subscribe((response: User | null) => {
         this.userInfo = Object.assign({}, {
          ...this.userInfo,
          uid: response?.uid || '',
          // uid: 'ifhZbtlJYOfhGXph1AaYLV2sge63',
          displayName: response?.displayName || '',
          profilePhoto: response?.photoURL || '',
        });

        if (!this.userInfo?.uid) {
          return;
        }

        this.getUserAccountDetails(this.userInfo.uid);
      });
  }

  get formField() {
    return this.myAccountForm.controls;
  }

  saveProfileInfo () {
    const { name, profilePhoto, phoneNumber } = this.myAccountForm.value;
    this.updateUserRecords({
      name,
      profilePhoto,
      phoneNumber,
    });
  }

  updateUserRecords (dataToUpdate: Record<string, any>) {
    this.showLoading();
    this.profileService.updateProfilebyId({
      uid: this.userInfo.uid, 
      dataToUpdate,
    }).then(()=>{
      this.showLoading(false);
    });
  }

  onImageLoadFailure (event: any) {
    event.target.src = this.profileImage;
    event.onerror = null; 
  }

  paymentOptionChange(e: any) {
  }

  openImageUploadModal () {
    const dialogRef = this.dialog.open(ProfileImageModalComponent, {
      data: {
        path: this.userInfo.profilePhoto,
        id: this.userInfo.uid,
      },
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return
      }
      const userData = {
        name: this.myAccountForm.value.name,
        phoneNumber: this.myAccountForm.value.phoneNumber || '',
        profilePhoto: result,
      };

      this.userInfo.profilePhoto = result;
      this.updateUserRecords(userData);
    });
  }

  getWorkOrders () {
    this.profileService.getAllWorkOrders(this.userInfo.uid, this.userInfo.role).subscribe((workOrders: WorkOrder[])=>{
      const todaysTime = dayjs();
      const completedWorkOrders = workOrders.filter(workOrder => workOrder.status === WORKORDERSTATUS.COMPLETE);

      const workOrdersInPastWeek = completedWorkOrders?.filter(workOrder => dayjs(workOrder.date).diff(todaysTime, 'week') <= 7);
      const workOrdersInPastMonth = completedWorkOrders?.filter(workOrder => dayjs(workOrder.date).diff(todaysTime, 'month') <= 1);
      const workOrdersInPastYear = completedWorkOrders?.filter(workOrder => dayjs(workOrder.date).diff(todaysTime, 'year') <= 1);

      const calculateTotalCostPerWorkOrder = (sum: number, workOrder: WorkOrder) => sum + (workOrder.price * parseInt(workOrder.taskType || '1'));

      const billingInPastWeek = parseFloat( workOrdersInPastWeek.reduce(calculateTotalCostPerWorkOrder, 0).toFixed(2) );
      const billingInPastMonth = parseFloat(workOrdersInPastMonth.reduce(calculateTotalCostPerWorkOrder, 0).toFixed(2) );
      const billingInPastYear = parseFloat( workOrdersInPastYear.reduce(calculateTotalCostPerWorkOrder, 0).toFixed(2) );
      const lifeTime = parseFloat( completedWorkOrders?.reduce(calculateTotalCostPerWorkOrder, 0).toFixed(2) );
    
      this.billingSummary = {
        billingInPastWeek,
        billingInPastMonth,
        billingInPastYear,
        lifeTime,
      };

      workOrders?.map(workOrder => {
        if (workOrder.status === WORKORDERSTATUS.COMPLETE) {
          this.taskHistory.completed.push(workOrder);
        }

        else if (workOrder.status === WORKORDERSTATUS.CANCELLED) {
          this.taskHistory.cancelled.push(workOrder);
        }

        else if (workOrder.status === WORKORDERSTATUS.INPROGRESS) {
          this.taskHistory.inProgress.push(workOrder);
        }

        else {
          this.taskHistory.created.push(workOrder);
        }
      });
    });
  }

  fetchReviews() {
    this.profileService.getReviews(this.userInfo.role, this.userInfo.uid).subscribe((response: any) => {
      if (!response) {
        return;
      }
      this.reviews = response;
    });
  }

  saveBillingInfo () {
    const selectedBilling = [...this.myAccountBillingForm.get('selectedPayments')?.value || []];
    const paymentMethod = selectedBilling?.map(billingKey => this.paymentMethods.find(method => method.id === billingKey)?.name);
    
    this.updateUserRecords({ paymentMethod });
  }

  async saveServiceInfo () {
    const {
      about,
      bio,
      employees,
      selectedCategories: categories,
      servingLocations = '',
      serviceCost,
      socialFB,
      socialInsta,
      yearsinbusiness
    } = this.myAccountServiceInfoForm.value;
    let featuredPhoto: Record<string, any>[] = this.userInfo.featuredPhoto || [];
    if (this.files.length) {
      await this.uploadPhotosToFirebase();
      featuredPhoto = this.urls.map(url => ({ path: url }));
    }

    const data = {
      about,
      bio,
      categories: categories?.map(cat => parseInt(cat)),
      employees,
      featuredPhoto,
      servingLocations: servingLocations ? servingLocations?.split(',') : [],
      serviceCost,
    };
    
    this.updateUserRecords({
      about,
      bio,
      categories: categories?.map(cat => parseInt(cat)),
      employees,
      featuredPhoto,
      servingLocations: servingLocations ? servingLocations?.split(',') : [],
      serviceCost,
      social: [
        {
          ...this.socialConfig.fb,
          link: socialFB,
        },
        {
          ...this.socialConfig.insta,
          link: socialInsta,
        }
      ],
      yearsinbusiness,
    });
  }

  socialPrefChange (e: any) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.files.push({ filePath: file.name, file: file });

    reader.onload = (readerEvent) => {
      const base64String = readerEvent.target!.result;
      this.selectedPhotos.push(base64String);
    };

    reader.readAsDataURL(file);
  }

  async uploadPhotosToFirebase() {
    this.showLoading();
    for (const file of this.files) {
      const filePath = `images/profiles/${this.userInfo.uid}/${file.filePath}`;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file.file);

      const url = await task.then((snapshot) => {
        return snapshot.ref.getDownloadURL();
      });

      this.urls.push(url);
    }
  }
}
