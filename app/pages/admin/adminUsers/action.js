import callApi from '../../../utils/apiCaller';

export const ADMIN_LOAD = "ADMIN_LOAD"
export const ADMIN_LOAD_SUCCESS = "ADMIN_LOAD_SUCCESS"
export const ADMIN_LOAD_FAILED = "ADMIN_LOAD_FAILED"

export const ADMIN_FORM_CHANGED = "ADMIN_FORM_CHANGED"
export const ADMIN_PERMISSION_CHANGED = "ADMIN_PERMISSION_CHANGED"
export const ADMIN_PERMISSION_SELECT_ALL = "ADMIN_PERMISSION_SELECT_ALL"
export const ADMIN_CHANGE_TAB = 'ADMIN_CHANGE_TAB'

export const ADMIN_SHOW_MODAL = "ADMIN_SHOW_MODAL"
export const ADMIN_CLOSE_MODAL = "ADMIN_CLOSE_MODAL"

export const ADMIN_SAVE = "ADMIN_SAVE"
export const ADMIN_SAVE_SUCCESS = "ADMIN_SAVE_SUCCESS"
export const ADMIN_SAVE_FAILED = "ADMIN_SAVE_FAILED"

export const ADMIN_CHANGEPWD_SUBMIT = "ADMIN_CHANGEPWD_SUBMIT"
export const ADMIN_CHANGEPWD_SUBMIT_SUCCESS = "ADMIN_CHANGEPWD_SUBMIT_SUCCESS"
export const ADMIN_CHANGEPWD_SUBMIT_FAILED = "ADMIN_CHANGEPWD_SUBMIT_FAILED"

export const ADMIN_DELETE = "ADMIN_DELETE"
export const ADMIN_DELETE_SUCCESS = "ADMIN_DELETE_SUCCESS"
export const ADMIN_DELETE_FAILED = "ADMIN_DELETE_FAILED"

export const ADMIN_GET = "ADMIN_GET"
export const ADMIN_GET_SUCCESS = "ADMIN_GET_SUCCESS"
export const ADMIN_GET_FAILED = "ADMIN_GET_FAILED"

export function getting(){
	return{
		type: ADMIN_GET
	}
}

export function getSuccess(data){
	return{
		type: ADMIN_GET_SUCCESS, data
	}
}

export function getFailed(message){
	return{
		type: ADMIN_GET_FAILED,
		message
	}
}

export function changePwdSubmit(){
	return{
		type: ADMIN_CHANGEPWD_SUBMIT
	}
}

export function changePwdSubmitSuccess(){
	return{
		type: ADMIN_CHANGEPWD_SUBMIT_SUCCESS
	}
}

export function changePwdSubmitFailed(message){
	return{
		type: ADMIN_CHANGEPWD_SUBMIT_FAILED,
		message
	}
}

export function load(){
	return{
        type: ADMIN_LOAD      
	}
}

export function loadSuccess(data){
	return{
        type: ADMIN_LOAD_SUCCESS, data     
	}
}

export function loadFailed(message){
	return{
        type: ADMIN_LOAD_FAILED, message     
	}
}


export function openModal(mtype, item){
	return{
        type: ADMIN_SHOW_MODAL, mtype, item   
	}
}

export function closeModal(){
	return{
        type: ADMIN_CLOSE_MODAL     
	}
}

export function formChanged(field,value){
	return{
        type: ADMIN_FORM_CHANGED, field, value     
	}
}

export function permisisonChanged(field,value){
	return{
        type: ADMIN_PERMISSION_CHANGED, field, value     
	}
}

export function selectAll(value){
	return {
		type: ADMIN_PERMISSION_SELECT_ALL,
        value
	}
}

export function changeTab(i){
	return{
        type: ADMIN_CHANGE_TAB,
        i 
	}
}

export function save(){
	return{
        type: ADMIN_SAVE    
	}
}

export function saveSuccess(data){
	return{
        type: ADMIN_SAVE_SUCCESS, data     
	}
}

export function saveFailed(message){
	return{
        type: ADMIN_SAVE_FAILED, message     
	}
}

export function deleteData(){
	return{
        type: ADMIN_DELETE   
	}
}

export function deleteSuccess(id){
	return{
        type: ADMIN_DELETE_SUCCESS, id     
	}
}

export function deleteFailed(message){
	return{
        type: ADMIN_DELETE_FAILED, message     
	}
}

export function init(){    
    return dispatch=>{		
        dispatch(load())
        return callApi('adminUser/all').then(ret=>{		
            if (ret.status==1){				
                dispatch(loadSuccess(ret.data));
            }else{
                dispatch(loadFailed(ret.message))
            }						
        })
        .catch(error=> { 		
            console.log(error)		
            dispatch(loadFailed(error))			
        })	
   }
 }

 export function saveNow(data){   
	return dispatch=>{		
		dispatch(save())
		return callApi('/adminUser/addAdmin','post', data).then(ret=>{	
			if (ret.status==1){
				dispatch(saveSuccess());
			}else{
				dispatch(saveFailed(ret.message))
			}						
		})
		.catch(error=> { 		
			console.log(error)		
			dispatch(saveFailed(error))			
		})		
	}
}


export function updateNow(data){    
    return dispatch=>{		
         dispatch(save())
         return callApi('adminUser/updateAdmin', 'post', data).then(ret=>{		
             if (ret.status==1){				                
                 dispatch(saveSuccess());
             }else{
                  dispatch(saveFailed(ret.message))
             }						
         })
         .catch(error=> { 		
             console.log(error)		
             dispatch(saveFailed(error))			
         })	
  }
}

export function submitNow(data){
	return dispatch=>{		
		 return callApi('adminUser/changepassword','post', data).then(ret=>{	
			 if (ret.status==1){	
				 dispatch(changePwdSubmitSuccess());
			 }else{
				  dispatch(changePwdSubmitFailed(ret.message))
			 }						
		 })
		 .catch(error=> {
			 console.log(error)		
			 dispatch(loadFailed(error))			
		 })	
   }
 }

 export function deleteNow(id){

    return dispatch =>{
        dispatch(deleteData())
        return callApi('adminUser/delete/'+id).then(ret=>{
            if(ret.status == 1){
                dispatch(deleteSuccess())
            }else{
                dispatch(deleteFailed(ret.message))
            }
        })
        .catch(error=>{
            console.log(error)
            dispatch(deleteFailed(error))
        })
    }
}

export function getNow(id){

    return dispatch =>{
        dispatch(getting())
        return callApi('adminUser/get/'+id).then(ret=>{
            if(ret.status == 1){
                dispatch(getSuccess(ret.data))
            }else{
                dispatch(getFailed(ret.message))
            }
        })
        .catch(error=>{
            console.log(error)
            dispatch(getFailed(error))
        })
    }
}