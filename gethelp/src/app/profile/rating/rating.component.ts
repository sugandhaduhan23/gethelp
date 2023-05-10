import { Component, Input, OnInit } from "@angular/core";
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss']
})

export class RatingComponent implements OnInit {
    @Input() rating: number = 0;
    ratingArray: number[] = [];
    hasPartial: boolean = false;
    showEmptyHearts = false;
    number!: number[];

    constructor(config: NgbRatingConfig) {
		config.max = 5;
		config.readonly = true;
	}

    ngOnInit () {
        if(!this.rating){
            this.showEmptyHearts = true;
            this.number = Array(5).fill(0);
        }else{
            this.ratingArray = Array.from(Array(Math.floor(this.rating)).keys())
            this.hasPartial =  this.ratingArray.length < this.rating
            if( this.rating<5 ){
                this.showEmptyHearts = true;
                this.number = Array(Math.floor(5-this.rating)).fill(0)
            }
        }
       
    }
}