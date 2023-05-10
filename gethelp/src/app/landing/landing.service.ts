import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AngularFirestore, DocumentChangeAction, DocumentData, QuerySnapshot } from '@angular/fire/compat/firestore';
import { elementAt, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  constructor(private http: HttpClient,
              private firestore: AngularFirestore) {}

  getGEOLocation() {
    return this.http.get(environment.collections.GEOLOCATION);
  }

  gethelpconfigs(): Observable<any>  {
    return this.firestore.collection(environment.collections.GETHELPCONFIGS).snapshotChanges()
    .pipe(
      map((e:DocumentChangeAction<any>[]) => {
       return e.map((d:DocumentChangeAction<any>)=>{
        return {[ d.payload.doc.id]: Object.values(d.payload.doc.data())[0]};
      })
    }));
    //return this.firestore.collection(environment.collections.GETHELPCONFIGS).get();
  }
}