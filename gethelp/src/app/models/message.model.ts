import { WorkOrder } from "./work-order.model";

export enum MessageAction{
    CREATED = 'New Workorder',
    STARTED = 'Service Started',
    CANCELLED = 'Workorder Cancelled',
    RESCHEDULED = 'Workorder Rescheduled',
    COMPLETE = 'Workorder Complete',
    REVIEW = 'New Review Posted',
    NEWMESSAGE = 'New Message',
    NEWREPLY = 'New Reply'
}

export enum MessageEvenDescription{
    CREATED = 'A new workorder has been created. Click View Details for detailed information.',
    STARTED = 'Your pro is here. We are excited to serve you.',
    CANCELLED = 'Your workorder has been cancelled. Click View Details for detailed information.',
    RESCHEDULED = 'Your workorder has been rescheduled. Click View Details for detailed information.',
    COMPLETE = 'Your workorder has been rescheduled. Please leave a review for the pro as it may help others to choose the best!!!',
    REVIEW = 'A new review has been posted for your. Go to your profile to view it.', 
    NEWPROMESSAGE = 'A pro is trying to reach you regarding your recent work order. Click View Details for detailed information.',
    NEWCUSTOMERMESSAGE = 'A customer is trying to reach you regarding your recent work order. Click View Details for detailed information.',
    NEWREPLY = 'A new reply has been posted on your conversation. Please click View Conversation to view it.'
}

export interface Message {
    id ?: string;
    workorder: WorkOrder
    sentTo: string[]; //Receving party
    message: string;
    title: string;
    customerRead: boolean;
    proRead: boolean;
    date: string;
    createdAt: Date;
    customTitle ?: string;
    customMessage ?: string;
    oldDate ?: any;
    oldTime ?: any;
    oldLocation ?: string;
    reply ?: any[];
}

