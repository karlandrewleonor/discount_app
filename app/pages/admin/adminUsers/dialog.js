import React, { useEffect } from 'react';
import Modal from 'react-responsive-modal';
import _ from 'lodash'
import ButtonWithLoader from '../../../components/ButtonWithLoader'
import ButtonWithDisabling from '../../../components/ButtonWithDisabling'
import Permissions from './permissions'


const modalStyle = {
    modal: {
        padding: 0,
        background: 'transparent',
        width: "100%"
    },
    overlay: {
        alignItems: 'center'
    }
}

export function Dialog(props){
    

    const { showModal, formdata, permissions, modalType, hasError, errorMessage, tabIndex, isSubmitFailed } = props
    
    const handleCloseModal = () =>{
        props.onCloseModal()
    }

    const handleFormChanged = (e) =>{
        props.onFormChanged(e.target.name, e.target.value)
    }

    const handleClickPill = (i) =>{
        props.onChangeTab(i)	
    } 

    const handleSave = () =>{
        if(_.isEmpty(formdata.username)){
            props.onSaveFailed('Please enter username')
        }else if (/^[a-zA-Z0-9-,_]*$/.test(formdata.username)==false){
            props.onSaveFailed("Username must not contain special characters.")
        }else if (formdata.username.length<6){
            props.onSaveFailed("Username is too short. (6 characters)")
        }else if(_.isEmpty(formdata.emailadd)){
            props.onSaveFailed('Please enter email address')
        }else if(_.isEmpty(formdata.fullname)){
            props.onSaveFailed('Please enter your name')
        }else if(_.isEmpty(formdata.pwd)){
            props.onSaveFailed('Please enter password')
        }else if(formdata.pwd.length<8){
            props.onSaveFailed('Password is too short (8 characters)')
        }else if(_.isEmpty(formdata.confpwd)){
            props.onSaveFailed('Please confirm new password')
        }else if(formdata.pwd != formdata.confpwd ){
            props.onSaveFailed('Password did not match')
        }else if (permissions.hasDashboard == 0 &&  permissions.hasMembers == 0 && permissions.hasAdminUser == 0){
            props.onSaveFailed('Please check atleast one permission')
        }else{
            var data = {
                formdata: formdata,
                permissions: permissions
            }
            props.onSaveNow(data)
        }
    }

    const handleUpdate = () =>{
        if(_.isEmpty(formdata.username)){
            props.onSaveFailed('Please enter username')
        }else if (/^[a-zA-Z0-9-,_]*$/.test(formdata.username)==false){
            props.onSaveFailed("Username must not contain special characters.")
        }else if (formdata.username.length<6){
            props.onSaveFailed("Username is too short. (6 characters)")
        }else if(_.isEmpty(formdata.emailadd)){
            props.onSaveFailed('Please enter email address')
        }else if(_.isEmpty(formdata.fullname)){
            props.onSaveFailed('Please enter your name')
        }else{
            var data = {
                formdata: formdata,
                permissions: permissions
            }
        
            props.onUpdateNow(data)
        }
    }

    const handleSubmit = () =>{

        var data = {
            admin_id: formdata._id,
            pwd: formdata.pwd,         
        }

        if(_.isEmpty(formdata.pwd)){
            props.onSubmitFailed('Please enter password')
        }else if(formdata.pwd.length<8){
            props.onSubmitFailed('Password is too short (8 characters)')
        }else if(_.isEmpty(formdata.confpwd)){
            props.onSubmitFailed('Please confirm new password')
        }else if(formdata.pwd != formdata.confpwd ){
            props.onSubmitFailed('Password did not match')
        }else{
            props.onSubmitNow(data)
        }
        
    }

    const handleYes  = () =>{
        props.onDeleteNow(formdata._id)
    }

    var errorBox = null
    if (hasError){
        errorBox = <div className="box-error d-flex">
                        <i className="fas fa-exclamation-triangle"></i>                        
                        <p>{errorMessage}</p>
                    </div>
    }

    var navv = null
    if (modalType == 1) {
        navv = <nav className="nav nav-pills position-relative">
                    <li className="nav-item">
                        <a className={tabIndex == 0 ? 'nav-link active' : 'nav-link'} href="javascript:void(0)" onClick={() => handleClickPill(0)}>Information</a>
                    </li>
                    <li className="nav-item">
                        <a className={tabIndex == 1 ? 'nav-link active' : 'nav-link'} href="javascript:void(0)" onClick={() => handleClickPill(1)}>Permissions</a>
                    </li>
                    <li className="nav-item">
                        <a className={tabIndex == 2 ? 'nav-link active' : 'nav-link'} href="javascript:void(0)" onClick={() => handleClickPill(2)}>Password</a>
                    </li>
                </nav>
    }else{
        navv = <nav className="nav nav-pills position-relative">
                    <li className="nav-item">
                        <a className={tabIndex == 0 ? 'nav-link active' : 'nav-link'} href="javascript:void(0)" onClick={() => handleClickPill(0)}>Information</a>
                    </li>
                    <li className="nav-item">
                        <a className={tabIndex == 1 ? 'nav-link active' : 'nav-link'} href="javascript:void(0)" onClick={() => handleClickPill(1)}>Permissions</a>
                    </li>
                </nav>
    }

    var infoTab = null
    var action_btns = null
    if(tabIndex==0){
        if(modalType == 0){
            infoTab = <div>
                        {errorBox}
                        <form>
                            <div className="form-group">
                                <label htmlFor="username" className = "m-0">Username</label>
                                <input  type="text" 
                                        className="form-control" 
                                        id="username"
                                        name="username"
                                        maxLength={20}
                                        value={formdata.username}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fullname" className = "m-0">Fullname</label>
                                <input  type="text"
                                        className="form-control"
                                        id="fullname"
                                        name="fullname"
                                        value={formdata.fullname}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="emailadd" className = "m-0">Email</label>
                                <input  type="text"
                                        className="form-control"
                                        id="emailadd"
                                        name="emailadd"
                                        value={formdata.emailadd}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="pwd" className = "m-0">Password</label>
                                <input  type="password"
                                        className="form-control"
                                        id="pwd"
                                        name="pwd"
                                        maxLength={20}
                                        // value={formdata.pwd}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confpwd" className = "m-0">Confirm Password</label>
                                <input  type="password"
                                        className="form-control"
                                        id="confpwd"
                                        name="confpwd"
                                        maxLength={20}
                                        // value={formdata.confpwd}
                                        onChange={handleFormChanged}/>
                            </div> 
                        </form>
                    </div>

            action_btns = <div className="d-flex justify-content-end">                                    
                            <ButtonWithDisabling  classNames="btn btn-link" onClick={handleCloseModal}>Cancel</ButtonWithDisabling>
                            <ButtonWithLoader  classNames="btn primary-btn" onClick={handleSave}>Save</ButtonWithLoader>
                        </div>
                    
        }else{
            infoTab =   <div>
                        {errorBox}
                        <form>
                            <div className="form-group">
                                <label htmlFor="username" className = "m-0">Username</label>
                                <input  type="text" 
                                        className="form-control" 
                                        id="username"
                                        name="username"
                                        maxLength={20}
                                        value={formdata.username}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fullname" className = "m-0">Fullname</label>
                                <input  type="text"
                                        className="form-control"
                                        id="fullname"
                                        name="fullname"
                                        value={formdata.fullname}
                                        onChange={handleFormChanged}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="emailadd" className = "m-0">Email</label>
                                <input  type="text"
                                        className="form-control"
                                        id="emailadd"
                                        name="emailadd"
                                        value={formdata.emailadd}
                                        onChange={handleFormChanged}/>
                            </div>
                        </form>
                    </div>
               action_btns =    <div className="d-flex justify-content-end">                                    
                                    <ButtonWithDisabling  classNames="btn btn-link" onClick={handleCloseModal} >Cancel</ButtonWithDisabling>
                                    <ButtonWithLoader  classNames="btn primary-btn" onClick={handleUpdate}>Update</ButtonWithLoader>
                                </div>
            }
    }else if(tabIndex==1){
        if(modalType == 0){
            infoTab =   <div style={{ maxHeight: 500, overflow: "auto" }}>
                            {errorBox}
                            <Permissions {...props} permissions={permissions}/>
                        </div>
            action_btns =   <div className="d-flex justify-content-end">                                    
                                <ButtonWithDisabling  classNames="btn btn-link" onClick={handleCloseModal} >Cancel</ButtonWithDisabling>
                                <ButtonWithLoader  classNames="btn primary-btn" onClick={handleSave}>Save</ButtonWithLoader>
                            </div>
        }else{
            infoTab =   <div style={{ maxHeight: 500, overflow: "auto" }}>
                            {errorBox}
                            <Permissions {...props} permissions={permissions}/>
                        </div>
            action_btns =  <div className="d-flex justify-content-end">                                    
                                <ButtonWithDisabling  classNames="btn btn-link" onClick={handleCloseModal} >Cancel</ButtonWithDisabling>
                                <ButtonWithLoader  classNames="btn primary-btn" onClick={handleUpdate}>Update</ButtonWithLoader>
                            </div>
        }

    }else if(tabIndex==2){
        infoTab =
                <div>
                {errorBox}
                <form>
                    <div className="form-group">
                        <label htmlFor="pwd" className = "m-0">Password</label>
                        <input  type="password"
                                className="form-control"
                                id="pwd"
                                name="pwd"
                                maxLength={20}
                                // value={formdata.pwd}
                                onChange={handleFormChanged}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confpwd" className = "m-0">Confirm Password</label>
                        <input  type="password"
                                className="form-control"
                                id="confpwd"
                                name="confpwd"
                                maxLength={20}
                                // value={formdata.confpwd}
                                onChange={handleFormChanged}/>
                    </div>
                </form>
                </div>
        action_btns =   <div className="d-flex justify-content-end">                                    
                            <ButtonWithLoader  classNames="btn primary-btn" onClick={handleSubmit}>Change Password</ButtonWithLoader>
                        </div>
    }
    var content = null
    if(modalType == 0){
        content = <div className="modal-content" style = {{borderTopLeftRadius:0, borderTopRightRadius:0, border:'none'}}>
                    {navv}
                    {infoTab}
                    {action_btns}
                </div>

    }else if(modalType == 1){
        content = <div className="modal-content" style = {{borderTopLeftRadius:0, borderTopRightRadius:0, border:'none'}}>
                    {navv}
                    {infoTab}
                    {action_btns}
                </div>
    }else if(modalType == 2){
        content =  <div className="modal-content">
                        <label className = "modal-title">Delete Confirmation</label>
                        <div className="mt-3">
                        <div className="form-group">
                            {errorBox}
                            <label className = "m-0">
                                Are you sure you want to Delete?
                            </label>
                        </div>
                        </div>
                        <div className="d-flex justify-content-end">                                    
                            <ButtonWithDisabling  classNames="btn btn-link" onClick={handleCloseModal}>No</ButtonWithDisabling>
                            <ButtonWithLoader  classNames="btn primary-btn" onClick={handleYes}>Yes</ButtonWithLoader>
                        </div>
                    </div> 
    }
    
    return (
        
        <Modal
            open={showModal} 
            showCloseIcon={tabIndex==2}   
            styles={modalStyle} 
            closeOnOverlayClick={false}
            onClose={handleCloseModal}
            > 
                {content}
        </Modal>
        
        
    );
}

export default Dialog;
