

import Members from '../models/member'
import ChangeRequest from '../models/change_request'

import { config } from '../../config/app'
import { isBase64 } from './merchantCtlr';

import _ from 'lodash'
import moment from 'moment'
import sizeOf from 'image-size'

var Excel = require('exceljs');
var mime = require('mime');
var jwt = require('jsonwebtoken');
const argon2 = require('argon2');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async')
var sharp = require('sharp')
var AWS =  require('aws-sdk')
var { uuid } = require('uuidv4');

const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

import path from 'path'
import fs from 'fs'

var s3 = new AWS.S3();

export function getAll(body,res){

    var lists = []

    const getMembers = function(){
        return new Promise(function(resolve, reject){
            Members.find({
                fullname: { $regex: new RegExp(body.filter, "i") },
                _id:{$ne: body.user_id},
                account_type: body.account_type,
                status: 1
            })
            .populate({path: "sponsorid"})
            .sort({date_subscribed: -1})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    lists = result
                    resolve()
                }
            });
        })
    }

    getMembers()
    .then(function(){
        console.log(lists)
        res.json({status: 1, data: lists})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function saveAutoReferral(body, res) {

    const update = function(){
        return new Promise(function(resolve, reject){
            if(!body.isReferral){
                Members.findByIdAndUpdate(new ObjectId(body.member_id), { isReferral: body.isReferral}).exec((err, result)=>{
                    if (err){
                        var _err = { name: err.name };
                        reject(_err);
                    }else{
                       resolve()
                    }
                });
            }else{
                Members.countDocuments({ isReferral: true }).exec((err, count) => {
                    if (!err) {
                        if (count >= 500) {
                            var _err = { name: 'You`ve reached the maximum count of auto referral.' };
                            reject(_err);
                        } else {
                            Members.findByIdAndUpdate(new ObjectId(body.member_id), { isReferral: body.isReferral}).exec((err, result)=>{
                                if (err){
                                    var _err = { name: err.name };
                                    reject(_err);
                                }else{
                                   resolve()
                                }
                            });
                        }
                    }
                })
            }
        })
    }

    update()
    .then(function(){
        res.json({ status: 1, message: 'Success'});
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function exportExcelFile(data, res){

    var members = data
    var fileTmppath = path.resolve(__dirname, '../../dist/client/exports/')
    var filename = "members_" + moment().format("MMDDYYYYhhss") + ".xlsx"

    const exportExcel = function(){
         return new Promise(function(resolve, reject){
            var workbook = new Excel.Workbook();
            workbook.creator = 'Me';
            workbook.lastModifiedBy = 'Her';
            workbook.created = new Date();
            workbook.modified = new Date();

            var sheet = workbook.addWorksheet('Member');
            var tmpcol = [
                    { header: 'User ID', key: 'user_id', width: 20},
                    { header: 'Referral Code', key: 'referral_code', width: 20},
                    { header: 'Account Type', key: 'account_type', width: 20},
                    { header: 'Name', key: 'fullname', width: 20},
                    { header: 'Sponsor', key: 'sponsorid', width: 20},
                    { header: 'Mobile Number', key: 'mobileno', width: 20},
                    { header: 'Email Address', key: 'emailadd', width: 15},
                    { header: 'Alias', key: 'alias', width: 20},
                    { header: 'Birthdate', key: 'birthdate', width: 20},
                    { header: 'Auto Referral', key: 'isReferral', width: 20},
                    { header: 'isHub', key: 'isHub', width: 20}
            ]
            sheet.columns = tmpcol;
            var rows = []
            for(var i=0; i < members.length; i++){
                var item = {
                    user_id: members[i].user_id,
                    referral_code:  members[i].referral_code,
                    account_type:  members[i].account_type,
                    fullname: members[i].fullname,
                    sponsorid: members[i].sponsorid?.fullname,
                    mobileno: members[i].mobileno,
                    emailadd: members[i].emailadd,
                    alias: members[i].alias,
                    birthdate: members[i].birthdate == null ? '--' : moment(members[i].birthdate).format('MM/DD/YYYY'),
                    isReferral: members[i].isReferral ? "Yes" : "No",
                    isHub: members[i].isHub ? "Yes" : "No"
                }
                rows.push(item)
            }
            sheet.addRows(rows)
            sheet.getRow(1).font = { bold: true }
            var filepath = path.resolve(config.export_path + filename)
            workbook.xlsx.writeFile(filepath)
            .then(function() {
                resolve(filepath)
            })
            .catch(function(err){
                console.log(err)
                var _err = { name: err.name };
                reject(_err);
            })
        })
    }


    exportExcel()
    .then(function(fp){
        var mimetype = mime.getType(fp);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        var filestream = fs.createReadStream(fp);
        //res.download(filepath, filename)
        filestream.pipe(res);
    })
    .catch(function(err){
        console.log(err);
       // var response =  {status: 0, message: err.name };
        //res.json(response);
    })

}

export function getProfile(id, res){

    var userdata = {}

    const getInfo = function(){
        return new Promise(function(resolve, reject){
            Members.findById(new ObjectId(id))
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    userdata = result
                    resolve()
                }
            });
        })
    }

    getInfo()
    .then(()=>{
        res.json({ status: 1, userdata: userdata })
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
    })
}

export function updateProfile(body, res) {

    var userdata = {}

    const checkMobileExisting = function(){
        return new Promise(function(resolve, reject){
            Members.findOne({mobileno: body.fields.mobileno, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    if (!_.isEmpty(result)){
                        reject({ name: "Mobile number already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const checkEmailExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + body.fields.emailadd + '$';
            Members.findOne({emailadd:  { $regex : new RegExp(un, "i")}, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    if (!_.isEmpty(result)){
                        reject({ name: "Email already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const uploadProfile = function () {
        return new Promise(function (resolve, reject) {
            if(body.fields.photo_thumb == null){
                resolve()
            }else{
                if(isBase64(body.fields.photo_thumb)){
                    var base64Image = Buffer.from(body.fields.photo_thumb.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                    var buf = Buffer.from(base64Image, 'binary');

                    var dimensions = sizeOf(buf);

                    if (dimensions.width < 200 || dimensions.height < 200) {
                        var _err = { name: 'Photo is too small. Should be at least 200 x 200' };
                        reject(_err);
                    } else {
                        sharp(buf)
                        .rotate()
                        .toBuffer(function (err, resBuf) {
                            if (err) {
                                console.log(err)
                                reject({name: "Something went wrong on uploading photo"})
                            }else{
                                var key = "product/" + "P" + uuid() + ".png"
                                const params = {
                                    Bucket: config.bucket,
                                    Key: key,
                                    Body: resBuf,
                                    ACL: 'public-read',
                                    ContentType: 'image/png'
                                }
                                s3.upload(params, (err, sdata) => {
                                    if (err) {
                                        console.log(err)
                                        reject(err)
                                    } else {
                                        img_url = config.url + key
                                        resolve()
                                    }
                                })
                            }
                        })
                    }
                }else{
                    resolve()
                }
            }
        })
    }

    const update = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(body._id), body.fields, {new: true}).exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    userdata = result
                    resolve()
                }
            });
        })
    }


    checkMobileExisting()
    .then(checkEmailExisting)
    .then(uploadProfile)
    .then(update)
    .then(function(){
        res.json({ status: 1, message: 'Success', userdata: userdata });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function userChangePwd(body, res){

    var data = {}

    const hashPassword = function(pwd, cb){
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
        .catch((err)=>{
            console.log(err)
            cb(err)
        })
    }

    const getMemberPass = function(){
        return new Promise(function(resolve, reject){
            Members.findById(new ObjectId(body.member_id))
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else {
                    if (_.isEmpty(result)){
                        var _err = { name: "Member does not exist."};
                        reject(_err);
                    }else{
                        data = result
                        resolve();
                    }
                }
            });
        })
    }

    const updatePassword = function(){
        return new Promise(function(resolve, reject){
            hashPassword(body.newpwd.trim(), function(err, hash){
                if(err){
                    reject(err)
                }else{
                    Members.findByIdAndUpdate(new ObjectId(body.member_id),{ pwd: hash, plainPwd: body.newpwd.trim() })
                    .exec((err, result)=>{
                        if (err){
                            var _err = { name: err.name };
                            reject(_err);
                        }else {
                            resolve();
                        }
                    });
                }
            })
        })
    }

    getMemberPass()
    .then(updatePassword)
    .then(function(){
        res.json({ status: 1, message: "Success", data: data });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function promoteMember(id, res) {

    const update = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(id), {status: 1}, {new: true})
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    resolve()
                }
            });
        })
    }


    update()
    .then(function(){
        res.json({ status: 1, message: 'Success' });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function getPermission(id, res){
    
    var member_data = {}

    const fetchRecord = function(){
        return new Promise(function(resolve, reject){
            Members.findById(new ObjectId(id))
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    member_data = result
                    resolve()
                }
            });
        })
    }

    fetchRecord()
    .then(()=>{
        res.json({ status: 1, data: member_data })
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
    })
}

export function updatePermission(body, res){
    
    var params = {
        hasMListEdit: body.hasMListEdit,
        hasMListPromote: body.hasMListPromote,
        hasMerchantReq: body.hasMerchantReq,
        hasMemberReq: body.hasMemberReq,
        hasPayoutReq: body.hasPayoutReq,
        hasPApproved: body.hasPApproved,
        hasPReject: body.hasPReject,
        hasChangeReq: body.hasChangeReq,
        hasAdminList: body.hasAdminList,
        hasAdminDashboard: body.hasAdminDashboard,
        hasEarnSettings: body.hasEarnSettings,
        hasMerchantEdit: body.hasMerchantEdit,
        hasPaymethod: body.hasPaymethod
    }
    var userdata = {}

    const updateRecord = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(body._id), params, {new: true})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    userdata = result
                    resolve()
                }
            });
        })
    }

    updateRecord()
    .then(()=>{
        res.json({ status: 1, userdata: userdata })
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
    })
}

