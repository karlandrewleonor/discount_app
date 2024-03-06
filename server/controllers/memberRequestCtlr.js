

import MemberRequests from '../models/member_request'
import Members from '../models/member'
import Earning from '../models/earning'

import { isBase64 } from './merchantCtlr';
import _ from 'lodash'
import { config } from '../../config/app'
import moment from 'moment'

import { saveEarnings } from "./earnSettingsCtlr"

var jwt = require('jsonwebtoken');
const argon2 = require('argon2');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async')

var mailer = require('../mailer');

const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

export function getAll(body, res) {

    var lists = []

    const getMRequests = function () {
        return new Promise(function (resolve, reject) {
            var params = { req_status: 0, status: 0 }
            // if(body.filter > -1){
            //     params = {status: body.filter}
            // }
            if (body.user_id.isSuperAdmin) {
                params = { req_status: 1, status: 0 }
            }
            MemberRequests.find(params)
                .populate({ path: "sponsorid" })
                .sort({ date_requested: 1 })
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        lists = result
                        resolve()
                    }
                });
        })
    }

    getMRequests()
        .then(function () {
            res.json({ status: 1, data: lists })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function approve(body, res) {

    var referral_code = ""
    var userid = ""
    var temp_pwd = ""
    var img_url = body.photo_thumb
    var new_member = null

    const checkMobileExisting = function () {
        return new Promise(function (resolve, reject) {
            Members.findOne({ mobileno: body.mobileno })
                .exec((err, result) => {
                    if (err) {
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Mobile number already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }


    const checkEmailExisting = function () {
        return new Promise(function (resolve, reject) {
            var un = '^' + body.emailadd + '$';
            Members.findOne({ emailadd: { $regex: new RegExp(un, "i") } })
                .exec((err, result) => {
                    if (err) {
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Email already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const createUserId = function () {
        return new Promise(function (resolve, reject) {

            const options = {
                upperCaseAlpha: true,
                number: true,
                specialCharacter: false,
                minimumLength: 6,
                maximumLength: 6,
                exactLength: 6
            }

            var count = 1;

            async.whilst(
                function check(cb) {
                    cb(null, count > 0)
                },
                function (callback) {
                    userid = passwordGenerator.generatePassword(options);
                    userid = userid.toUpperCase();
                    var xp = '^' + userid + '$';
                    Members.findOne({ user_id: { $regex: new RegExp(xp, "i") } }).exec((err, result) => {
                        if (result) {
                            count = 1
                        } else {
                            count = 0
                        }

                        callback(null, count)
                    });
                },
                function (err) {
                    resolve()
                }
            );
        })
    }

    const createCode = function () {
        return new Promise(function (resolve, reject) {

            const options = {
                upperCaseAlpha: true,
                number: true,
                specialCharacter: false,
                minimumLength: 6,
                maximumLength: 6,
                exactLength: 6
            }

            var count = 1;

            async.whilst(
                function check(cb) {
                    cb(null, count > 0)
                },
                function (callback) {
                    referral_code = passwordGenerator.generatePassword(options);
                    referral_code = referral_code.toUpperCase();
                    var xp = '^' + referral_code + '$';
                    Members.findOne({ referral_code: { $regex: new RegExp(xp, "i") } }).exec((err, result) => {
                        if (result) {
                            count = 1
                        } else {
                            count = 0
                        }

                        callback(null, count)
                    });
                },
                function (err) {
                    resolve()
                }
            );
        })
    }


    const hashPassword = function (pwd, cb) {
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
            .catch((err) => {
                console.log(err)
                cb(err)
            })
    }

    const createPassword = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {

                const options = {
                    upperCaseAlpha: true,
                    number: true,
                    specialCharacter: false,
                    minimumLength: 8,
                    maximumLength: 8,
                    exactLength: 8
                }

                var count = 1;

                async.whilst(
                    function check(cb) {
                        cb(null, count > 0)
                    },
                    function (callback) {
                        temp_pwd = passwordGenerator.generatePassword(options);
                        var xp = '^' + temp_pwd + '$';
                        Members.findOne({ plainpwd: { $regex: new RegExp(xp, "i") } }).exec((err, result) => {
                            if (result) {
                                count = 1
                            } else {
                                count = 0
                            }
                            callback(null, count)
                        });
                    },
                    function (err) {
                        resolve()
                    }
                );
            } else {
                resolve()
            }
        })
    }

    const uploadProfile = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                if (body.photo_thumb == null || body.photo_thumb == "") {
                    resolve()
                } else {
                    if (isBase64(body.photo_thumb)) {
                        var base64Image = Buffer.from(body.photo_thumb.replace(/^data:image\/\w+;base64,/, ""), 'base64')
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
                                        reject({ name: "Something went wrong on uploading photo" })
                                    } else {
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
                    } else {
                        resolve()
                    }
                }
            } else {
                resolve()
            }
        })
    }

    const saveNewMember = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                hashPassword(temp_pwd, function (err, hash) {
                    if (err) {
                        reject(err)
                    } else {
                        var ndata = {
                            user_id: userid,
                            fname: body.fname,
                            lname: body.lname,
                            fullname: body.fname + " " + body.lname,
                            mobileno: body.mobileno,
                            emailadd: body.emailadd,
                            pin: "",
                            plainpwd: temp_pwd,
                            referral_code: referral_code,
                            isReferral: false,
                            sponsorid: body.sponsorid?._id,
                            status: 0,
                            photo_thumb: img_url,
                            isAdmin: false,
                            pwd: hash,
                            date_subscribed: moment().format("MM/DD/YYYY HH:mm:ss"),
                            hasMListEdit: false,
                            hasMListPromote: false,
                            hasMerchantReq: false,
                            hasMemberReq: false,
                            hasPayoutReq: false,
                            hasPApproved: false,
                            hasChangeReq: false,
                            hasAdminList: false,
                            hasAdminDashboard: false,
                            hasEarnSettings: false,
                            hasMerchantEdit: false
                        }
                        var newMember = Members(ndata)
                        newMember.save((err, obj) => {
                            new_member = obj
                            resolve();
                        })
                    }
                })
            } else {
                resolve()
            }
        })
    }

    const saveEarningHeader = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                let earningObj = {
                    member_id: new_member?._id,
                    direct: 0,
                    indirect: 0,
                    total_sent: 0,
                    total_received: 0,
                    accumulated: 0,
                    total_withdrawal: 0,
                    balance: 0
                }

                const newEarning = new Earning(earningObj)
                newEarning.save((err, result) => {
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    const sendMail = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                var subj = `Super Savers - Temporary Password`;

                var contentHtml = '<p>Hi,</p><br/>'
                contentHtml = contentHtml + `<p><strong>${temp_pwd}</strong> is your Temporary Password</p>`
                contentHtml = contentHtml + '<p>Sincerely yours,</p>'
                contentHtml = contentHtml + '<p>Super Savers</p>'

                var mailOptions = {
                    from: `Super Savers`,
                    to: body.emailadd,
                    subject: subj,
                    html: contentHtml
                }


                mailer.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error)
                        var _err = { name: "Error on mail server.Please try again later" };
                        reject(_err);
                    } else {
                        resolve()
                    }
                });
            } else {
                resolve()
            }
        })
    }

    const update = function () {
        return new Promise(function (resolve, reject) {
            var params = { req_status: 1 }
            if (body.user_id.isSuperAdmin) {
                params = { status: 1 }
            }
            MemberRequests.findByIdAndUpdate(new ObjectId(body._id), params).exec((err, result) => {
                if (err) {
                    var _err = { name: err.name };
                    reject(_err);
                } else {
                    resolve()
                }
            });
        })
    }


    checkMobileExisting()
        .then(checkEmailExisting)
        .then(createCode)
        .then(createUserId)
        .then(uploadProfile)
        .then(createPassword)
        .then(saveNewMember)
        .then(saveEarningHeader)
        .then(sendMail)
        .then(update)
        .then(function () {
            if (new_member) {
                saveEarnings(new_member._id, 0, () => { })
            }

            res.json({ status: 1, message: 'Success' });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function reject(body, res) {
    var params = { status: 2 }
    if (body.user_id.isSuperAdmin) {
        params = { req_status: 0 }
    }
    const update = function () {
        return new Promise(function (resolve, reject) {
            MemberRequests.findByIdAndUpdate(new ObjectId(body._id), params).exec((err, result) => {
                if (err) {
                    var _err = { name: err.name };
                    reject(_err);
                } else {
                    resolve()
                }
            });
        })
    }

    update()
        .then(function () {
            res.json({ status: 1, message: 'Success' });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}