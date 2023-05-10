import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProfileImageModalComponent } from './profile-image-modal/profile-image-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../guard/auth.guard';
import { AddReviewComponent } from './add-review/add-review.component';
import { WorkorderPriceComponent } from './workorder-price/workorder-price.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { CountUpModule } from 'ngx-countup';
import { MessageDetailsComponent } from './message-details/message-details.component';
import { MyAccountComponent } from './my-account.component';

@NgModule({
  declarations: [
    MyAccountComponent,
    ProfileImageModalComponent,
    OrderHistoryComponent,
    AddReviewComponent,
    WorkorderPriceComponent,
    MessageDialogComponent,
    MessageDetailsComponent,
  ],
  imports: [
    CountUpModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: MyAccountComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'orderhistory',
        component: OrderHistoryComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'review/:workorder',
        component: AddReviewComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'notifications/:id',
        component: MessageDetailsComponent,
        canActivate: [AuthGuard]
      }
    ]),
  ],
  providers: [],
})
export class MyAccountModule {}
