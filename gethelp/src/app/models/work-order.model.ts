export enum Action{
    RESCHEDULE = 'reschedule',
    CANCEL = 'cancel'
}

export interface WorkOrder {
    id: string;
    customer: string;
    customerName: string;
    customerPhoto: string;
    customerEmail: string;
    pro: string,
    proPhoto?: string;
    proName: string;
    proEmail: string;
    bookingDate: any;
    bookingTime: any;
    date: string
    time: string;
    startTime: any;
    totalTime: string;
    category: string;
    categoryName : string;
    taskType: string;
    tasktypeName: string;
    status: string;
    price: number;
    address: string;
    additionalDetails: string;
    maplocation: string;
}

export enum WORKORDERSTATUS{
    CREATED = 'created',
    INPROGRESS = 'inprogress',
    COMPLETE = 'complete',
    CANCELLED = 'cancelled'
}


