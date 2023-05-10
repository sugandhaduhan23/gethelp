import { Injectable } from '@angular/core';
import { cityInfoFromZip } from './maps.mocks'
import { Observable, Observer, of } from 'rxjs';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';

type Location = {
    zip_code: string;
    distance: number;
    city: string;
    state: string;
}

type StoredData = {
    data: any;
    status: 'done';
}
@Injectable({
    providedIn: 'root'
})

export class GMaps {

    /**
     * @param zip 
     * @param apiKey 
     * @returns formatted Address [string]
     */

    dbCreateRequest: IDBOpenDBRequest = {} as IDBOpenDBRequest;
    DB!: IDBDatabase;
    dbStore!: IDBObjectStore;

    db: IDBPDatabase<unknown> = {} as IDBPDatabase<unknown>;

    async init(name = '_getHelp_', version = 1) {
        this.db = await openDB(name, version, {
            upgrade(db) {
                db.createObjectStore('zip', { keyPath: 'zip'});
            },
        });
    }

    async writeToDb({ zip, nearByZipCodes }: {zip: string, nearByZipCodes: string[] }) {
        if (!this.db) {
            this.init();
        }

        const transaction = this.db.transaction('zip', 'readwrite');

        try {
            await transaction.objectStore('zip').add({ zip, [zip]: nearByZipCodes });
        } catch(err) {
            let error = err;
        }
    } 

    async readDB (zip: string) {
        const transaction = this.db.transaction('zip');
        const zipStore = transaction.objectStore('zip');
        const zipCodesData = await zipStore.getAll();
        const nearbyZipCodes = zipCodesData?.filter((item) => item['zip'] === zip);
        return nearbyZipCodes?.[0]?.[zip] || null;
    }




    async getLocationFromZip (zip: string, apiKey = 'AIzaSyChQrl11fwopSr1t37iSqRdy3NcdNm8rVY'): Promise<any> {    
        /**
         * Currently not used in the app to avoid billing while testing. 
         * It will be enabled once the application is almost complete
         */

        const enableMockGMaps = false;

        if (enableMockGMaps) {
            const response = cityInfoFromZip;
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve (response.results[0].formatted_address);
                }, 200)
            });
        }

        const zipCodeDataPersists = localStorage.getItem(`${zip}`);
        
        if (zipCodeDataPersists) {
            return zipCodeDataPersists;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`;
        const response = await fetch(url);
        const responseBody = await response.json();
        const formattedAddress = responseBody?.results?.[0]?.formatted_address || '';
        localStorage.setItem(`${zip}`, formattedAddress);
        return formattedAddress || '';
    }

    nearByZipCodeApi (zip='94588', nearByLimit = 30, onSuccess = (param: any) => {}, onError = () => {}) {
        const apiKey = 'cwPqRquzdgprr1xK9dtc1Ok1LNEtm76BgIDtCgmTTMq5nU2D9yNUHeKRNTuEWpjf';
        const clientKey = 'js-UfjEqlHEmR1mrwwEveW3GU3B8tytH51rpda2nidU1yBP3EwhJa2OhxRT3daVBSsK';
        const apiUrl = `https://www.zipcodeapi.com/rest/${clientKey}/radius.json/${zip}/${nearByLimit}/mile`;
        const headers = new Headers();
        fetch(apiUrl, {
            headers,
            'cache': 'force-cache',
        })
        .then(response => response.json())
        .then(data => {
            const zipCodesList = data.zip_codes.map((location: Location) => location?.zip_code);
            onSuccess(zipCodesList);
        })
        .catch(onError);
    }

    getNearbyZipcodesFromZip(zip='94588', nearByLimit = 30): Observable<string[]> {
        const storedData: Observable<StoredData> = new Observable( (observer)=> {
            this.init().then(async () => {
                const data = await this.readDB(zip);
                observer.next({data, status: 'done'});
                observer.complete();
            });
        });

        return new Observable( observer => {
            storedData.subscribe(({ data = {}, status }: StoredData) => {
                if (status === 'done' && (!data || !data.length)) {
                    const onSuccess = (zipCodesList: string[]) => {
                        this.writeToDb({ zip, nearByZipCodes: zipCodesList});
                        observer.next(zipCodesList)
                        observer.complete();
                    };

                    const onError = () => {
                        observer.next([zip])
                        observer.complete();
                    };

                    this.nearByZipCodeApi(zip, nearByLimit, onSuccess, onError)
                }
                else {
                    observer.next(data)
                    observer.complete();
                    return data || [zip]
                }
            });
        });
    }
}