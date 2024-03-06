import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import hbrwhite from '../images/hbrwhite.png'
import biglogo from '../images/big_logo.png'
import SideBarNavItem from './SideBarNavItem'

 class SideBar extends Component {
    constructor(props) {
	super(props);
	this.state = {user: ''}
  }

  componentDidMount(){
	window.scrollTo(0, 0)       
	var userinfo = JSON.parse(localStorage.getItem('userinfo'));       
	this.setState({ user: userinfo})
}

  render() {
	const {user} = this.state
	
    return (
        <div className = "wrapper">
            <nav id = "sidebar">
				<div className="sidebar-header content-center">
					<img src={biglogo} className="img-fluid"/>
					<p className = "company-name">health & beauty republic</p>
				</div>
				<div className = "navigations">
					<ul className = "list-unstyled components">
						{user.isDashboard == 1?<SideBarNavItem to="/dashboard" ic="fal fa-home" label="Dashboard"/>:''}
						{user.isMember == 1? <SideBarNavItem to="/member" ic="fal fa-coins" label="Members"/>:''}
						{user.isNetwork ==1?<SideBarNavItem to="/startup" ic="fas fa-sitemap" label="Startup Plan"/>:''}
						<SideBarNavItem to="/businesscenter" ic="fal fa-sitemap" label="Business Center"/>
						{user.isCodes == 1?<SideBarNavItem to="/codes/list" ic="fal fa-sitemap" label="Activation codes"/>:''}
						<SideBarNavItem to="/productcode/list" ic="fal fa-sitemap" label="Product Codes"/>
						{user.isPayout == 1?<SideBarNavItem to="/payout" ic="fas fa-wallet" label="Payout"/>:''}
						{user.isReports == 1?<SideBarNavItem to="/reports" ic="fas fa-wallet" label="Reports"/>:''}
						{user.isSettings == 1?<SideBarNavItem to="/settings" ic="fas fa-wallet" label="Settings"/>:''}

					</ul>
				</div>
			</nav>
      </div>
        
    );
  }
}


SideBar.contextTypes = {
    router: PropTypes.object,
};
  

export default connect()(SideBar)
