import express from 'express';
import * as merchantCtlr from '../controllers/merchantCtlr'
let jwt = require('jsonwebtoken');

var merchantRoutes = express.Router();

// merchantRoutes.use(function(req, res, next) {
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

merchantRoutes.post('/merchant/all', function(req, res) {
	merchantCtlr.getMerchants(req.body, res);
});

merchantRoutes.post('/merchant/requests', function(req, res) {
	merchantCtlr.getMerchantRequests(req.body, res);
});

merchantRoutes.post('/merchant/save', function(req, res) {
	merchantCtlr.saveMerchant(req.body, res);
});

merchantRoutes.post('/merchant/update_status', function(req, res) {
	merchantCtlr.updateMerchantStatus(req.body, res);
});

merchantRoutes.get('/merchant/get/:id', function(req, res) {
	merchantCtlr.getMerchantDetails(req.params.id, res);
});

merchantRoutes.post('/product/save', function(req, res) {
	merchantCtlr.saveProduct(req.body, res);
});

merchantRoutes.post('/product/update', function(req, res) {
	merchantCtlr.updateProduct(req.body, res);
});

merchantRoutes.get('/product/delete/:id', function(req, res) {
	merchantCtlr.deleteProduct(req.params.id, res);
});

merchantRoutes.get('/merchant_category/get', function(req, res) {
	merchantCtlr.getCategories(res);
});

merchantRoutes.post('/merchant_category/save', function(req, res) {
	merchantCtlr.saveCategory(req.body, res);
});

merchantRoutes.post('/merchant_category/update', function(req, res) {
	merchantCtlr.updateCategory(req.body, res);
});

merchantRoutes.get('/merchant_category/delete/:id', function(req, res) {
	merchantCtlr.deleteCategory(req.params.id, res);
});

export default merchantRoutes;

