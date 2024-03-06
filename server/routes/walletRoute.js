import express from 'express';
import * as walletCtlr from '../controllers/walletCtlr'
let jwt = require('jsonwebtoken');

var walletRoutes = express.Router();

// walletRoutes.use(function(req, res, next) {
// 	if (req.headers && req.headers.authorization){
// 		var token = req.headers.authorization;
// 		jwt.verify(token, 'TIEAPP-ADMIN', function(err, decoded) {
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

walletRoutes.post('/wallet/all', function (req, res) {
	walletCtlr.getAllReq(req.body, res);
});

walletRoutes.post('/wallet/saverequest', function (req, res) {
	walletCtlr.saveRequest(req.body, res);
});

walletRoutes.post('/wallet/approve', function (req, res) {
	walletCtlr.approve(req.body, res);
});

walletRoutes.get('/wallet/reject/:id', function (req, res) {
	walletCtlr.reject(req.params.id, res);
});

walletRoutes.post('/transaction/transfer', function (req, res) {
	walletCtlr.transfer(req.body, res);
});

walletRoutes.post('/transaction/pay', function (req, res) {
	walletCtlr.pay(req.body, res);
});

walletRoutes.post('/wallet/dd', function(req, res) {
	walletCtlr.getDD(req.body, res);
});

export default walletRoutes;

