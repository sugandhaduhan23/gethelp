import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MessageAction, MessageEvenDescription } from '../models/message.model';
import { Profile } from '../models/profiles.model';
import { WorkOrder } from '../models/work-order.model';
import { ProfilesService } from '../profile/profiles.service';
import { CommonService } from '../shared/common.service';
import { SpinnerService } from '../spinner/spinner.service';
import { WorkOrderAppState } from '../store/state/app.state';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  @ViewChild('f', { static: false }) form!: NgForm;
  @ViewChild('resetForm', { static: false }) resetForm!: NgForm;
  @ViewChild('front', { static: false }) front!: ElementRef;
  @ViewChild('back', { static: false }) back!: ElementRef;
  @ViewChild('card', { static: false }) card!: ElementRef;
  workOrder!: WorkOrder;
  successMessage = '';
  errorMessage = '';
  role!: string;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private store: Store<WorkOrderAppState>,
    private commonService : CommonService,
  ) {
    this.store
      .select((state) => state.workorder)
      .subscribe((response) => {
        this.workOrder = Object.assign({}, response);
      });
  }

  ngOnInit(): void {
  }

  get f() {
    return this.form.controls;
  }

  async signInWithEmail() {
    try {
      let userCredential = await this.authService.signInWithEmail(this.f);
      let user = await userCredential.user!;
      let userDetails = await this.commonService.getUserdetails(user.uid)
      this.storeUserDetailsOnUI(user, userDetails)
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  async signInWithGoogle() {
    try {
      let credential = await this.authService.signUpWithGoogle();
      let user = await credential.user!;
      let userDetails = await this.commonService.getUserdetails(user.uid)
      this.storeUserDetailsOnUI(user, userDetails)
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  async signInWithFacebook() {
    try {
      let credential = await this.authService.signUpWithFacebook();
      let user = await credential.user!;
      let userDetails = await this.commonService.getUserdetails(user.uid)
      this.storeUserDetailsOnUI(user, userDetails)
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  storeUserDetailsOnUI(user: any, userDetails: any){
    localStorage.setItem('userid', user.uid);
    localStorage.setItem('role', userDetails.role);
    if (Object.keys(this.workOrder).length!=0) {
      this.checkIfUserNavigatedFromProfiles(user.uid, userDetails)
    }else{
      this.router.navigate(['/']);
    }
  }

  checkIfUserNavigatedFromProfiles(userId: string, userDetails: Profile){
    this.workOrder.customer = userId;
    this.workOrder.customerName = userDetails.name;
    this.workOrder.customerEmail = userDetails.email;
    this.workOrder.customerPhoto = userDetails.profilePhoto;
    this.commonService
    .bookService(this.workOrder)
    .then(async (response: DocumentReference) => {
      this.router.navigate(['/profile/booking', response.id]);
      this.commonService.sendBookingConfirmation(this.workOrder, userDetails)
      this.workOrder.id = response.id;
      this.commonService.sendMessage(MessageAction.CREATED,[ this.workOrder.customer,  this.workOrder.pro], MessageEvenDescription.CREATED, this.workOrder);
      this.updateWorkOrderState();
    });
  }

  updateWorkOrderState() {
    this.store.dispatch({
      type: 'CREATE_WORKORDER',
      payload: {}
    });
  }

  flipAnimation() {
    this.successMessage = '';
    this.errorMessage = '';
    const frontFlipped = this.front.nativeElement.classList.contains('flipped');
    this.renderer[frontFlipped ? 'removeClass' : 'addClass'](
      this.front.nativeElement,
      'flipped'
    );
    const backFlipped = this.back.nativeElement.classList.contains('flipped');
    this.renderer[backFlipped ? 'removeClass' : 'addClass'](
      this.back.nativeElement,
      'flipped'
    );
    this.renderer[backFlipped ? 'removeClass' : 'addClass'](
      this.card.nativeElement,
      'backHeight'
    );
  }

  async resetPassword() {
    try {
      await this.afAuth.sendPasswordResetEmail(
        this.resetForm.controls['email'].value
      );
      this.successMessage = 'Password reset email sent successfully!';
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
