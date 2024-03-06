import * as ACT from './action'

const initData = { 
    username: '',
	password: '',
	emailadd: ''
}

const initialState = {
	isLogging: false,
	isLoginSuccess: false,
	hasError: false,
    errorMessage: '',    
    data: initData,
    showForgot: false,
	isSubmitting: false,
	isSubmitSuccess: false,
	isSubmitHasError: false
}

export const rdLogin = (state = initialState, action)=>{
	switch(action.type){
		case ACT.LOGIN_LOAD:
			return Object.assign({}, state, {
				isLogging: false,
	            isLoginSuccess: false,
				errorMessage: '',				
				hasError: false,      
				data: initData,
			})
		case ACT.LOGIN_FORM_CHANGED:
			return Object.assign({}, state, {				
				errorMessage: '',				
				hasError: false,      
				data: Object.assign({}, state.data, {
                    [action.field]: action.value
                })     
            })	
        case ACT.LOGIN_LOGGING:
            return Object.assign({}, state, {
                isLogging: true,
                isLoginSuccess: false,
                errorMessage: '',				
                hasError: false				
            })
        case ACT.LOGIN_LOGGING_SUCCESS:
            return Object.assign({}, state, {
                isLogging: false,
                isLoginSuccess: true,
                errorMessage: '',				
                hasError: false				
            })
        case ACT.LOGIN_LOGGING_FAILED:
            return Object.assign({}, state, {
                isLogging: false,
                isLoginSuccess: false,
                errorMessage: action.message,				
                hasError: true				
            })
        case ACT.LOGIN_SHOW_FORGOT:
			return Object.assign({}, state, {
				showForgot: true,
				data: Object.assign({}, state.data, {
                    email: ''
                })  
			})	
		case ACT.LOGIN_CLOSE_FORGOT:
			return Object.assign({}, state, {
				isSubmitting: false,
				isSubmitSuccess: false,
				isSubmitHasError: false,
				showForgot: false,
				errorMessage: '',				
                hasError: false				
			})			
		case ACT.LOGIN_SUBMIT:
			return Object.assign({}, state, {
				isSubmitting: true,
				isSubmitSuccess: false,
				isSubmitHasError: false,			
			})		
		case ACT.LOGIN_SUBMIT_SUCCESS:
			return Object.assign({}, state, {
				isSubmitting: false,
				isSubmitSuccess: true,
				isSubmitHasError: false	
			})	
		case ACT.LOGIN_SUBMIT_FAILED:
			return Object.assign({}, state, {
				isSubmitting: false,
				isSubmitSuccess: false,
				isSubmitHasError: true,	
				errorMessage: action.message		
			})	
		case ACT.LOGIN_FORGOT_CLEAR_ERR:
			return Object.assign({}, state, {
				isSubmitHasError: false,	
				errorMessage: ''			
			})		
		default:
			return state
	}	
}