import { NgModule } from '@angular/core';

import { MatNativeDateModule } from '@angular/material/core';

import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { IvyCarouselModule } from 'angular-responsive-carousel';

import { ProfileComponent } from './profile.component';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { RouterModule } from '@angular/router';
import { ProfileListingComponent } from './profile-listing/profile-listing.component';
import { BaseButtonComponent } from '../helper/base-button/base-button.component';
import { BookingComponent } from './booking/booking.component';
import { SafePipe } from '../shared/safe.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthGuard } from '../guard/auth.guard';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    BaseButtonComponent,
    ProfileComponent,
    ProfileListingComponent,
    ProfileDetailComponent,
    BookingComponent,
    SafePipe
  ],
  imports: [
    MatSliderModule,
    NgbRatingModule,
    NgxSliderModule,
    IvyCarouselModule,
    ShareButtonsModule,
    ShareIconsModule,
    MatSidenavModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent,
      },
      {
        path: 'detail/:category/:id',
        component: ProfileDetailComponent,
      },
      {
        path: 'booking',
        component: BookingComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'booking/:workorder',
        component: BookingComponent,
        canActivate: [AuthGuard]
      }
    ]),
  ],
  providers: [MatNativeDateModule],
})
export class ProfileModule {}
