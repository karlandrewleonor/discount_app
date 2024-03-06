import express from 'express';
import * as memberRequestCtlr from '../controllers/memberRequestCtlr'
let jwt = require('jsonwebtoken');

var memberRequestRoutes = express.Router();

// memberRequestRoutes.use(function(req, res, next) {
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

memberRequestRoutes.post('/member_request/all', function(req, res) {
	memberRequestCtlr.getAll(req.body,res);  	
});

memberRequestRoutes.post('/member_request/approve', function(req, res) {
	memberRequestCtlr.approve(req.body,res);  	
});

memberRequestRoutes.post('/member_request/reject', function(req, res) {
	memberRequestCtlr.reject(req.body,res);  	
});

export default memberRequestRoutes;

