import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile, Role } from '../models/profiles.model';
import { WorkOrder } from '../models/work-order.model';
import emailjs from '@emailjs/browser';
import { Message, MessageAction, MessageEvenDescription } from '../models/message.model';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private unread = new BehaviorSubject<number>(0);
  unreadMessage = this.unread.asObservable();

  constructor(private firestore: AngularFirestore) {}

  fetchCategories() {
    return this.firestore
      .collection(environment.collections.CATEGORY)
      .snapshotChanges()
      .pipe(
        map((e: DocumentChangeAction<any>[]) => {
          return e.map((d: DocumentChangeAction<any>) => {
            const data = d.payload.doc.data();
            data.id = d.payload.doc.id;
            return data;
          });
        })
      );
  }

  getProfiles(id: string): Observable<any> {
    return this.firestore
      .collection(environment.collections.PROFILES)
      .doc(id)
      .valueChanges();
  }

  getUserdetails(userId: string): Promise<Profile> {
    return new Promise((resolve) => {
      this.getProfiles(userId).subscribe((response: Profile) => {
        resolve(response);
      });
    });
  }

  bookService(data: WorkOrder): Promise<any> {
    return this.firestore
      .collection(environment.collections.WORKORDER)
      .add(data);
  }

  sendBookingConfirmation(data: WorkOrder, customer: Profile) {
    let payload: any;
    payload = { ...data };
    payload.custName = customer.name;
    payload.custEmail = customer.email;
    payload.bookingDate = payload.bookingDate.toLocaleDateString();
    payload.bookingTime = payload.bookingTime.toLocaleTimeString();

    this.sendBookingEmail(payload).then((response)=>{
      let res= response;
    },(error)=>{
      let err = error;
    })
  }

  sendBookingEmail(data: any) {
    return emailjs.send(
      environment.emailjskeys.serviceId,
      environment.emailjskeys.bookingTemplateId,
      data,
      environment.emailjskeys.publicKey
    );
  }

  customDateFormat(date: Date) {
    let d = date.getDate(),
      m = date.toLocaleString([], { month: 'short' }),
      y = date.getFullYear();

    return `${m} ${d}, ${y}`;
  }

  getNotifications() {
    const userId = localStorage.getItem('userid');
    return this.firestore
      .collection(environment.collections.NOTIFICATIONS, (ref) =>
        ref.where('sentTo', 'array-contains-any', [userId])
           .orderBy('createdAt', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map((e: DocumentChangeAction<any>[]) => {
          return e.map((d: DocumentChangeAction<any>) => {
            const data = d.payload.doc.data();
            data.id = d.payload.doc.id;
            return data;
          });
        })
      );
  }

  getNotificationsById(messageId: string): Observable<any> {
    return this.firestore
      .collection(environment.collections.NOTIFICATIONS)
      .doc(messageId)
      .valueChanges();
  }

  saveNotifications(data: Message): Promise<any> {
    return this.firestore
      .collection(environment.collections.NOTIFICATIONS)
      .add(data);
  }

  setUnreadMessages(unread: number) {
    this.unread.next(unread);
  }

  markRead(messageId: string) {
    const role = localStorage.getItem('role');
    const data = role == Role.PRO ? {proRead : true} : {customerRead : true}
    return this.firestore
      .collection(environment.collections.NOTIFICATIONS)
      .doc(messageId)
      .update(data);
  }

  sendReply(messageId: string, sentTo: string[], data: any) {
    return this.firestore
      .collection(environment.collections.NOTIFICATIONS)
      .doc(messageId)
      .update({ 
        title: MessageAction.NEWREPLY,
        message: MessageEvenDescription.NEWREPLY,
        sentTo: sentTo,
        customerRead: false,
        proRead: false,
        reply: firebase.firestore.FieldValue.arrayUnion(data)
      });
  }

  markAllRead() { 
    const userId = localStorage.getItem('userid');
    const role = localStorage.getItem('role');
    const data = role == Role.PRO ? {proRead : true} : {customerRead : true}
    const collectionRef = this.firestore.collection(
      environment.collections.NOTIFICATIONS,
      (ref) =>  ref.where('sentTo', 'array-contains-any', [userId])
    );
    collectionRef.get().subscribe((querySnapshot) => {
      const batch = this.firestore.firestore.batch();
      querySnapshot.forEach((doc) => {
        const documentRef = collectionRef.doc(doc.id);
        batch.update(documentRef.ref, data);
      });
      batch.commit();
    });
  }

  sendMessage(title: string, sentTo: string[], msg: string, workorder: WorkOrder, messageData ?: any) {
    let message : Message = {
      sentTo: sentTo,
      message: msg,
      title: title,
      customerRead: false,
      proRead: false,
      date: this.customDateFormat(new Date()),
      createdAt: new Date(),
      workorder: workorder,
      customTitle:  messageData?.customTitle || '',
      oldDate: messageData?.oldDate || '',
      oldTime: messageData?.oldTime || '',
      oldLocation: messageData?.oldLocation || '',
    };
    this.saveNotifications(message).then((response) => {
      const res = response;
    });
  }
}
