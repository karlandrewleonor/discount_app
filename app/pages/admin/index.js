import React, { Component, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SideBarNavItem from '../../components/SideBarNavItem'
import biglogo from '../../images/logo.png'
import Header from '../../components/Header'
import { connect } from 'react-redux';

function Index(props) {

	const [user, setUser] = useState()

	useEffect(() => {
		window.scrollTo(0, 0)
		var userinfo = JSON.parse(localStorage.getItem('userinfo'));
		setUser(userinfo)
	}, [])

	return (
		<div id="main-body" className="has-sidebar">
			<div className="position-fixed nav-container" style={{ top: 0, zIndex: 999 }}>
				<nav id="sidebar">
					<div className="sidebar-header content-center">
						<img src={biglogo} className="img-fluid" />
						<p className="company-name">Discount App</p>
					</div>
					<div className="navigations">
						<ul className="list-unstyled components">
							<SideBarNavItem to="/adminusers" ic="fas fa-user-cog" label="Admin Users" />
						</ul>
					</div>
				</nav>
			</div>
			<Header {...props} />
			<div id="maincontent" className="content">
				{props.children}
			</div>
		</div>
	)
}

function mapStateToProps(state) {
	return {
		currentRoute: state.currentRoute,
		headerLoad: state.headerLoad
	};
}

export default connect(mapStateToProps, null)(Index);