var AWS =  require('aws-sdk')
var path  = require('path')
var fs = require('fs')
var sharp = require('sharp')
var multer = require('multer')
var { uuid } = require('uuidv4');

import Member from '../models/member'
import sizeOf from 'image-size'

import _ from 'lodash'

var maxSize =  5 * 1024 * 1024  // 5MB

var ObjectId = require('mongoose').Types.ObjectId;

var s3 = new AWS.S3();

var async = require('async')
import { config } from '../../config/app'

const fileFilter = (req, file, cb)=>{
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/gif' ){
        cb(null, true);
    }else{
       return cb('Invalid File.', false);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        // production
        var filepath = path.resolve(config.file_path + req.body.member_id + '/temp')
        try {
            if (!fs.existsSync(filepath)){
                var userpath = path.resolve(config.file_path , req.body.member_id )
                fs.mkdirSync(userpath)
                fs.mkdirSync(filepath)
                cb(null, filepath);
            }else{
                cb(null, filepath);
            }
        } catch (err) {
            console.log(err)
            cb(err, '');
        }
    },
    filename: (req, file, cb)=>{
        const newFilename = `${uuid()}${path.extname(file.originalname)}`;
        cb(null, newFilename);
    }
})

const singleUpload = multer({ storage: storage, fileFilter: fileFilter}).single('selectedFile');

export function uploadProfilePhoto(req, res){
    singleUpload(req, res, function(err){
        if (err){
            console.log(err)
            res.json({status: 0, message: err});
        }else{
            try{
                var dimensions = sizeOf(req.file.path);
                if (dimensions.width<130 || dimensions.height< 130){
                    res.json({status: 0,  message: "Photo is too small. Should be at least 130 x 130"});
                    try {
                        fs.unlinkSync(req.file.path)
                    }catch (err) {
                        console.log(err)
                    }
                }else{
                    sharp(req.file.path)
                    .rotate()
                    .resize({ width: 200, height: 200 })
                    .toBuffer(function(err, data){
                        if (err){
                            res.json({status: 0, message: err});
                        }else{
                            try {
                                fs.unlinkSync(req.file.path)
                            }catch (err) {
                                 console.log(err)
                            }
                            var key = "profilephotos/"+ req.body.member_id + "/" + "P" + uuid() + ".png"
                            const params = {
                                Bucket: config.bucket,
                                Key: key,
                                Body: data,
                                ACL: 'public-read',
                                ContentType: 'image/png'
                            }
                            s3.upload(params, (err, sdata) => {
                                if (err) {
                                    console.log(err)
                                    res.json({status: 0, message: err.name});
                                }else{
                                    var url = config.url + key
                                    var param = { photo_thumb: url }
                                    Member.findByIdAndUpdate(new ObjectId(req.body.member_id), param).exec((err, result)=>{
                                        if (err){
                                            console.log(err)
                                        }
                                        res.json({status: 1,  data: url,  message: "success"});
                                    })
                                }
                            });

                        }
                    });

                }
            } catch (err) {
                console.log(err)
                res.json({status: 0, message: "Something went wrong."});
            }
        }
    })
}