import React, { Component}  from 'react'

class ButtonWithDisabling extends Component {

    handleClick(){
        this.props.onClick()
    }

    render(){        
        var disable=""
        if (this.props.isLoading){            
            disable="disabled"
        }  
        return(
            <button disabled={disable} className={this.props.classNames} onClick={this.handleClick.bind(this)} type={this.props.type}>               
                {this.props.children}
            </button>
        )
    }
}

export default ButtonWithDisabling