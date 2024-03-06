import express from 'express';
import * as adminUserCtlr from '../controllers/adminUserCtlr'
import * as memberCtlr from '../controllers/memberCtlr'
import * as earnCtlr from '../controllers/earnSettingsCtlr'

var nonRestrictedRoutes = express.Router();

nonRestrictedRoutes.post('/auth', function (req, res) {
	adminUserCtlr.login(req.body, res);
});

nonRestrictedRoutes.get('/earning-header/save', function (req, res) {
	earnCtlr.saveMembersEarningHeader(res);
});

export default nonRestrictedRoutes;

