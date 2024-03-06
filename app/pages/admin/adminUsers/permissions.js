import React, { useState, useEffect  } from 'react';
import { connect, useDispatch } from 'react-redux';
import _ from 'lodash'
import ButtonWithLoader from '../../../components/ButtonWithLoader'
import ButtonWithDisabling from '../../../components/ButtonWithDisabling'

export function Permissions(props){

    const [pCount, setPCount] = useState(0)
    const [isSelectSuccess, setSelectState] = useState(false)

    const { permissions, modalType, hasError, errorMessage, formdata } = props
    
    useEffect(()=>{
        var checks = document.querySelectorAll(".custom-control-input.checked");
        setPCount(checks.length)
	},[])

    const handleToggleChange = (e) =>{
        setSelectState(false)
        if(e.target.name == "hasMembers" && e.target.value == "true"){
            props.onPermissionChanged("hasAutoReferral", false)
        }
        props.onPermissionChanged(e.target.name, e.target.value == "false" ? true : false)
        setSelectState(true)
    }

    const handleSelectAll = () =>{
        setSelectState(false)
        if(pCount == 3){
            props.onSelectAll(false)
        }else{
            props.onSelectAll(true)
        }
        setSelectState(true)
    }

    useEffect(()=>{
        if(isSelectSuccess){
            var checks = document.querySelectorAll(".custom-control-input.checked");
            setPCount(checks.length)
            setSelectState(false)
            // if(permissions.hasSettings){
            //     if(permissions.hasSGeneral == false && permissions.hasSCategory == false && permissions.hasSServiceCategory == false && permissions.hasSTelco == false && permissions.hasSBillers == false &&
            //         permissions.hasSIndustry == false && permissions.hasSBanks == false && permissions.hasSHubPm == false && permissions.hasSValidID == false && permissions.hasSDPolicy == false && permissions.hasSCashServices == false &&
            //         permissions.hasSExpCategory == false){
            //         props.onPermissionChanged("hasSettings", false)
            //     }
            // }
        }
    },[isSelectSuccess])

    var isAdmin = false
    
    return (
        <React.Fragment>
            <div className='d-flex'>
                <div className="custom-control custom-checkbox mb-2 mr-2 ml-auto">
                    <input type="checkbox"
                        className="custom-control-input"
                        id="selectAll"
                        checked={pCount == 3}
                        onChange={handleSelectAll}/>
                    <label className="custom-control-label" htmlFor="selectAll">Select All</label>
                </div>
            </div>
            <table className="table table-sm table-bordered mb-3">
                <thead className = "thead-light">
                    <tr>
                        <th>Module</th>
                        <th style = {{width:"85px", textAlign:"center"}}>Access</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{verticalAlign: "middle", fontWeight: 600}}>Dashboard</td>
                        <td className = "text-center">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox"
                                    className={permissions.hasDashboard?"custom-control-input checked":"custom-control-input"}
                                    id="hasDashboard"
                                    name = "hasDashboard"
                                    value = {permissions.hasDashboard}
                                    checked={permissions.hasDashboard}
                                    onChange={handleToggleChange}/>
                                <label className="custom-control-label" htmlFor="hasDashboard"/>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{verticalAlign: "middle", fontWeight: 600}}>Members</td>
                        <td className = "text-center">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox"
                                    className={permissions.hasMembers?"custom-control-input checked":"custom-control-input"}
                                    id="hasMembers"
                                    name = "hasMembers"
                                    value = {permissions.hasMembers}
                                    checked={permissions.hasMembers}
                                    onChange={handleToggleChange}/>
                                <label className="custom-control-label" htmlFor="hasMembers"/>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{verticalAlign: "middle", fontWeight: 600}}>Admin User</td>
                        <td className = "text-center">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox"
                                    className={permissions.hasAdminUser?"custom-control-input checked":"custom-control-input"}
                                    id="hasAdminUser"
                                    name = "hasAdminUser"
                                    value = {permissions.hasAdminUser}
                                    checked={permissions.hasAdminUser}
                                    onChange={handleToggleChange}/>
                                <label className="custom-control-label" htmlFor="hasAdminUser"/>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </React.Fragment>

        );

}

export default Permissions;
