
import React, {Component} from 'react'
import PropTypes from 'prop-types';

class TabPill extends Component {

    handleMenuClick(url,e){		
		this.context.router.push(this.props.to)		
    }

	render(){
        const { router } = this.context		
		const isActive = router.isActive(this.props.to)		
		const className = isActive ? 'nav-link active' : 'nav-link';	
	    
		return(					
				<li className="nav-item">
					<a className={className} href="javascript:void(0)" onClick={this.handleMenuClick.bind(this)}>      										    
                        {this.props.label}				
					</a>
				</li>
				
			)
	}
}

TabPill.contextTypes = {
	router: PropTypes.object.isRequired
}
export default TabPill