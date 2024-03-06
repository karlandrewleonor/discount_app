import callApi from '../../utils/apiCaller'

export const LOGIN_LOAD = 'LOGIN_LOAD'
export const LOGIN_FORM_CHANGED = 'LOGIN_FORM_CHANGED'
export const LOGIN_LOGGING = 'LOGIN_LOGGING'
export const LOGIN_LOGGING_SUCCESS = 'LOGIN_LOGGING_SUCCESS'
export const LOGIN_LOGGING_FAILED = 'LOGIN_LOGGING_FAILED'

export const LOGIN_SHOW_FORGOT = 'LOGIN_SHOW_FORGOT'
export const LOGIN_CLOSE_FORGOT = 'LOGIN_CLOSE_FORGOT'
export const LOGIN_SUBMIT = 'LOGIN_SUBMIT'
export const LOGIN_SUBMIT_SUCCESS = 'LOGIN_SUBMIT_SUCCESS'
export const LOGIN_SUBMIT_FAILED = 'LOGIN_SUBMIT_FAILED'
export const LOGIN_FORGOT_CLEAR_ERR = 'LOGIN_FORGOT_CLEAR_ERR'

export function formChange(field, value){
	return{
		type: LOGIN_FORM_CHANGED,
		field,
		value
	}
}

export function pageLoad(){
	return{
        type: LOGIN_LOAD        
	}
}

export function logging(){
	return{
        type: LOGIN_LOGGING        
	}
}

export function loginSuccess(data){
	return{
        type: LOGIN_LOGGING_SUCCESS,
        data
	}
}

export function loginFailed(message){
	return{
		type: LOGIN_LOGGING_FAILED,		
		message
	}
}

export function forgotClearErr(){
	return{
        type: LOGIN_FORGOT_CLEAR_ERR        
	}
}


export function submit(){
	return{
        type: LOGIN_SUBMIT        
	}
}

export function submitSuccess(){
	return{
        type: LOGIN_SUBMIT_SUCCESS        
	}
}

export function submitFailed(message){
	return{
		type: LOGIN_SUBMIT_FAILED,		
		message
	}
}


export function showForgot(){
	return{
        type: LOGIN_SHOW_FORGOT        
	}
}

export function closeForgot(){
	return{
        type: LOGIN_CLOSE_FORGOT        
	}
}


export function loginNow(data){     
    
	return dispatch=>{		
        dispatch(logging())
		return callApi('auth','post', data).then(ret=>{	
			if (ret.status==1){
				localStorage.setItem('token', ret.token);
				localStorage.setItem('userinfo', JSON.stringify(ret.data));		
				dispatch(loginSuccess());
			}else{
				dispatch(loginFailed(ret.message))
			}						
		})
		.catch(error=> { 		
			console.log(error)		
			dispatch(loginFailed(error))			
		})		
	}
}

export function submitNow(data){     
	return dispatch=>{		
        dispatch(submit())
        return setTimeout(() => {
			dispatch(submitSuccess())
		}, 1000);
		// return callApi('forgot/'+data).then(ret=>{			
		// 	if (ret.status==1){			
		// 		dispatch(submitSuccess());
		// 	}else{
		// 		dispatch(submitFailed(ret.message))
		// 	}						
		// })
		// .catch(error=> { 		
		// 	console.log(error)		
		// 	dispatch(submitFailed(error))			
		// })		
	}
}