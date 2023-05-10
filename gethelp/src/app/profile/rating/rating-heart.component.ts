import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'rating-heart',
    templateUrl: './rating-heart.svg',
    styleUrls: ['./rating-heart.component.scss']
})

export class RatingHeartComponent implements OnInit {
    @Input() rating: number = 0;
    @Input() stopColor!: 'red' | 'lightgray';
    @Input() startColor: 'red' | 'lightgray' = 'red';
    @Input() showEmptyHeart = false;
    isLoaded: boolean = false;


    constructor() { }


    ngOnInit () {
        this.isLoaded = true;
    }
}