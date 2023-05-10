import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ResolveEnd, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Message } from '../models/message.model';
import { Profile, Role } from '../models/profiles.model';
import { CommonService } from '../shared/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
  @Output() clicked = new EventEmitter<void>();
  @ViewChild('navbar') navbar!: ElementRef;
  url!: string;
  authenticated = false;
  user!: Profile;
  role!: string | null ;
  hidden = false;
  unread !: number;

  constructor(private router: Router,
              private authService : AuthService,
              private afAuth: AngularFireAuth,
              private commonService: CommonService
              ) {}

  @HostListener('window:scroll', []) onWindowScroll() {
    if (this.url == '/' || this.url == '/about' || this.url == '/home#services') {
      if (window.pageYOffset > 45) {
        this.navbar.nativeElement.classList.add('sticky-top', 'shadow-sm');
      } else {
        this.navbar.nativeElement.classList.remove('sticky-top', 'shadow-sm');
      }
    }
  }

  ngOnInit(): void {
    this.router.events.subscribe((routerData) => {
      if (routerData instanceof ResolveEnd) {
        this.url = routerData.url;
        if (routerData.url == '/' || routerData.url == '/about' || routerData.url == '/home#services' || routerData.url == '/#header-carousel') {
          this.navbar.nativeElement.classList.remove('sticky-top', 'shadow-sm');
        } else {
          this.navbar.nativeElement.classList.add('sticky-top', 'shadow-sm');
        }
      }
    });

    this.isAuthenticated();
    this.getNotifications();
  }

  isAuthenticated(){
    this.afAuth.authState.subscribe(user => {
         this.authenticated = !!user
         if(this.authenticated){
            this.role =  localStorage.getItem('role')
         }
     });
  }

  showNotifications() {
    this.commonService.unreadMessage.subscribe(res=>{
      this.hidden = res>0 ? false : true;
    })
    this.clicked.emit();
  }

  logout(){
    localStorage.clear();
    this.authService.signOut();
  }

  getNotifications(){
    const role = localStorage.getItem('role');
    this.commonService.getNotifications().subscribe((response: Message[])=>{
       if(role == Role.PRO)
          this.unread = (response.filter((message: Message) => message.proRead == false)).length;
       else
          this.unread = (response.filter((message: Message) => message.customerRead == false)).length;
       this.commonService.setUnreadMessages(this.unread);
       this.hidden =  this.unread > 0 ? false : true;
    })
  }
}
