import React, { Component}  from 'react'
import { ClipLoader } from 'react-spinners';

class ButtonWithLoader extends Component {

    handleClick(){
        this.props.onClick()
    }

    render(){
        var loaderBtn = null
        if (this.props.isLoading){
            loaderBtn = <span><ClipLoader color={'#fff'} size={20} loading={true} />&nbsp;&nbsp;</span>
        }
        return(
            <button disabled={this.props.isDisabled || this.props.isLoading} className={this.props.classNames} onClick={this.handleClick.bind(this)} type={this.props.type}>
                {loaderBtn}
                {this.props.children}
            </button>
        )
    }
}

export default ButtonWithLoader