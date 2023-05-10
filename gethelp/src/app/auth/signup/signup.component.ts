import { Component, ViewEncapsulation } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { MessageAction, MessageEvenDescription } from 'src/app/models/message.model';
import { Role } from 'src/app/models/profiles.model';
import { WorkOrder } from 'src/app/models/work-order.model';
import { CommonService } from 'src/app/shared/common.service';
import { WorkOrderAppState } from 'src/app/store/state/app.state';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  errorMessage = '';
  workOrder!: WorkOrder;
  registerForm!: FormGroup;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.India,
  ];

  role!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<WorkOrderAppState>,
    private commonService: CommonService  ) {
    this.store
      .select((state) => state.workorder)
      .subscribe((response) => {
        this.workOrder = Object.assign({}, response);
      });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.role = params['role'];
      if (!this.role) this.role = Role.CUSTOMER;
    });

    let passwordPattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$/;
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        phoneNo: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.pattern(passwordPattern)],
        ],
        confirmPassword: ['', Validators.required],
        role: [this.role],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  async registerUser() {
    try {
      let userCredential = await this.authService.registerUser(this.f);
      let user = await userCredential.user!;
      user.role = this.role;
      this.saveUserDetails(true, user.uid, this.f);
      this.storeUserDetailsOnUI(user);
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  async signUpWithGoogle() {
    try {
      let credential = await this.authService.signUpWithGoogle();
      let user = await credential.user!;
      user.role = this.role;
      this.saveUserDetails(false, user.uid, user);
      this.storeUserDetailsOnUI(user);
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  async signUpWithFacebook() {
    try {
      let credential = await this.authService.signUpWithFacebook();
      let user = await credential.user!;
      user.role = this.role;
      this.saveUserDetails(false, user.uid, user);
      this.storeUserDetailsOnUI(user);
    } catch (e: any) {
      this.errorMessage = e.message;
    }
  }

  storeUserDetailsOnUI(user: any) {
    localStorage.setItem('userid', user.uid);
    localStorage.setItem('role', this.role);
    if (Object.keys(this.workOrder).length != 0) {
      this.checkIfUserNavigatedFromProfiles(user.uid, {
        name: user.displayName,
        email: user.email,
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  saveUserDetails(loginWithEmail: boolean, userId: string, f: any) {
    this.authService.saveUserDetails(loginWithEmail, userId, f).then(() => {
      this.router.navigate(['/']);
    });
  }

  checkIfUserNavigatedFromProfiles(userId: string, userDetails: any) {
    this.workOrder.customer = userId;
    this.workOrder.customerName = userDetails.name;
    this.workOrder.customerEmail = userDetails.email;
    this.workOrder.customerPhoto = userDetails.profilePhoto;
    this.commonService
      .bookService(this.workOrder)
      .then(async (response: DocumentReference) => {
        this.router.navigate(['/profile/booking', response.id]);
        this.workOrder.id = response.id;
        this.commonService.sendMessage(MessageAction.CREATED,[ this.workOrder.customer,  this.workOrder.pro], MessageEvenDescription.CREATED, this.workOrder);
        this.commonService.sendBookingConfirmation(this.workOrder, userDetails);
        this.updateWorkOrderState();
      });
  }

  updateWorkOrderState() {
    this.store.dispatch({
      type: 'CREATE_WORKORDER',
      payload: {},
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')!;
    const confirmPassword = formGroup.get('confirmPassword')!;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMatch: true });
    } else {
      confirmPassword.setErrors(null);
    }
  }
}
