
import * as ACT from './action'

const initForm = {
    username: '',
    emailadd: '',
    fullname: '',
    pwd: '',
    confpwd: ''
}

const initPermission = {
    hasDashboard: false,
    hasMembers: false,
    hasAdminUser: false
}

const initialState = {
	isLoading: false,
    isLoadingSuccess: false,
    isLoadingFailed: false,
    hasError: false,
    data: [],
    formdata: initForm,
    permissions: initPermission,
    errorMessage: '',
    modalType: -1,
    showModal: false,
    tabIndex: 0,
    isSave: false,
    isSaveSuccess: false,
    isSaveFailed: false,
    isDelete: false,
    isDeleteSuccess: false,
    isDeleteFailed: false,
    isSubmitting: false,
    isSubmitSuccess: false,
    isSubmitFailed: false,
    isGetting: false,
    isGetSuccess: false,
	isGetFailed: false,
}

function setPermissionValues(obj_arr, new_value) {

    for (const [key, value] of Object.entries(obj_arr)) {
        obj_arr = Object.assign({}, obj_arr, {
            [key]: new_value
        })
    }

    return obj_arr
}

export const rdAdminUser = (state = initialState, action)=>{
	switch(action.type){
		case ACT.ADMIN_LOAD:
			return Object.assign({}, state, {
				isLoading: false,
                isLoadingSuccess: false,
				hasError: false,
                errorMessage: '',
                modalType: -1,
                data: [],
                formdata: initForm,
                permissions: initPermission,
                isSaveSuccess: false,
                showModal: false,
                tabIndex: 0,
                isDelete: false,
                isDeleteSuccess: false,
                isDeleteFailed: false,
                isSubmitting: false,
                isSubmitSuccess: false,
                isSubmitFailed: false,
                isGetting: false,
                isGetSuccess: false,
                isGetFailed: false,
            })	
        case ACT.ADMIN_LOAD_SUCCESS:
            return Object.assign({}, state, {
                isLoading: false,
                isLoadingSuccess: true,
                hasError: false,
                errorMessage: '',
                data: action.data
            })
        case ACT.ADMIN_LOAD_FAILED:
            return Object.assign({}, state, {
                isLoad: false,
                isLoadSuccess: true,
                hasError: false,
                errorMessage: action.message
            })
        case ACT.ADMIN_SHOW_MODAL:
            return Object.assign({}, state, {
               showModal: true,
               modalType: action.mtype,
            //    formdata: _.isEmpty(action.item)?initForm:action.item,
            //    permissions: _.isEmpty(action.item)?initPermission:action.item
            })
        case ACT.ADMIN_CLOSE_MODAL:
            return Object.assign({}, state, {
                hasError: false,
                errorMessage: '',
                showModal: false,
                formdata: initForm,
                formdata: initPermission,
                tabIndex: 0,
            })
        case ACT.ADMIN_FORM_CHANGED:
            return Object.assign({}, state, {
                hasError: false,
                errorMessage: '',
                formdata: Object.assign({}, state.formdata, {
                    [action.field]: action.value
                })
            })
        case ACT.ADMIN_PERMISSION_CHANGED:
            return Object.assign({}, state, {
                hasError: false,
                errorMessage: '',
                permissions: Object.assign({}, state.permissions, {
                    [action.field]: action.value
                })
            })
        case ACT.ADMIN_PERMISSION_SELECT_ALL:
            return Object.assign({}, state, {
                permissions: setPermissionValues(state.permissions, action.value)
            })
        case ACT.ADMIN_CHANGE_TAB:
            return Object.assign({}, state, {
                tabIndex: action.i,
                hasError: false,
                errorMessage: ''
            })
        case ACT.ADMIN_SAVE:
            return Object.assign({}, state, {
                isLoading: false,
                isLoadingSuccess: false,
                errorMessage: '',				
                hasError: false,   
                isSave: true,
                isSaveSuccess: false			
            })		
        case ACT.ADMIN_SAVE_SUCCESS:
            return Object.assign({}, state, {	
                isSave: false,	
                isSaveSuccess: true
            })		
        case ACT.ADMIN_SAVE_FAILED:
            return Object.assign({}, state, {		
                isSave: false,	
                isSaveSuccess: false,
                errorMessage: action.message,				
                hasError: true						
            })
        case ACT.ADMIN_CHANGEPWD_SUBMIT:
            return Object.assign({}, state, {
                isSubmitting: true,
                isSubmitSuccess: false,
                isSubmitFailed: false,
                hasError: false,       
            })	
        case ACT.ADMIN_CHANGEPWD_SUBMIT_SUCCESS:
            return Object.assign({}, state, {
                isSubmitting: false,
                isSubmitSuccess: true,
                isSubmitFailed: false,
                hasError: false
            })
        case ACT.ADMIN_CHANGEPWD_SUBMIT_FAILED:
            return Object.assign({}, state, {
                isSubmitting: false,
                isSubmitSuccess: false,
                isSubmitFailed: true,
                hasError: true,
                errorMessage: action.message
            })	
        case ACT.ADMIN_DELETE:
            return Object.assign({}, state, {
                isLoading: false,
                isLoadingSuccess: false,
                errorMessage: '',				
                hasError: false,   
                isDelete: true,
                isDeleteSuccess: false			
            })		
        case ACT.ADMIN_DELETE_SUCCESS:
            return Object.assign({}, state, {	
                isDelete: false,	
                isDeleteSuccess: true,
                formdata: initForm
            })		
        case ACT.ADMIN_DELETE_FAILED:
            return Object.assign({}, state, {		
                isDelete: false,	
                isDeleteSuccess: false,
                errorMessage: action.message,				
                hasError: true						
            })
        case ACT.ADMIN_GET:
            return Object.assign({}, state, {
                errorMessage: '',				
                hasError: false,   
                isGetting: true,
                isGetSuccess: false,
                isGetFailed: false,
                formdata: initForm,
                permissions: initPermission		
            })		
        case ACT.ADMIN_GET_SUCCESS:
            return Object.assign({}, state, {	
                errorMessage: '',				
                hasError: false,   
                isGetting: false,
                isGetSuccess: true,
                isGetFailed: false,
                formdata: _.isEmpty(action.data)?initForm:action.data,
                permissions: _.isEmpty(action.data)?initPermission:action.data
            })		
        case ACT.ADMIN_GET_FAILED:
            return Object.assign({}, state, {		
                isGetting: false,
                isGetSuccess: false,
                isGetFailed: true,
                errorMessage: action.message,				
                hasError: true						
            })
		default:
			return state
	}	
}