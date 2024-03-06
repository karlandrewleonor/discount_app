import express from 'express';
import * as earnSettingsCtlr from '../controllers/earnSettingsCtlr'
let jwt = require('jsonwebtoken');

var earnSettingsRoutes = express.Router();

earnSettingsRoutes.get('/earn/all', function (req, res) {
	earnSettingsCtlr.getSettings(res);
});

earnSettingsRoutes.post('/earn/update', function (req, res) {
	earnSettingsCtlr.updateSettings(req.body, res);
});

earnSettingsRoutes.get('/merchant/earn', function (req, res) {
	earnSettingsCtlr.getMerchantEarnSettings(res);
});

earnSettingsRoutes.post('/merchant/earn/update', function (req, res) {
	earnSettingsCtlr.updateMerchantEarnSettings(req.body, res);
});

earnSettingsRoutes.post('/earning/transactions', function (req, res) {
	earnSettingsCtlr.getEarningTransactions(req.body, res);
});

earnSettingsRoutes.post('/transaction/create', function (req, res) {
	earnSettingsCtlr.createTransferTransaction(req.body, res);
});

export default earnSettingsRoutes;

