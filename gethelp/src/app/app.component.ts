import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SET_USER_INFO } from './store/actions/action';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import { SpinnerService } from './spinner/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading = false;

  constructor(
    private store: Store<any>,
    private spinnerService: SpinnerService
    ) { }

  ngOnInit(): void {
    this.setCurrentUser();
    this.isDataloading();
  }

  isDataloading(){
    this.spinnerService.isloading.subscribe(response => this.loading = response);
  }
  
  setCurrentUser () {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        return;
      }
        this.store.dispatch({
          type: SET_USER_INFO,
          payload: JSON.parse(JSON.stringify(user))
        });
    });
  }
}


