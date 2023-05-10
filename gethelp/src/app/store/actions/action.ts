import { Action } from '@ngrx/store';
import { User } from 'firebase/auth';
import { WorkOrder } from 'src/app/models/work-order.model';

export const CREATE_WORKORDER = 'CREATE_WORKORDER';
export const SET_USER_INFO = 'SET_USER_INFO';

export type AuthUser = {
    user: User | null
};

enum ActionTypes {
    CREATE_WORKORDER = 'CREATE_WORKORDER',
    SET_USER_INFO = 'SET_USER_INFO',
    INIT = 'init'
};

export class CreateWorkOrder implements Action {
    readonly type = ActionTypes.CREATE_WORKORDER
    constructor(public payload: WorkOrder){}
}

export class SetUserInfo implements Action {
    readonly type = ActionTypes.SET_USER_INFO
    constructor(public payload: AuthUser){}
}
