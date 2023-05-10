import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { Profile } from 'src/app/models/profiles.model';
import { WorkOrder } from 'src/app/models/work-order.model';
import { ProfilesService } from 'src/app/profile/profiles.service';
import { CommonService } from 'src/app/shared/common.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { ReviewService } from './review.service';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.scss'],
})
export class AddReviewComponent {
  @ViewChild('successAlert', { static: true }) successAlert!: ElementRef;
  @ViewChild('rf') rf!: NgForm;
  reviewForm!: FormGroup;
  workOrderId!: string;
  workorder!: WorkOrder;
  customer!: Profile;
  successMessage!: string;
  submitted = false;
  selectedPhotos: any[] = [];
  files: any[] = [];
  urls: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfilesService,
    private reviewService: ReviewService,
    private spinnerService: SpinnerService,
    private commonService: CommonService,
    private storage: AngularFireStorage,
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.workOrderId = paramMap.get('workorder')!;
    });

    this.reviewForm = this.fb.group({
      pro: [''],
      customer: [''],
      heading: ['', Validators.required],
      content: ['', Validators.required],
      postedBy: [''],
      profilePhoto: [''],
      proName: [],
      proPhoto: [''],
      displayName: ['', Validators.required],
      rating: ['', Validators.required],
      postedOn: [this.commonService.customDateFormat(new Date())],
    });

    this.fetchWorkOrder();
  }

  get f() {
    return this.reviewForm.controls;
  }

  fetchWorkOrder() {
    this.spinnerService.setLoadingStatus(true);
    this.profileService
      .getWorkOrder(this.workOrderId)
      .subscribe((response: WorkOrder) => {
        this.workorder = response;
        this.workorder.id = this.workOrderId;
        this.workorder.proPhoto = this.workorder?.proPhoto
          ? this.workorder?.proPhoto
          : 'assets/image/avatar.png';
        this.fetchCustomerDetails();
      });
  }

  fetchCustomerDetails() {
    this.commonService
      .getProfiles(this.workorder.customer)
      .subscribe((response: Profile) => {
        this.customer = response;
        this.customer.profilePhoto = this.customer?.profilePhoto
          ? this.customer.profilePhoto
          : 'assets/image/avatar.png';
        this.updateFormDetails();
        this.spinnerService.setLoadingStatus(false);
      });
  }

  updateFormDetails() {
    this.reviewForm.patchValue({
      pro: this.workorder.pro,
      customer: this.workorder.customer,
      profilePhoto: this.customer.profilePhoto,
      proName: this.workorder.proName,
      proPhoto: this.workorder.proPhoto,
      postedBy: this.customer.name,
      displayName: this.customer.name,
    });
  }

  async addReview() {
    this.spinnerService.setLoadingStatus(true);
    let data = { ...this.reviewForm.value };
    if (this.files.length) {
      await this.uploadPhotosToFirebase();
      data.photos = [...this.urls];
    }

    this.reviewService.addReview(data).then(() => {
      this.spinnerService.setLoadingStatus(false);
      this.reviewForm.reset();
      this.rf.resetForm();
      this.selectedPhotos = [];
      this.submitted = true;
      this.commonService.sendMessage(MessageAction.REVIEW,[this.workorder.pro], MessageEvenDescription.REVIEW, this.workorder);
      this.successMessage = 'Your feedback has been submitted. Thank you!';
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    });
  }

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
    for (const file of this.files) {
      const filePath = `reviews/${this.workorder.pro}/${file.filePath}`;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file.file);

      const url = await task.then((snapshot) => {
        return snapshot.ref.getDownloadURL();
      });

      this.urls.push(url);
    }
  }

  navigateToProfile(){
      this.router.navigate(['profile/detail', this.workorder.category, this.workorder.pro])
  }
}
