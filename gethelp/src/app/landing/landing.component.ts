import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgwWowService } from 'ngx-wow';

import { Category } from '../models/categories.model';
import { CommonService } from '../shared/common.service';
import { Router } from '@angular/router';
import { LandingService } from './landing.service';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';
import { interval } from 'rxjs/internal/observable/interval';
import { Subscription } from 'rxjs';
import { SpinnerService } from '../spinner/spinner.service';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  searchForm!: FormGroup;
  categories!: Category[];
  service: Category[] | undefined;
  fileredCategories!: Observable<Category[]>;
  interval!: Subscription;
  expandService = false;
  serviceBtnText = 'more services...';
  configs: any;
  loading = false;
  unread !: number;

  constructor(
    private wowService: NgwWowService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private landingService: LandingService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.wowService.init({ mobile: false });

    this.searchForm = this.fb.group({
      zipcode: ['', Validators.required],
      service: ['', Validators.required],
    });

    this.fetchCategories();
    this.getUserLocation();
    this.gethelpConfigs();
  }

  getUserLocation() {
    this.landingService.getGEOLocation().subscribe((response: any) => {
      this.searchForm.controls['zipcode'].setValue(response.postal_code);
    });
  }

  getUnreadMessages() {
    this.commonService.unreadMessage.subscribe((unread: number) => {
      this.unread = unread;
    });
  }

  gethelpConfigs() {
    this.landingService.gethelpconfigs().subscribe((response)=>{
        this.configs = Object.assign({}, ...response);
    });
  }

  get f() {
    return this.searchForm.controls;
  }

  private fetchCategories() {
    this.spinnerService.setLoadingStatus(true);
    this.commonService.fetchCategories().subscribe((res: Category[]) => {
      this.categories = res;
      this.watchCategoryChanges();
      this.fetchRandomService();
      this.startIntervalforRandomServices();
      this.spinnerService.setLoadingStatus(false);
    });
  }

  private startIntervalforRandomServices() {
    this.interval = interval(60000).subscribe(() => {
      this.fetchRandomService();
    });
  }

  private fetchRandomService() {
    let startIndex =
      Math.floor(Math.random() * (this.categories.length - 0 + 1)) + 0;
    while (startIndex + 6 > this.categories.length) {
      startIndex =
        Math.floor(Math.random() * (this.categories.length - 0 + 1)) + 0;
    }
    this.service = this.categories.slice(startIndex, startIndex + 6);
  }

  expandServices() {
    this.expandService = !this.expandService;
    if (!this.expandService) {
      this.fetchRandomService();
      this.startIntervalforRandomServices();
      this.serviceBtnText = 'more services...';
    } else {
      this.interval.unsubscribe();
      this.service = this.categories.slice();
      this.serviceBtnText = 'less services...';
    }
  }

  findProfile(category?: string) {
    if (category) {
      this.searchForm.patchValue({
        service: category,
      });
    }

    if (!this.searchForm.controls['zipcode'].value) {
      this.router.navigate(['/'], { fragment: 'header-carousel' });
      this.searchForm.controls['zipcode'].markAsTouched();
      return;
    }

    if (this.searchForm.valid) {
      this.router.navigate(['/profile'], {
        queryParams: {
          zip: this.searchForm.controls['zipcode'].value,
          service: this.searchForm.controls['service'].value,
        },
      });
    }
  }

  displayFn(id: string) {
    let category: Category | undefined = this.categories
      ? this.categories.find((c: Category) => c.id == id)
      : undefined;
    return category ? category?.name : '';
  }

  private watchCategoryChanges() {
    this.fileredCategories = this.searchForm.controls[
      'service'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this.filter(name as string) : this.categories.slice();
      })
    );
  }

  private filter(name: string): Category[] {
    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  navigatetoservices() {
    this.router.navigate(['services']);
  }

  ngOnDestroy() {
    this.interval.unsubscribe();
  }
}
