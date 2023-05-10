import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { RouterModule } from '@angular/router';
import { NgwWowModule } from 'ngx-wow';

@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    CommonModule,
    NgwWowModule,
    RouterModule.forChild([{ path: '', component: AboutComponent }]),
  ]
})
export class AboutModule { }
