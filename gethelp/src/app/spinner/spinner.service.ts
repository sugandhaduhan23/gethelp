import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
   private loading = new BehaviorSubject<boolean>(false);
   isloading = this.loading.asObservable();
   
   setLoadingStatus(loading: boolean){
     this.loading.next(loading); 
   }
}