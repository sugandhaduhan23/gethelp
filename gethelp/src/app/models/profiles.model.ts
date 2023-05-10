import { Review } from "./reviews.model";

export enum ServiceUnit {
    day = 'Day',
    hour = 'Hour',
    month = 'Month',
    service = 'Service',
};

export enum Role{
    PRO = 'pro',
    CUSTOMER = 'customer',
}

export interface Profile {
    bio: string;
    categories: number[];
    id?: string;
    role: string;
    featuredPhoto?: any[];
    profilePhoto: string;
    name: string;
    email: string;
    phoneNo: any;
    numOfHires: number;
    rating: number | null;
    reviews: Review[];
    servingLocations: string[];
    serviceCost: number;
    serviceUnit: ServiceUnit;
    about: string;
    paymentMethod?: string[];
    employees?:number
    yearsinbusiness?:number;
    backgroundcheck?: boolean;
    status?: string;
    social?: any[];
    workOrders: string[];
}