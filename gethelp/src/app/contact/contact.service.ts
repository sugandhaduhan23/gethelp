import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(){}

  sendEmail(data: any){
    return emailjs.send(environment.emailjskeys.serviceId, environment.emailjskeys.templateId, data, environment.emailjskeys.publicKey);
  }
  
}
