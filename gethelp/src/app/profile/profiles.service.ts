import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction,
} from '@angular/fire/compat/firestore';
import { map, Observable, tap, iif, NEVER, filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile, Role } from '../models/profiles.model';
import { GMaps } from '../shared/maps.service';
import firebase from 'firebase/compat/app';
import { WORKORDERSTATUS } from '../models/work-order.model';

enum Action {
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
}

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  constructor(private firestore: AngularFirestore, private GMaps: GMaps) {}

  getAllProfiles(categoryId: string): Observable<Profile[]> {
    return this.firestore
      .collection(environment.collections.PROFILES, (ref) =>
        ref
          .where('role', '==', Role.PRO)
          .where('categories', 'array-contains', parseInt(categoryId))
      )
      .snapshotChanges()
      .pipe(
        //Do not show the pro his own profile when he tries to book a service
        map((actions: DocumentChangeAction<any>[]) => actions.filter((action) => action.payload.doc.id != localStorage.getItem('userid'))),
        map((e: DocumentChangeAction<any>[]) => {
          return e.map((data: DocumentChangeAction<any>) => {
           
            const details = data.payload.doc.data();
            return {
              ...details,
              id: data.payload.doc.id,
            };
          });
        })
      );
  }

  /**
   * @param categoryId
   * @param location
   * @returns [zip, ...]
   */
  getProfilesByServiceAndLocation(
    categoryId: string,
    location: string
  ): Promise<Profile[]> {
    const nearByLimit = 30; // in miles
    return new Promise((resolve) => {
      this.GMaps.getNearbyZipcodesFromZip(location, nearByLimit).subscribe(
        (zipsCodes) => {
          const getNearbyLocations: string[] = zipsCodes.map(
            (zip: string) => zip
          );
          return this.getAllProfiles(categoryId).subscribe((profiles) => {
            const filteredProfileList: Profile[] = profiles.filter(
              (profile) => {
                const { servingLocations } = profile;
                const isServingInTheLocation = servingLocations.some(
                  (servingLocation) => {
                    return getNearbyLocations.includes(
                      servingLocation.toString()
                    );
                  }
                );
                return isServingInTheLocation;
              }
            );
            resolve(filteredProfileList);
          });
        }
      );
    });
  }

  checkProfileExists(id: string): Observable<any> {
    const docId = this.firestore
      .collection(environment.collections.PROFILES)
      .doc(id);

    return docId.get();
  }

  getTaskType(): Observable<any> {
    return this.firestore
      .collection(environment.collections.TASKTYPE)
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

  getReviews(user: string, profileId: string) {
    return this.firestore
      .collection(environment.collections.REVIEWS, (ref) =>
        ref.where(user, '==', profileId)
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

  getWorkOrder(workOrder: string): Observable<any> {
    return this.firestore
      .collection(environment.collections.WORKORDER)
      .doc(workOrder)
      .valueChanges();
  }

  getAllWorkOrders(userId: string, role: string) {
    return this.firestore
      .collection(environment.collections.WORKORDER, (ref) =>
        ref.where(role, '==', userId)
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

  cancelBooking(workOrder: string): Promise<any> {
    return this.firestore
      .collection(environment.collections.WORKORDER)
      .doc(workOrder)
      .update({
        status: 'cancelled',
      });
  }

  /**
   *
   * @param workOrderId
   * @param data
   * @returns
   */

  updateHireDetails(profileId: string, workOrderId: string): Promise<any> {
    return this.firestore
      .collection(environment.collections.PROFILES)
      .doc(profileId)
      .update({
        numOfHires: firebase.firestore.FieldValue.increment(1),
        workOrders: firebase.firestore.FieldValue.arrayUnion(workOrderId),
      });
  }

  updateHireDetailsonDelete(
    profileId: string,
    workOrderId: string
  ): Promise<any> {
    return this.firestore
      .collection(environment.collections.PROFILES)
      .doc(profileId)
      .update({
        numOfHires: firebase.firestore.FieldValue.increment(-1),
        workOrders: firebase.firestore.FieldValue.arrayRemove(workOrderId),
      });
  }

  rescheduleBooking(workOrderId: string, data: any): Promise<any> {
    return this.firestore
      .collection(environment.collections.WORKORDER)
      .doc(workOrderId)
      .update({
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        date: data.date,
        time: data.time,
        address: data.address,
        additionalDetails: data.additionalDetails,
      });
  }

  changeWorkOrderStatus(
    workOrderId: string,
    status: string,
    price?: string,
    startTime?: any,
    totalTime?: string
  ): Promise<any> {
    let data: any;
    switch (status) {
      case WORKORDERSTATUS.INPROGRESS:
        data = {
          status: status,
          startTime: startTime,
        };
        break;
      case WORKORDERSTATUS.COMPLETE:
        data = {
          status: status,
          price: price,
          totalTime: totalTime,
        };
        break;
      default:
        data = {
          status: status
        };
    }
    return this.firestore
      .collection(environment.collections.WORKORDER)
      .doc(workOrderId)
      .update(data);
  }

  /**
   * @param uid
   * @returns
   */
  // getProfilesByRole(id: string, role: string): Observable<any> {
  //   return this.firestore
  //     .collection(environment.collections.PROFILES, (ref) =>
  //       ref.where('role', '==', role)
  //     )
  //     .doc(id)
  //     .valueChanges();
  // }

  /**
   * Update profile info by ID
   */

  updateProfilebyId({
    uid,
    dataToUpdate,
  }: {
    uid: string;
    dataToUpdate: Record<string, any>;
  }) {
    return this.firestore
      .collection(environment.collections.PROFILES)
      .doc(uid)
      .update({
        ...dataToUpdate,
      });
  }
}
