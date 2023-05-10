import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { Profile } from '../../models/profiles.model';
import { GMaps } from '../../shared/maps.service';
@Component({
    selector: 'profile-listing',
    templateUrl: './profile-listing.component.html',
    styleUrls: ['./profile-listing.component.scss'],

})

export class ProfileListingComponent implements OnInit {
    @Input() profile!: Profile; 
    @Input() category!: string; 
    red = 'red'
    className: string;
    onClick?: (params: any) => void
    servingLocations: null | string = null
    cityStateRegEx: RegExp = /^(\S{1,}\,\s+\S{1,2})/; 
    constructor (private GMaps: GMaps,
                 private router: Router,
                 private activatedRoute: ActivatedRoute,
                
                ) {
        this.className = 'btn btn-schedule'
    }

    ngOnInit(): void {
        this.servingLocations = '';
        this.profile.profilePhoto =  this.profile.profilePhoto || "assets/image/avatar.png";
        this.profile.servingLocations.forEach(zip => {
            this.GMaps.getLocationFromZip(zip).then((data) => {
                const isSameCityName = this.servingLocations?.split(',')[0] === data?.split(',')[0];
                this.servingLocations  = ( !this.servingLocations || isSameCityName ) 
                    ? data.match(this.cityStateRegEx)?.[0]
                    : `${this.servingLocations}, ${data.match(this.cityStateRegEx)?.[0]}`;  
            });
        });
    }

    fetchDetailedProfile(){
        this.router.navigate(['detail', this.category, this.profile.id], {relativeTo: this.activatedRoute});
    }
}