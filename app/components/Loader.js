import React, { Component}  from 'react'
import { BeatLoader } from 'react-spinners';

function Loader(props){

    return(
        <div className='loader-ctr'>
            <BeatLoader color='#e13939' size={15} loading={true} />
            <span>{props.label?props.label:"Loading, Please wait.."}</span>
        </div>
    )
}

export default Loader