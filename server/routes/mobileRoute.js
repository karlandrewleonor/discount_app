import express from 'express';
import * as mobileCtlr from '../controllers/mobileCtlr'
let jwt = require('jsonwebtoken');

var mobileRoutes = express.Router();

mobileRoutes.post('/send/otp', function(req, res) {
	mobileCtlr.generateAndSendOTP(req.body, res);
});

mobileRoutes.post('/verify/otp', function(req, res) {
	mobileCtlr.verifyOTP(req.body, res);
});

mobileRoutes.post('/register', function(req, res) {
	mobileCtlr.register(req.body, res);
});

mobileRoutes.post('/login', function (req, res) {
	mobileCtlr.login(req.body, res);
});

mobileRoutes.post('/add/account', function (req, res) {
	mobileCtlr.addMemberRequest(req.body, res);
});

mobileRoutes.post('/changepin', function (req, res) {
	mobileCtlr.changePin(req.body, res);
});

mobileRoutes.post('/resend', function (req, res) {
	mobileCtlr.generateAndSendOTP(req.body, res);
});

mobileRoutes.post('/changepwd', function(req, res) {
	mobileCtlr.userChangePwd(req.body, res);
});

mobileRoutes.post('/check_referral', function(req, res) {
	mobileCtlr.checkReferral(req.body, res);
});

mobileRoutes.post('/member/login', function(req, res) {
	mobileCtlr.loginMember(req.body, res);
});

mobileRoutes.post('/verify/dups', function(req, res) {
	mobileCtlr.verifyDuplicates(req.body, res);
});

mobileRoutes.post('/resetpwd', function(req, res) {
	mobileCtlr.resetPwd(req.body, res);
});


export default mobileRoutes;

