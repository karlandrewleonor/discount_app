
import AdminUser from '../models/adminUser'
import _, { has } from 'lodash'
var jwt = require('jsonwebtoken');
const argon2 = require('argon2');
var ObjectId = require('mongoose').Types.ObjectId;

export function login(body, res){

    var data = {}
    var ismaster = 0
    var maspwd = ''

    const checkUserExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + body.username + '$';
            AdminUser.findOne({username:  { $regex : new RegExp(un, "i")}})
            .exec((err, result) =>{
                if (err){
                    var err = {name: err.name};
                    reject(_err);
                }else{
                    if (_.isEmpty(result)){
                        var _err = { name: "Invalid username/password." };
                        reject(_err);
                    }else{
                        data = result
                        resolve()
                    }
                }
            })
        })
    }

    const verifyHash = function(pwd, cb){
        argon2.verify(pwd, body.password)
        .then((value)=>{
            cb(false, value)
        }).catch((err)=>{
            console.log(err)
            cb(err, false)
        })

    }

    const checkPassword = function(){
        return new Promise(function(resolve, reject){
            verifyHash(data.pwd, function(err, isMatch){
                if (isMatch){
                    resolve()
                }else{
                    var _err = { name: "Invalid username/password." };
                    reject(_err);
                }
            })
        })
    }

    checkUserExisting()
    .then(checkPassword)
    .then(()=>{
        const token = jwt.sign({ id:  data._id, emailadd:  data.emailadd, pwd: data.pwd},'DISCOUNTAPP-ADMIN', { expiresIn: 28800 });
        var userdata = {
            _id: data._id,
            fullname: data.fullname,
            email: data.emailadd,
            username: data.username,
            hasDashboard: data.hasDashboard == null ? 0 : data.hasDashboard,
            hasMembers: data.hasMembers == null ? 0 : data.hasMembers,
            hasAdminUser: data.hasAdminUser == null ? 0 : data.hasAdminUser,
        }
        res.json({status: 1, data: userdata, token: token });
    })
    .catch(function(err){
        console.log(err);
        var response = {status: 0, message: err.name};
        res.json(response);
    })
}

export function getAll(res){

    var lists = []

    const getAdminUser = function(){
        return new Promise(function(resolve, reject){
            AdminUser.find({})
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

    getAdminUser()
    .then(function(){
        res.json({status: 1, data: lists})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function addAdminUser(body, res){

    const hashPassword = function(pwd, cb){
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
        .catch((err)=>{
            console.log(err)
            cb(err)
        })
    }

    const checkUsernameExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + body.formdata.username + '$';
            AdminUser.findOne({username:  { $regex : new RegExp(un, "i")}})
            .exec((err, result) =>{
                if (err){
                    var err = {name: err.name};
                    reject(_err);
                }else{
                    if (!_.isEmpty(result)){
                        var _err = { name: "Username already exists." };
                        reject(_err);
                    }else{
                        resolve()
                    }
                }
            })
        })
    }

    const checkValidEmail = function(){
        return new Promise(function(resolve, reject){
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(body.formdata.emailadd)){
                resolve();
            }else{
                var _err = { name: "Invalid email address." };
                reject(_err);
            }
        })
    }

        const checkEmailExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + body.formdata.emailadd + '$';
            AdminUser.findOne({emailadd:  { $regex : new RegExp(un, "i")}})
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    if (!_.isEmpty(result)){
                        var _err = { name: "Email already exists." };
                        reject(_err);
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const saveNewAdminUser = function(){
        return new Promise(function(resolve, reject){
            hashPassword(body.formdata.pwd.trim(), function(err, hash){
                if(err){
                    reject(err)
                }else{
                    var data = {
                        username: body.formdata.username,
                        emailadd : body.formdata.emailadd,
                        fullname : body.formdata.fullname,
                        pwd : hash,

                        hasDashboard: body.permissions.hasDashboard,
                        hasMembers: body.permissions.hasMembers,
                        hasAdminUser: body.permissions.hasAdminUser
                    }
                    var newAdminUser= AdminUser(data)
                    newAdminUser.save((err, obj)=>{
                        resolve();
                    })
                }
            })
        })
    }


    checkUsernameExisting()
    .then(checkValidEmail)
    .then(checkEmailExisting)
    .then(saveNewAdminUser)
    .then(()=>{
        res.json({status: 1, message: "success"});
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
    })
}

export function getAdmin(id, res) {

    var cinfo = {
        _id: '',
        username: '',
        emailadd : '',
        fullname : '',

        hasDashboard: false,
        hasMembers: false,
        hasAdminUser: false
    }

    const getInfo = function () {
        return new Promise(function (resolve, reject) {
            AdminUser.findById(new ObjectId(id))
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (_.isEmpty(result)) {
                            var _err = { name: "Admin user does not exist." };
                            reject(_err);
                        } else {
                            cinfo._id = result._id
                            cinfo.username = result.username
                            cinfo.emailadd = result.emailadd
                            cinfo.fullname = result.fullname

                            cinfo.hasDashboard = result.hasDashboard == null ? 0 : result.hasDashboard
                            cinfo.hasMembers = result.hasMembers == null ? 0 : result.hasMembers
                            cinfo.hasAdminUser = result.hasAdminUser == null ? 0 : result.hasAdminUser

                            resolve()
                        }
                    }
                });
        })
    }

    getInfo()
    .then(() => {
        res.json({ status: 1, data: cinfo })
    })
    .catch(function (err) {
        console.log(err);
        var response = { status: 0, message: err.name };
        res.json(response);
    })
}

