export const DISMISS_MESSAGE = 'DISMISS_MESSAGE';
export const CREATE_REQUEST = 'CREATE_REQUEST';
export const REQUEST_SUCCESS = 'REQUEST_SUCCESS';
export const REQUEST_FAILURE = 'REQUEST_FAILURE';
export const ROUTES_CHANGE = 'ROUTES_CHANGE';

export function routeChanged(path){	
	return{
		type: ROUTES_CHANGE,		
		path
	}
}
