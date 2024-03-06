import React, { useEffect, useState } from 'react'
import { routeChanged } from '../../../types/index'
import { connect, useDispatch } from 'react-redux';
import { init, formChanged, openModal, closeModal, changeTab, saveNow, saveFailed, updateNow,
	submitNow, changePwdSubmitFailed, deleteNow, permisisonChanged, selectAll, getNow } from './action'
import Dialog from './dialog'
import DataTable from 'react-data-table-component';

export function Index(props) {

	const dispatch = useDispatch()
	
	const [user, setUser] = useState({});

	const { data, errorMessage, isSaveSuccess, isSubmitSuccess, isDeleteSuccess } = props

    useEffect(() => {
		dispatch(routeChanged("Admin Users"))
		const token = localStorage.getItem('token');
		if (_.isEmpty(token)) {
			history.push("/login")
		}else{
			var userinfo = JSON.parse(localStorage.getItem('userinfo'));
			setUser(userinfo)
		  	props.onInit()
		}
	}, [])

	const handleOpenModal = (mtype, item) =>{
		props.onOpenModal(mtype, item)
		if(!_.isEmpty(item)){
			props.onGetNow(item._id)
		}
	}

	useEffect(()=>{
		if(isSaveSuccess){
			props.onInit()
		}else if(isSubmitSuccess){
			props.onInit()
		}else if(isDeleteSuccess){
			props.onInit()
		}else if (errorMessage=="InvalidToken") {
			localStorage.removeItem('userinfo');
			localStorage.removeItem('token');
			window.location = "/login"
		}
	}, [errorMessage, isSaveSuccess, isSubmitSuccess])

   const columns = [
			{
				name: 'Username',
				selector: 'username',
				sortable: true
			},
		    {
                name: 'Name',
                selector: 'fullname',
                sortable: true
			},
			{
                name: 'Email',
                selector: 'emailadd',
                sortable: true
            },
            {
                name: 'Action',
                cell: row => <div><center><a href="javascript:void(0)" onClick={()=>handleOpenModal(1, row)}>Edit</a>&nbsp;&nbsp;<a href="javascript:void(0)" onClick={()=>handleOpenModal(2, row)}>Delete</a></center></div>,
                sortable: false
            }
        ];


		var content = null
		content =  <div className="container">
							<div className="widget-container shadow-sm mt-3">
								<div className = "p-3 d-flex">
									<div className="ml-auto">
										<div className="input-group">
											<button className="btn add-btn" type="submit" onClick={()=>handleOpenModal(0, {})}>Add User</button>
										</div>
									</div>
								</div>  

								<div className="dtTable">
									<DataTable
										noHeader
										pagination
										columns={columns}
										data={data}
										customStyles={customStyles}
									/>
								</div>
							</div>
						</div>
						
      return (
				<div>
					<div>
						{content}
						<Dialog {...props}/>
					</div>
				</div>
			);
}

function mapStateToProps(state) {
    return {
        isLoading: state.adminuser.isLoading,
        hasError: state.adminuser.hasError,
        errorMessage: state.adminuser.errorMessage,
        showModal: state.adminuser.showModal,
        data: state.adminuser.data,
		formdata: state.adminuser.formdata,
		permissions: state.adminuser.permissions,
		modalType: state.adminuser.modalType,
		tabIndex: state.adminuser.tabIndex,
		isSave: state.adminuser.isSave,
        isSaveSuccess: state.adminuser.isSaveSuccess,
		isSaveFailed: state.adminuser.isSaveFailed,
		isSubmitting: state.adminuser.isSubmitting,
        isSubmitSuccess: state.adminuser.isSubmitSuccess,
		isSubmitFailed: state.adminuser.isSubmitFailed,
		isDelete: state.adminuser.isDelete,
        isDeleteSuccess: state.adminuser.isDeleteSuccess,
        isDeleteFailed: state.adminuser.isDeleteFailed,
    };
}


  const mapDispatchToProps = (dispatch)=>{
    return{
		onInit: (data) =>{
			dispatch(init(data))
		},
		onOpenModal: (mtype, item) =>{
			dispatch(openModal(mtype, item))
		},
		onCloseModal: () =>{
			dispatch(closeModal())
		},
		onFormChanged: (field,value) =>{
			dispatch(formChanged(field,value))
		},
		onChangeTab: (i)=>{
			dispatch(changeTab(i))
		},
		onSaveNow: (data) =>{
			dispatch(saveNow(data))
		},
		onSaveFailed: (message) =>{
			dispatch(saveFailed(message))
		},
		onUpdateNow: (data) =>{
			dispatch(updateNow(data))
		},
		onSubmitNow: (data)=>{
			dispatch(submitNow(data))
		},
		onSubmitFailed: (message) =>{
			dispatch(changePwdSubmitFailed(message))
		},
		onDeleteNow: (id) =>{
			dispatch(deleteNow(id))
		},
		onPermissionChanged: (field,value) =>{
			dispatch(permisisonChanged(field,value))
		},
		onSelectAll:(value)=>{
			dispatch(selectAll(value))
		},
		onGetNow: (id) =>{
			dispatch(getNow(id))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Index);

const customStyles = {
    rows: {
      style: {
        minHeight: '50px', // override the row height
        paddingLeft: "20px",
        paddingRight: "20px",
        fontSize: "14px",
        color: "#5c686d",
        '&:not(:last-of-type)': {
            borderBottomStyle: 'solid',
            borderBottomWidth: '1px',
            borderBottomColor: "#f3f3f3"
        }
      }
    },
    headCells: {
      style: {
        paddingLeft: "20px",
        paddingRight: "20px",
        fontSize: "14px",
        fontWeight: "800",
        backgroundColor: "#f5f5f5",
        color: "#1e2422"
      },
    },
    cells: {
      style: {
        paddingLeft: '8px', // override the cell padding for data cells
        paddingRight: '8px',
      },
    },
};