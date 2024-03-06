import express from 'express';
import * as uploadCtlr from '../controllers/uploadCtlr'

var uploadRoutes = express.Router();

uploadRoutes.post('/upload/profile', function(req, res) {	
	uploadCtlr.uploadProfilePhoto(req, res);  	
});

export default uploadRoutes