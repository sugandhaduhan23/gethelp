import { WorkOrder } from '../../models/work-order.model';
import { AppState } from '../state/app.state';
import {
    CreateWorkOrder,
    CREATE_WORKORDER,
    SET_USER_INFO,
    SetUserInfo
} from '../actions/action';



const newState = (state: AppState, newData: any) =>  Object.assign({}, state, newData);

export function workOrderReducer(state: any, action: CreateWorkOrder)  {
  switch (action.type) {
    case CREATE_WORKORDER:
        return newState(state, {
            ...state,
            ...action.payload,
        });

    default:
        return {
            ...state,
        };
    }
}


export function UserReducer(state: any, action: SetUserInfo)  {
    switch (action.type) {
      case SET_USER_INFO:
        return newState(state, {
            ...state,
            ...action.payload
        })
        default:
            return {
                ...state,
            };
        }
  }