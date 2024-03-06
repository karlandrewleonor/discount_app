import express from 'express';
import * as memberCtlr from '../controllers/memberCtlr'
let jwt = require('jsonwebtoken');

var memberRoutes = express.Router();

// memberRoutes.use(function(req, res, next) {
// 	if (req.headers && req.headers.authorization){
// 		var token = req.headers.authorization;
// 		jwt.verify(token, 'DISCOUNTAPP', function(err, decoded) {
// 	      if (err) {
// 	        return res.json({ status: 0, message: "InvalidToken"});
// 	      } else {
// 	        // if everything is good, save to request for use in other routes
// 	        req.decoded = decoded;
// 	        next();
// 	      }
// 	    });
// 	}else{
// 		return res.status(403).send({
// 	        status: 0,
// 	        message: 'No token provided.'
// 	    });
// 	}
// });

memberRoutes.post('/member/all', function(req, res) {
	memberCtlr.getAll(req.body,res);  	
});

memberRoutes.post('/members/auto_referral', function(req, res) {
	memberCtlr.saveAutoReferral(req.body, res);  	
})

memberRoutes.post('/member/excel', function(req, res) {	
	memberCtlr.exportExcelFile(req.body,res);  	
});

memberRoutes.get('/member/profile/:id', function(req, res) {
	memberCtlr.getProfile(req.params.id, res);  	
});

memberRoutes.post("/member/update", function(req, res){
	memberCtlr.updateProfile(req.body, res);
});

memberRoutes.post('/members/changepassword', function(req, res) {
	memberCtlr.userChangePwd(req.body, res);
});

memberRoutes.get("/member/promote/:id", function(req, res){
	memberCtlr.promoteMember(req.params.id, res);
});

memberRoutes.get("/members/get/permissions/:id", function(req, res){
	memberCtlr.getPermission(req.params.id, res);
});

memberRoutes.post('/members/update/permissions', function(req, res) {
	memberCtlr.updatePermission(req.body, res);
});

memberRoutes.post('/members/changereq', function(req, res) {
	memberCtlr.sendChangeRequest(req.body, res);
});

memberRoutes.get("/members/cancelreq/:id", function(req, res){
	memberCtlr.cancelRequest(req.params.id, res);
});

// CHANGE REQUEST ROUTES

memberRoutes.post('/changerequest/all', function(req, res) {
	memberCtlr.getAllChangeReq(req.body, res);
});

memberRoutes.post("/changerequest/reject", function(req, res){
	memberCtlr.rejectChangeReq(req.body, res);
});

memberRoutes.post("/changerequest/approve", function(req, res){
	memberCtlr.approveChangeReq(req.body, res);
});

export default memberRoutes;

