import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private firestore: AngularFirestore) { }

  addReview(data: any){
    return this.firestore
    .collection(environment.collections.REVIEWS)
    .add(data);
  }
}