export function sendChangeRequest(body, res) {

    const checkMobileExisting = function(){
        return new Promise(function(resolve, reject){
            Members.findOne({mobileno: body.fields.mobileno, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    if (!_.isEmpty(result)){
                        reject({ name: "Mobile number already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }


    const checkEmailExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + body.fields.emailadd + '$';
            Members.findOne({emailadd:  { $regex : new RegExp(un, "i")}, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    if (!_.isEmpty(result)){
                        reject({ name: "Email already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const updateMember = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(body._id), {checkRequest: true}).exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    resolve()
                }
            });
        })
    }

    const saveNewRequest = function(){
        return new Promise(function(resolve, reject){
            var data = {
                member_id: body._id,
                ...body.fields,
            }
            var newRequest= ChangeRequest(data)
            newRequest.save((err, obj)=>{
                resolve();
            })
        })
    }


    checkMobileExisting()
    .then(checkEmailExisting)
    .then(updateMember)
    .then(saveNewRequest)
    .then(function(){
        res.json({ status: 1, message: 'Success' });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function cancelRequest(id, res) {

    const updateMember = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(id), {checkRequest: false}).exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    resolve()
                }
            });
        })
    }

    const updateRequest = function(){
        return new Promise(function(resolve, reject){
            ChangeRequest.findOneAndUpdate({member_id: new ObjectId(id), status: 0}, {status: 3}).exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    resolve()
                }
            });
        })
    }

    updateMember()
    .then(updateRequest)
    .then(function(){
        res.json({ status: 1, message: 'Success' });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

// CHANGE REQUEST CONTROLLER


export function getAllChangeReq(body, res){

    var c_requests = []

    const getItems = function(){
        return new Promise(function(resolve, reject){
            var params = {}
            if(body.filter > -1){
                params = { status: body.filter }
            }
            ChangeRequest.find(params).lean()
            .populate({path: "member_id"})
            .sort({date_requested: -1})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    c_requests = result
                    resolve()
                }
            });
        })
    }

    getItems()
    .then(function(){
        res.json({status: 1, data: c_requests})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function rejectChangeReq(body, res) {

    const updateMember = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(body.member_id._id), { checkRequest: false}).exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                   resolve()
                }
            });
        })
    }

    const updateRequest = function(){
        return new Promise(function(resolve, reject){
            ChangeRequest.findByIdAndUpdate(new ObjectId(body._id), { status: 2}).exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                   resolve()
                }
            });
        })
    }

    updateMember()
    .then(updateRequest)
    .then(function(){
        res.json({ status: 1, message: 'Success'});
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function approveChangeReq(body, res) {
    
    const checkMobileExisting = function(){
        return new Promise(function(resolve, reject){
            Members.findOne({mobileno: body.fields.mobileno, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    reject({ name: err.name });
                }else{
                    if (!_.isEmpty(result)){
                        reject({ name: "Mobile number already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }


    const uploadProfile = function () {
        return new Promise(function (resolve, reject) {
            if(body.fields.photo_thumb == null || body.fields.photo_thumb == ''){
                resolve()
            }else{
                if(isBase64(body.fields.photo_thumb)){
                    var base64Image = Buffer.from(body.fields.photo_thumb.replace(/^data:image\/\w+;base64,/, ""), 'base64')
                    var buf = Buffer.from(base64Image, 'binary');

                    var dimensions = sizeOf(buf);

                    if (dimensions.width < 200 || dimensions.height < 200) {
                        var _err = { name: 'Photo is too small. Should be at least 200 x 200' };
                        reject(_err);
                    } else {
                        sharp(buf)
                        .rotate()
                        .toBuffer(function (err, resBuf) {
                            if (err) {
                                console.log(err)
                                reject({name: "Something went wrong on uploading photo"})
                            }else{
                                var key = "product/" + "P" + uuid() + ".png"
                                const params = {
                                    Bucket: config.bucket,
                                    Key: key,
                                    Body: resBuf,
                                    ACL: 'public-read',
                                    ContentType: 'image/png'
                                }
                                s3.upload(params, (err, sdata) => {
                                    if (err) {
                                        console.log(err)
                                        reject(err)
                                    } else {
                                        img_url = config.url + key
                                        resolve()
                                    }
                                })
                            }
                        })
                    }
                }else{
                    resolve()
                }
            }
        })
    }

    const updateMember = function(){
        return new Promise(function(resolve, reject){
            Members.findByIdAndUpdate(new ObjectId(body._id), body.fields).exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                   resolve()
                }
            });
        })
    }

    const updateRequest = function(){
        return new Promise(function(resolve, reject){
            ChangeRequest.findByIdAndUpdate(new ObjectId(body.request_id), { status: 1}).exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    resolve()
                }
            });
        })
    }


    checkMobileExisting()
    .then(uploadProfile)
    .then(updateMember)
    .then(updateRequest)
    .then(function(){
        res.json({ status: 1, message: 'Success'});
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}