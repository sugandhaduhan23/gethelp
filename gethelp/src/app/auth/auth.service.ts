import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider, FacebookAuthProvider} from 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, 
              private firestore: AngularFirestore,
              private router: Router) { }


  registerUser(f : any): Promise<any>{
    return this.afAuth.createUserWithEmailAndPassword(f['email'].value, f['password'].value);
  }

  signInWithEmail(f : any): Promise<any>{
    return this.afAuth.signInWithEmailAndPassword(f['email'].value, f['password'].value);
  }

  saveUserDetails(loginWithEmail :boolean, userId:string ,f : any): Promise<any>{
   if(loginWithEmail){
      return this.firestore.collection(environment.collections.PROFILES).doc(userId).set({
          email: f['email'].value,
          name: f['name'].value,
          phoneNumber: f['phoneNo'].value,
          role: f['role'].value,
        });
    }else{
      return this.firestore.collection(environment.collections.PROFILES).doc(userId).set({
        name: f.displayName,
        email: f.email,
        role: f.role,
        profilePhoto: f.photoURL || '',
      });
    }
  }

  signUpWithGoogle():Promise<any>{
    const provider = new GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }

  signUpWithFacebook():Promise<any>{
    const provider = new FacebookAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }

  signOut(){
    this.afAuth.signOut();
    this.router.navigate(['/'])
  }
}
