import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from 'mat-timepicker';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ReviewComponent } from '../profile/review/review.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { RescheduleComponent } from '../profile/reschedule/reschedule.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { FilterPipe } from './filter.pipe';
import { RatingComponent } from '../profile/rating/rating.component';
import { RatingHeartComponent } from '../profile/rating/rating-heart.component';

@NgModule({
  declarations: [
    SpinnerComponent,
    RescheduleComponent,
    DeleteDialogComponent,
    FilterPipe,
    ReviewComponent,
    RatingComponent,
    RatingHeartComponent,
   ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatSelectModule,
    MatSliderModule,
    MatInputModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatTooltipModule,
    NgxIntlTelInputModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatSelectModule,
    MatSliderModule,
    MatInputModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatTooltipModule,
    NgbModule,
    SpinnerComponent,
    RescheduleComponent,
    NgxIntlTelInputModule,
    FilterPipe,
    ReviewComponent,
    RatingComponent,
    RatingHeartComponent
  ],
  providers: [MatNativeDateModule, { provide: MatDialogRef, useValue: {} }],
})
export class SharedModule { }
