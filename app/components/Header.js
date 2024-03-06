import React, { useState, useEffect } from 'react';
import { browserHistory } from 'react-router'

export function Index(props) {
	const history = browserHistory
	const [users, newUsers] = useState({ photo_thumb: '' })

	useEffect(() => {
		window.scrollTo(0, 0)
		var userinfo = JSON.parse(localStorage.getItem('userinfo'));
		newUsers(userinfo)
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('userinfo');

		history.push('/login')
	}

	const handleToggle = () => {
		var mainbody = document.getElementById("main-body")

		if (mainbody.classList.contains("has-sidebar")) {
			mainbody.classList.remove("has-sidebar")
		} else {
			mainbody.classList.add("has-sidebar")
		}
	}

	return (
		<nav id="sbNav" className="navbar navbar-expand-lg">
			<button className="btn toggle-btn"
				onClick={handleToggle}>
				<i className="fas fa-bars"></i>
			</button>
			<div className="navbar-brand">
				<label className="m-0">{props.currentRoute}</label>
			</div>
			<ul className="navbar-nav ml-auto">
				<li className="nav-item dropdown">
					<a className="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
						<span className="caret"></span>
						{_.isEmpty(users) ? '' : users.fullname}
					</a>
					<div className="dropdown-menu">
						<a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a>
					</div>
				</li>
			</ul>
		</nav>
	);
}

export default Index