export function updateAdmin(data, res) {

    
    const checkUsernameExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + data.formdata.username + '$';
            AdminUser.findOne({username:  { $regex : new RegExp(un, "i")},_id: {$ne: data.formdata._id}})
            .exec((err, result) =>{
                if (err){
                    var err = {name: err.name};
                    reject(_err);
                }else{
                    if (!_.isEmpty(result)){
                        var _err = { name: "Username already exists." };
                        reject(_err);
                    }else{
                        resolve()
                    }
                }
            })
        })
    }


    const checkValidEmail = function(){
        return new Promise(function(resolve, reject){
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(data.formdata.emailadd)){
                resolve();
            }else{
                var _err = { name: "Invalid email address." };
                reject(_err);
            }
        })
    }

        const checkEmailExisting = function(){
        return new Promise(function(resolve, reject){
            var un = '^' + data.formdata.emailadd + '$';
            AdminUser.findOne({emailadd:  { $regex : new RegExp(un, "i")}, _id:{$ne: data.formdata._id}})
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    if (!_.isEmpty(result)){
                        var _err = { name: "Email already exists." };
                        reject(_err);
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const update = function(){
        return new Promise(function(resolve, reject){
            var param = {
                username: data.formdata.username,
                fullname: data.formdata.fullname,
                emailadd: data.formdata.emailadd,

                hasDashboard: data.permissions.hasDashboard,
                hasMembers: data.permissions.hasMembers,
                hasAdminUser: data.permissions.hasAdminUser
            }
            AdminUser.findByIdAndUpdate(new ObjectId(data.formdata._id), param).exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    resolve()
                }
            });
        })
    }


   checkUsernameExisting()
   .then(checkValidEmail)
   .then(checkEmailExisting)
  .then(update)
    .then(function(){
        res.json({ status: 1, message: 'Success' });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function userChangePwd(body, res){

    const hashPassword = function(pwd, cb){
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
        .catch((err)=>{
            console.log(err)
            cb(err)
        })
    }

    const updatePassword = function(){
        return new Promise(function(resolve, reject){
            hashPassword(body.pwd.trim(), function(err, hash){
                if(err){
                    reject(err)
                }else{
                    AdminUser.findByIdAndUpdate(new ObjectId(body.admin_id),{ pwd: hash })
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

    updatePassword()
    .then(function(){
        res.json({ status: 1, data: "Success" });
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function deleteAdmin(id, res){

    const validateAdminUser = function(){
        return new Promise(function(resolve, reject){
            AdminUser.findOne({isAdmin: true})
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    if (_.isEmpty(result)){
                        resolve()
                    }else{
                        var _err = { name: "Administrator cannot be deleted." };
                        reject(_err);
                    }
                }
            });
        })
    }

    const deleteAdminUser = function(){
        return new Promise(function(resolve, reject){
            AdminUser.findByIdAndDelete(new ObjectId(id))
            .exec((err, result)=>{
                if (err){
                    var _err = { name: err.name };
                    reject(_err);
                }else{
                    if (_.isEmpty(result)){
                        var _err = { name: "Admin User does not exist." };
                        reject(_err);
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    validateAdminUser()
    .then(deleteAdminUser)
    .then(()=>{
        res.json({status: 1, message: 'Success' })
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
    })
}