import React from 'react';
import { Route, IndexRedirect, IndexRoute } from 'react-router';
import App from './pages/app';

import Admin from './pages/admin/index'
import Login from './pages/login/index'
import AdminUsers from './pages/admin/adminUsers/index'

/*
 * @param {Redux Store}
 * We require store as an argument here because we wish to get
 * state from the store after it has been authenticated.
 */
export default (store) => {

	return (
		<Route path="/" component={App}>

			<IndexRoute component={Login} />

			<Route path="/login" component={Login} />

			<Route path="/admin" component={Admin}>
				<IndexRoute component={AdminUsers} />
				<Route path="/adminusers" component={AdminUsers} />
			</Route>

		</Route>
	);
};

