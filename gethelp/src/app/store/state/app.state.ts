import { User } from 'firebase/auth';
import { WorkOrder } from '../../models/work-order.model';

export interface WorkOrderAppState {
   workorder: WorkOrder;
}

export interface UserAuthState {
   user: User | null;
}

export type AppState = WorkOrderAppState & UserAuthState
