import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import * as AOS from 'aos';
import { ContactService } from './contact.service';
import { SpinnerService } from '../spinner/spinner.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})

export class ContactComponent implements OnInit {
  @ViewChild('successAlert', { static: true }) successAlert!: ElementRef;
  @ViewChild('errorAlert', { static: true }) errorAlert!: ElementRef;
  @ViewChild('hp') hp!: NgForm;

  helpForm!: FormGroup;
  successMessage = '';
  errorMessage = ''

  constructor(private fb: FormBuilder,
              private contactService: ContactService,
              private spinnerService: SpinnerService) { }

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });

    this.helpForm = this.fb.group({
        name:['', Validators.required],
        email:['',[Validators.required, Validators.email]],
        subject:['', Validators.required],
        message:['', Validators.required]
    })
  }

  get f() {
    return this.helpForm.controls;
  }

  sendEmail(){   
    this.spinnerService.setLoadingStatus(true);
    this.contactService.sendEmail(this.helpForm.value).then(()=>{
      this.spinnerService.setLoadingStatus(false);
      this.helpForm.reset();
      this.hp.resetForm();
      this.successMessage="Your message has been sent. Thank you!"
      this.successAlert.nativeElement.classList.add('show');
      setTimeout(()=>{
        this.successAlert.nativeElement.classList.remove('show')
      }, 3000);
      
    },()=>{
      this.spinnerService.setLoadingStatus(false);
      this.errorMessage="Unable to send the message. Please try again later!!!"
      this.errorAlert.nativeElement.classList.add('show');
      setTimeout(()=>{
        this.errorAlert.nativeElement.classList.remove('show')
      }, 3000);
    })
  }

}
