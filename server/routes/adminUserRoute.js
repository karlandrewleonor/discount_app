import express from 'express';
import * as adminUserCtlr from '../controllers/adminUserCtlr'
let jwt = require('jsonwebtoken');

var adminUserRoutes = express.Router();

// adminUserRoutes.use(function(req, res, next) {
// 	if (req.headers && req.headers.authorization){
// 		var token = req.headers.authorization;
// 		jwt.verify(token, 'DISCOUNTAPP-ADMIN', function(err, decoded) {
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


adminUserRoutes.get('/adminUser/all', function(req, res) {
	adminUserCtlr.getAll(res);
});

adminUserRoutes.post('/adminUser/addAdmin', function(req, res) {
	adminUserCtlr.addAdminUser(req.body, res);
});

adminUserRoutes.post('/adminUser/updateAdmin', function(req, res) {
	adminUserCtlr.updateAdmin(req.body, res);
});

adminUserRoutes.get('/adminUser/delete/:id', function(req, res) {
	adminUserCtlr.deleteAdmin(req.params.id, res);
});

adminUserRoutes.post('/adminUser/changepassword', function(req, res) {
	adminUserCtlr.userChangePwd(req.body, res);
});

adminUserRoutes.get('/adminUser/get/:id', function(req, res) {
	adminUserCtlr.getAdmin(req.params.id, res);
});

export default adminUserRoutes;

