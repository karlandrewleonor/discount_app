
import React, {Component} from 'react'
import PropTypes from 'prop-types';

class SideBarNavItem extends Component {

 	handleMenuClick(url,e){
		this.context.router.push(this.props.to)
    }

	render(){
		const isActive = this.context.router.isActive(this.props.to)
		const className = isActive ? 'active' : '';

		return(
				<li className={className}>
					<button className="btn btn-block"  onClick={this.handleMenuClick.bind(this)}>
						{
							this.props.ic?
							<i className={this.props.ic}></i>
							:null
						}
                        <span>{this.props.label}</span>
					</button>
				</li>

			)
	}
}

SideBarNavItem.contextTypes = {
    router: PropTypes.object
}
export default SideBarNavItem