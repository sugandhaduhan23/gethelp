import { Component, Input } from '@angular/core';
import { Review } from 'src/app/models/reviews.model';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  @Input() review!: Review;
  @Input() limit!: number;
  @Input() completeWords!: boolean;
  

  isContentToggled!: boolean;
  nonEditedContent!: string;
  content!:string
  page = 1;
  pageSize = 2;

  constructor() {
  }

  ngOnInit() {
    this.nonEditedContent = this.review.content;
    this.content = this.review.content.length> this.limit ? this.formatContent(this.review.content) :  this.review.content;
    this.review.profilePhoto =  this.review.profilePhoto ? this.review.profilePhoto : "assets/image/avatar.png";
  }

  toggleContent() {
    this.isContentToggled = !this.isContentToggled;
    this.content = this.isContentToggled ? this.nonEditedContent : this.formatContent(this.content);
  }

  formatContent(content: string) {
    return `${content.substring(0, this.limit)}...`;
  }
}
