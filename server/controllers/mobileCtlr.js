import Members from '../models/member'
import OTP from '../models/otp'
import MemberRequest from '../models/member_request'
import Earning from '../models/earning'

import moment from 'moment'
import _ from 'lodash'
import sizeOf from 'image-size'

import { config } from '../../config/app'

var mailer = require('../mailer');

var jwt = require('jsonwebtoken');
const argon2 = require('argon2');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async')
const axios = require('axios');

var AWS = require('aws-sdk')
var sharp = require('sharp')
var { uuid } = require('uuidv4');
var s3 = new AWS.S3();


const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

var otplib = require('otplib')
otplib.authenticator.options = {
    step: 300
}

export function generateAndSendOTP(body, res) {

    var token = null
    var sponsorid = ""

    const checkRecord = function () {
        return new Promise(function (resolve, reject) {
            if (body.activeTab == 0) {
                if (body.isForgot) {
                    var un = '^' + body.emailadd + '$';
                    Members.findOne({ emailadd: { $regex: new RegExp(un, "i") } })
                        .exec((err, result) => {
                            if (err) {
                                reject({ name: err.name });
                            } else {
                                if (_.isEmpty(result)) {
                                    reject({ name: "Account does not exists." });
                                } else {
                                    resolve()
                                }
                            }
                        });
                } else {
                    resolve()
                }
            } else {
                if (body.isForgot) {
                    var un = '^' + body.mobileno + '$';
                    Members.findOne({ mobileno: body.mobileno })
                        .exec((err, result) => {
                            if (err) {
                                reject({ name: err.name });
                            } else {
                                if (_.isEmpty(result)) {
                                    reject({ name: "Account does not exists." });
                                } else {
                                    resolve()
                                }
                            }
                        });
                } else {
                    resolve()
                }
            }
        })
    }

    const checkUserExisting = function () {
        return new Promise(function (resolve, reject) {
            if (body.activeTab == 0) {
                if (body.isForgot) {
                    resolve()
                } else {
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
                }
            } else {
                if (body.isForgot) {
                    resolve()
                } else {
                    var un = '^' + body.mobileno + '$';
                    Members.findOne({ mobileno: { $regex: new RegExp(un, "i") } })
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
                }
            }
        })
    }

    const fetchSponsor = function () {
        return new Promise(function (resolve, reject) {
            if (body.isForgot) {
                resolve()
            } else {
                Members.findOne({ referral_code: body.referral_code })
                    .exec((err, result) => {
                        if (err) {
                            console.log(err)
                            resolve()
                        } else {
                            if (_.isEmpty(result)) {
                                reject({ name: "Invalid referral code." });
                            } else {
                                sponsorid = result._id
                                resolve()
                            }
                        }
                    });
            }
        })
    }

    const generateToken = function () {
        return new Promise(function (resolve, reject) {
            if (body.activeTab == 0) {
                var secretKey = otplib.authenticator.generateSecret();
                token = otplib.authenticator.generate(secretKey);
                OTP.findOneAndUpdate({ email: body.emailadd }, { otpsecret: secretKey }, { upsert: true })
                    .exec((err, result) => {
                        if (err) {
                            reject({ name: err.name });
                        } else {
                            resolve()
                        }
                    });
            } else {
                var secretKey = otplib.authenticator.generateSecret();
                token = otplib.authenticator.generate(secretKey);
                OTP.findOneAndUpdate({ number: body.mobileno }, { otpsecret: secretKey }, { upsert: true })
                    .exec((err, result) => {
                        if (err) {
                            reject({ name: err.name });
                        } else {
                            resolve()
                        }
                    });
            }
        })
    }

    const sendMail = function () {
        return new Promise(function (resolve, reject) {
            if (body.activeTab == 0) {
                var subj = `Super Savers - One-time Password`;

                var contentHtml = '<p>Hi,</p><br/>'
                contentHtml = contentHtml + `<p><strong>${token}</strong> is your One-time Password (OTP)</p>`
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
                        console.log(info)
                        resolve()
                    }
                });
            } else {
                axios.post(
                    config.semaphore_otp_url,
                    `apikey=${config.semaphore_apikey}&number=${body.mobileno}&message=${token} is your One-time Password (OTP) -Super Savers.`,
                    {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                )
                    .then(res => {
                        resolve()
                    }).catch((error) => {
                        console.log(error);
                        reject({ name: "Something went wrong. Please try again later." })
                    });
            }
        })
    }

    checkRecord()
        .then(checkUserExisting)
        .then(fetchSponsor)
        .then(generateToken)
        .then(sendMail)
        .then(function () {
            res.json({ status: 1, message: "success", sponsorid: sponsorid })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function resendOTP(body, res) {

    var token = null

    const generateToken = function () {
        return new Promise(function (resolve, reject) {
            var secretKey = otplib.authenticator.generateSecret();
            token = otplib.authenticator.generate(secretKey);
            OTP.findOneAndUpdate({ email: body.emailadd }, { otpsecret: secretKey }, { upsert: true })
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        // resolve()
                    }
                });
        })
    }

    const sendMail = function () {
        return new Promise(function (resolve, reject) {
            var subj = `Discount App - One-time Password`;

            var contentHtml = '<p>Hi,</p><br/>'
            contentHtml = contentHtml + `<p><strong>${token}</strong> is your One-time Password (OTP)</p>`
            contentHtml = contentHtml + '<p>Sincerely yours,</p>'
            contentHtml = contentHtml + '<p>Discount App</p>'

            var mailOptions = {
                from: `Discount App`,
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
                    console.log(info)
                    resolve()
                }
            });
        })
    }

    generateToken()
        .then(sendMail)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function verifyOTP(body, res) {

    var secretKey = ""

    const checkOTP = function () {
        return new Promise(function (resolve, reject) {
            OTP.findOne({
                $or: [
                    { email: body.emailadd },
                    { number: body.mobileno }
                ]
            }).exec((err, result) => {
                if (err) {
                    var _err = { name: err.name };
                    reject(_err);
                } else {
                    if (_.isEmpty(result)) {
                        var response = { name: "Verification code is invalid." };
                        reject(response)
                    } else {
                        secretKey = result.otpsecret
                        resolve()
                    }
                }
            })
        })
    }

    const verifyCode = function () {
        return new Promise(function (resolve, reject) {
            try {
                const isValid = otplib.authenticator.check(body.otp, secretKey);
                if (isValid) {
                    resolve()
                } else {
                    var response = { name: "Verification code is invalid." };
                    reject(response)
                }
            } catch (err) {
                console.error(err);
                var response = { name: "Verification code is invalid." };
                reject(response)
            }
        })
    }

    checkOTP()
        .then(verifyCode)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function register(body, res) {

    var new_member = null
    var referral_code = ""
    var userid = null

    const hashPassword = function (pwd, cb) {
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
            .catch((err) => {
                console.log(err)
                cb(err)
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

    const saveProfile = function () {
        return new Promise(function (resolve, reject) {
            hashPassword(body.pwd.trim(), function (err, encryptedPass) {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    var info = {
                        user_id: userid,
                        fname: body.fname,
                        lname: body.lname,
                        fullname: body.fname + " " + body.lname,
                        sponsorid: body.sponsorid,
                        emailadd: body.emailadd,
                        mobileno: body.mobileno,
                        referral_code: referral_code,
                        pin: body.pin,
                        isReferral: false,
                        plainpwd: body.pwd.trim(),
                        pwd: encryptedPass,
                        status: 0,
                        date_subscribed: moment().format("MM/DD/YYYY HH:mm:ss"),
                        reg_type: body.activeTab,
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

                    var newMember = Members(info)
                    newMember.save((err, res1) => {
                        if (err) {
                            reject(err)
                        } else {
                            new_member = res1
                            resolve()
                        }
                    })
                }
            })
        })
    }

    const saveEarningHeader = function () {
        return new Promise(function (resolve, reject) {
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
        })
    }

    createUserId()
        .then(createCode)
        .then(saveProfile)
        .then(saveEarningHeader)
        .then(function () {
            res.json({ status: 1, message: "success", userdata: new_member })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function login(body, res) {

    var member = {}

    const fetchRecord = function () {
        return new Promise(function (resolve, reject) {
            var exp = '^' + body.mobileno + '$';
            Members.findOne({ mobileno: { $regex: new RegExp(exp, "i") }, pin: body.pin }, '-pwd')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (result) {
                            member = result
                            resolve()
                        } else {
                            var _err = { name: "Invalid PIN." };
                            reject(_err);
                        }
                    }
                });
        })
    }

    fetchRecord()
        .then(function () {
            res.json({ status: 1, message: "success", userdata: member })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function changePin(body, res) {

    var new_member = null

    const updatePinMember = function () {
        return new Promise(function (resolve, reject) {
            Members.findByIdAndUpdate(new ObjectId(body._id), { pin: body.pin }, { new: true })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        var response = { name: "Something went wrong." };
                        reject(response)
                    } else {
                        if (!_.isEmpty(result)) {
                            new_member = result
                        }
                        resolve()
                    }
                })
        })
    }


    updatePinMember()
        .then(function () {
            res.json({ status: 1, message: "success", userdata: new_member })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function addMemberRequest(body, res) {

    var photo_thumb = ""
    var proof_of_payment = ""

    const checkMobileExisting = function () {
        return new Promise(function (resolve, reject) {
            Members.findOne({ mobileno: body.mobileno })
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (!_.isEmpty(result)) {
                            var _err = { name: "Mobile number already exists." };
                            reject(_err);
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
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (!_.isEmpty(result)) {
                            var _err = { name: "Email already exists." };
                            reject(_err);
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    function uploadImg(base64, cb) {

        var url = ""

        var base64Image = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        var buf = Buffer.from(base64Image, 'binary');

        var dimensions = sizeOf(buf);

        if (dimensions.width < 200 || dimensions.height < 200) {
            cb(true, "Photo is too small. Should be at least 200 x 200")
        } else {
            sharp(buf)
                .rotate()
                .toBuffer(function (err, resBuf) {
                    if (err) {
                        console.log(err)
                        cb(true, "Something went wrong on uploading photo")
                    } else {
                        var key = "merchant/" + "P" + uuid() + ".png"
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
                                cb(true, "Something went wrong on uploading photo")
                            } else {
                                url = config.url + key
                                cb(false, url)
                            }
                        })
                    }
                })
        }
    }

    const uploadPhotoThumb = function () {
        return new Promise(function (resolve, reject) {
            uploadImg(body.photo_thumb, function (err, res) {
                if (err) {
                    reject({ name: res });
                } else {
                    photo_thumb = res
                    resolve()
                }
            })
        })
    }

    const uploadProof = function () {
        return new Promise(function (resolve, reject) {
            uploadImg(body.proof_of_payment, function (err, res) {
                if (err) {
                    reject({ name: res });
                } else {
                    proof_of_payment = res
                    resolve()
                }
            })
        })
    }

    const saveMemberRequest = function () {
        return new Promise(function (resolve, reject) {
            var data = {
                _id: new ObjectId(),
                fname: body.fname,
                lname: body.lname,
                fullname: body.fname + " " + body.lname,
                birthdate: body.birthdate,
                mobileno: body.mobileno,
                emailadd: body.emailadd,
                referral_code: '',
                sponsorid: body.sponsorid,
                status: 0,
                proof_of_payment: proof_of_payment,
                photo_thumb: photo_thumb,
                date_requested: moment().toDate(),
                req_status: 0
            }
            var newMRequest = MemberRequest(data)
            newMRequest.save((err, obj) => {
                resolve()
            })
        })
    }

    checkMobileExisting()
        .then(checkEmailExisting)
        .then(uploadPhotoThumb)
        .then(uploadProof)
        .then(saveMemberRequest)
        .then(() => {
            res.json({ status: 1, message: "success" });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function userChangePwd(body, res) {

    var data = {}

    const hashPassword = function (pwd, cb) {
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
            .catch((err) => {
                console.log(err)
                cb(err)
            })
    }

    const getMemberPass = function () {
        return new Promise(function (resolve, reject) {
            Members.findById(new ObjectId(body.member_id))
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (_.isEmpty(result)) {
                            var _err = { name: "Member does not exist." };
                            reject(_err);
                        } else {
                            data = result
                            resolve();
                        }
                    }
                });
        })
    }

    const updatePassword = function () {
        return new Promise(function (resolve, reject) {
            hashPassword(body.newpwd.trim(), function (err, hash) {
                if (err) {
                    reject(err)
                } else {
                    Members.findByIdAndUpdate(new ObjectId(body.member_id), { pwd: hash, plainpwd: body.newpwd.trim() })
                        .exec((err, result) => {
                            if (err) {
                                var _err = { name: err.name };
                                reject(_err);
                            } else {
                                resolve();
                            }
                        });
                }
            })
        })
    }

    getMemberPass()
        .then(updatePassword)
        .then(function () {
            res.json({ status: 1, message: "Success", data: data });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function checkReferral(body, res) {

    var sponsorid = ''

    const checkEmailExisting = function () {
        return new Promise(function (resolve, reject) {
            var un = '^' + body.emailadd + '$';
            Members.findOne({ emailadd: { $regex: new RegExp(un, "i") } })
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (!_.isEmpty(result)) {
                            var _err = { name: "Email already exists." };
                            reject(_err);
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const checkMobileExisting = function () {
        return new Promise(function (resolve, reject) {
            Members.findOne({ mobileno: body.mobileno })
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (!_.isEmpty(result)) {
                            var _err = { name: "Mobile number already exists." };
                            reject(_err);
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const fetchSponsor = function () {
        return new Promise(function (resolve, reject) {
            Members.findOne({ referral_code: body.referral_code })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        resolve()
                    } else {
                        if (!_.isEmpty(result)) {
                            sponsorid = result._id
                            resolve()
                        } else {
                            var _err = { name: "Invalid referral code." };
                            reject(_err);
                        }
                    }
                });
        })
    }

    checkEmailExisting()
        .then(checkMobileExisting)
        .then(fetchSponsor)
        .then(function () {
            res.json({ status: 1, message: "success", data: sponsorid })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function loginMember(body, res) {

    var data = {}

    const checkUserExisting = function () {
        return new Promise(function (resolve, reject) {
            var un = '^' + body.email_or_phone + '$';
            Members.findOne({
                $or: [
                    { emailadd: { $regex: new RegExp(un, "i") } },
                    { mobileno: { $regex: new RegExp(un, "i") } }
                ]
            })
                .exec((err, result) => {
                    if (err) {
                        reject({ name: err.name });
                    } else {
                        if (_.isEmpty(result)) {
                            reject({ name: "Member not found" });
                        } else {
                            data = result
                            resolve()
                        }
                    }
                })
        })
    }

    const verifyHash = function (pwd, cb) {
        argon2.verify(pwd, body.pwd)
            .then((value) => {
                cb(false, value)
            }).catch((err) => {
                console.log(err)
                cb(err, false)
            })

    }

    const checkPassword = function () {
        return new Promise(function (resolve, reject) {
            verifyHash(data.pwd, function (err, isMatch) {
                if (isMatch) {
                    resolve()
                } else {
                    var _err = { name: "Invalid username/password." };
                    reject(_err);
                }
            })
        })
    }
    checkUserExisting()
        .then(checkPassword)
        .then(() => {
            res.json({ status: 1, data: data });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function verifyDuplicates(body, res) {

    const checkUserExisting = function () {
        return new Promise(function (resolve, reject) {
            if (body.activeTab == 0) {
                var un = '^' + body.mobileno + '$';
                Members.findOne({ mobileno: { $regex: new RegExp(un, "i") } })
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
            } else {
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
            }
        })
    }

    checkUserExisting()
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function resetPwd(body, res) {

    var memberdata = {}

    const hashPassword = function (pwd, cb) {
        argon2.hash(pwd).then(hash => {
            cb(false, hash)
        })
            .catch((err) => {
                console.log(err)
                cb(err)
            })
    }

    const fetchMember = function () {
        return new Promise(function (resolve, reject) {
            Members.findOne({
                $or: [
                    { emailadd: body.emailadd },
                    { mobileno: body.mobileno }
                ]
            })
                .exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        if (_.isEmpty(result)) {
                            var _err = { name: "Member does not exist." };
                            reject(_err);
                        } else {
                            memberdata = result
                            resolve();
                        }
                    }
                });
        })
    }

    const updatePassword = function () {
        return new Promise(function (resolve, reject) {
            hashPassword(body.newpwd.trim(), function (err, hash) {
                if (err) {
                    reject(err)
                } else {
                    Members.findByIdAndUpdate(new ObjectId(memberdata._id), { pwd: hash })
                        .exec((err, result) => {
                            if (err) {
                                var _err = { name: err.name };
                                reject(_err);
                            } else {
                                resolve();
                            }
                        });
                }
            })
        })
    }

    fetchMember()
        .then(updatePassword)
        .then(function () {
            res.json({ status: 1, message: "Success" });
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}