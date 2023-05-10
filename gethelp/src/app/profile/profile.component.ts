import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonService } from "../shared/common.service";
import type { Profile } from "../models/profiles.model";
import { ActivatedRoute } from '@angular/router';
import { Category } from "../models/categories.model";
import { FormControl} from '@angular/forms';
import { Options } from "@angular-slider/ngx-slider";
import { ProfilesService } from './profiles.service';
import * as AOS from 'aos';
import { SpinnerService } from "../spinner/spinner.service";

enum SortOptions  {
    best = '',
    low = 'low',
    high = 'high',
    rating = 'rating',
    hire = 'hire'
}

type Sort = {
    checked: boolean;
    logo?: string;
    name: string;
    value: SortOptions;
}

type AdditionalServiceInfo = {
    averageCost: number;
    averageRating: number;
    totalHelpersAvailable: number;
    totalTasksCompleted: number;
}


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
    title = 'Results';
    profiles: Profile[];
    zip: string;
    category: string;
    categoryName: string;
    isLoading: boolean;
    sortConfig: Sort[];
    profilesCached: Profile[];
    selectedSortOption: string;
    selectedSortOptionValue: string;
    showFiller: boolean = false;
    filterDefaultValue: number = 0;
    filterHighestValue: number = 100;
    filterOptions: Options = {
        floor: 0,
        ceil: 100,
        showSelectionBar: true,
        noSwitching: true,
        getPointerColor: (value: number): string => {
            return '#ffc107';
        },

        getSelectionBarColor: (value: number): string => {
            return '#000';
        },

        translate: (value: number): string => {
            return '$' + value;
        }
    };

    filterControl = new FormControl('');
    additionalServiceInfo: AdditionalServiceInfo;
    
    constructor(
        private commonService: CommonService,
        private route: ActivatedRoute,
        private profileService: ProfilesService,
        private spinnerService: SpinnerService
    ) {
        this.category = '';
        this.categoryName = '';
        this.isLoading = true;
        this.profiles = [];
        this.profilesCached = [];
        this.selectedSortOption = 'Recommended'
        this.selectedSortOptionValue = ''
        this.zip = '';

        this.additionalServiceInfo = {
            totalTasksCompleted: 0,
            totalHelpersAvailable: 0,
            averageCost: 0,
            averageRating: 0
        }

        this.sortConfig = [
            {
                checked: true,
                name: 'Recommended',
                value: SortOptions.best,
            },
            {
                checked: false,
                name: 'Price - Low to High',
                value: SortOptions.low
            },
            {
                checked: false,
                name: 'Price - High to Low',
                value: SortOptions.high,
            },
            {
                checked: false,
                name: 'Rating - High to Low',
                value: SortOptions.rating,
            },
            {
                checked: false,
                name: 'Hires Count - High to Low',
                value: SortOptions.hire,
            }
        ];
    }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe((params) => {
                this.zip = params['zip'];
                this.category = params['service'];
                this.categoryName = ''
            });

        AOS.init({
            duration: 1000,
            easing: "ease-in-out",
            once: true,
            mirror: false
        });
  
        this.getCategoryInfo(this.category);
        this.getUserProfiles()
    }

    getCategoryInfo(category: string) {
        this.commonService.fetchCategories().subscribe((res: Category[]) => {
            const allCategories = res || [];
            this.categoryName = allCategories.find(cat => cat.id === category)?.name || ''
        });
    }

    getAdditionalServiceInfo (profiles: Profile[]): AdditionalServiceInfo {
        const locationInfo = profiles.reduce((accum, profile) => ({
            totalTasksCompleted: accum.totalTasksCompleted + (profile?.numOfHires || 0),
            totalHelpersAvailable: accum.totalHelpersAvailable + 1,
            averageCost: accum.averageCost + (profile?.serviceCost || 0),
            averageRating: accum.averageRating + (profile?.rating || 0)
        }), this.additionalServiceInfo);

        return {
            ...locationInfo,
            averageCost: parseFloat((locationInfo.averageCost / profiles.length).toFixed(2)),
            averageRating: Math.round(locationInfo.averageRating / profiles.length)
        };
    }

    onFilterValueChange () {
        this.profiles = this.profilesCached.filter(profile => profile.serviceCost >= this.filterDefaultValue && profile.serviceCost <= this.filterHighestValue);
    }

    getMaxHireRate(profiles: Profile[]): number {
        if (!profiles) {
            return 100;
        }

        return profiles.reduce((highRate, profile) => {
            return profile.serviceCost > highRate ? profile.serviceCost : highRate;
        }, 0);
    }

    adjustFilterSettings() {
        const maxHireRate = this.getMaxHireRate(this.profiles);
        const updatedFilterOptions: Options = Object.assign({}, this.filterOptions);
        updatedFilterOptions.ceil = maxHireRate;
        this.filterOptions = updatedFilterOptions;
        this.filterHighestValue = maxHireRate;
    }

    getUserProfiles () {
        this.spinnerService.setLoadingStatus(true);
        this.profileService.getProfilesByServiceAndLocation(this.category, this.zip).then((profiles) => {
            this.spinnerService.setLoadingStatus(false);
            this.isLoading = false;
            this.profiles = profiles;
            if (!this.profiles.length) {
                return
            }
            this.profilesCached = [ ...this.profiles];
            this.additionalServiceInfo = this.getAdditionalServiceInfo(this.profiles);
            this.adjustFilterSettings();
        });
    }

    performFilterByOption(option: string | null): Profile[] {
        const sortByPriceLowToHi = (profiles: Profile[]) => profiles.sort((a, b) => a.serviceCost < b.serviceCost ? -1 : 1);
        const sortByPriceHiToLow = (profiles: Profile[]) => profiles.sort((a, b) => a.serviceCost > b.serviceCost ? -1 : 1);
        const sortByRating = (profiles: Profile[]) => profiles.sort((a, b) => ((a.rating || 0) > (b.rating || 0)) ? -1 : 1);
        const sortByHire = (profiles: Profile[]) => profiles.sort((a, b) => ((a.numOfHires || 0) > (b.numOfHires || 0)) ? -1 : 1);
        
        switch (option) {
            case SortOptions.low:
                return sortByPriceLowToHi(this.profiles);

            case SortOptions.high:
                return sortByPriceHiToLow(this.profiles);

            case SortOptions.rating:
                return sortByRating(this.profiles);

            case SortOptions.hire:
                return sortByHire(this.profiles);
            
            default:
                return [...this.profilesCached];
        }
    }

    onSortOptionChange (option: string | null): void {
        this.selectedSortOption = this.sortConfig.find(config => config.value === option)?.name || '';
        this.profiles = [
            ...this.performFilterByOption(option),
        ];
    }

    trackProfileListingBy (index: number, item: Profile) {
        return item.id;
    }

};