import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import { AuthGuard } from '../guard/auth.guard';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AuthComponent,
    SignupComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'signup',
        component: SignupComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'signup/:role',
        component: SignupComponent,
        canActivate: [AuthGuard]
      }
    ]),
  ],
})
export class AuthModule {}
