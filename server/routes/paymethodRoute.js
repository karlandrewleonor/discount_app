import express from 'express';
import * as paymethodCtlr from '../controllers/paymethodCtlr'
let jwt = require('jsonwebtoken');

var paymethodRoutes = express.Router();

// paymethodRoutes.use(function(req, res, next) {
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

paymethodRoutes.get('/paymethod/all', function(req, res) {
	paymethodCtlr.getAll(res);
});

paymethodRoutes.post('/paymethod/save', function(req, res) {
	paymethodCtlr.savePaymethod(req.body, res);
});

paymethodRoutes.post('/paymethod/update', function(req, res) {
	paymethodCtlr.updatePaymethod(req.body, res);
});

paymethodRoutes.get('/paymethod/delete/:id', function(req, res) {
	paymethodCtlr.deletePaymethod(req.params.id, res);
});

export default paymethodRoutes;

