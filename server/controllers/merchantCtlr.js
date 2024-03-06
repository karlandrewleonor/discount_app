import MerchantRequest from '../models/merchantRequest'
import Product from '../models/product'
import Members from '../models/member'
import MerchantCategory from '../models/merchantCategory'
import Earning from '../models/earning'

import _ from 'lodash'
import { config } from '../../config/app'
import moment from 'moment'
import sizeOf from 'image-size'
import path from 'path'
import fs from 'fs'

import { saveEarnings } from "./earnSettingsCtlr"

var jwt = require('jsonwebtoken');
const argon2 = require('argon2');
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async')
var sharp = require('sharp')
var AWS = require('aws-sdk')
var Excel = require('exceljs');
var mime = require('mime');
var { uuid } = require('uuidv4');

const PasswordGenerator = require('strict-password-generator').default;
const passwordGenerator = new PasswordGenerator();

var s3 = new AWS.S3();
var mailer = require('../mailer');

export function isBase64(str) {
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return base64regex.test(str);
}

export function getMerchants(body, res) {

    var merchants = []
    var categories = []

    const getItems = function () {
        return new Promise(function (resolve, reject) {
            var filter = { account_type: 1, store_name: { $regex: new RegExp(body.searchStr, "i") } }
            if (body.category_id != -1) {
                filter = { account_type: 1, store_name: { $regex: new RegExp(body.searchStr, "i") }, category_id: body.category_id }
            }
            Members.find(filter)
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        merchants = result
                        resolve()
                    }
                });
        })
    }

    const getCategories = function () {
        return new Promise(function (resolve, reject) {
            MerchantCategory.find({})
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        categories = result
                        resolve()
                    }
                });
        })
    }

    getItems()
        .then(getCategories)
        .then(function () {
            res.json({ status: 1, merchants: merchants, categories: categories })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function getMerchantRequests(body, res) {

    var requests = []

    const getItems = function () {
        return new Promise(function (resolve, reject) {
            var params = { req_status: 0, status: 0 }
            // if(body.filter > -1){
            //     params = {status: body.filter}
            // }
            if (body.user_id.isSuperAdmin) {
                params = { req_status: 1, status: 0 }
            }
            MerchantRequest.find(params)
                .populate({ path: "category_id" })
                .sort({ date_requested: -1 })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        requests = result
                        resolve()
                    }
                });
        })
    }

    getItems()
        .then(function () {
            res.json({ status: 1, requests: requests })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function saveMerchant(body, res) {

    var img_url = ""

    const checkDuplicate = function () {
        return new Promise(function (resolve, reject) {
            var rxp = '^' + body.store_name + '$';
            MerchantRequest.find({ store_name: { $regex: new RegExp(rxp, "i") }, status: 0 })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Merchant already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const uploadPhoto = function () {
        return new Promise(function (resolve, reject) {
            if (_.isEmpty(body.photo_thumb)) {
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
        })
    }

    const saveItem = function () {
        return new Promise(function (resolve, reject) {
            var data = {
                store_name: body.store_name,
                category_id: body.category_id,
                contact_number: body.contact_number,
                email_address: body.email_address,
                address: body.address,
                photo_thumb: img_url,
                date_requested: moment().toDate(),
                status: 0,
                req_status: 0,
                sponsorid: body.sponsorid
            }
            var newMerchant = MerchantRequest(data)
            newMerchant.save((err, obj) => {
                resolve();
            })
        })
    }

    checkDuplicate()
        .then(uploadPhoto)
        .then(saveItem)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function updateMerchantStatus(body, res) {

    var referral_code = ""
    var userid = ""
    var temp_pwd = ""
    var new_member = null

    const checkMobileExisting = function () {
        return new Promise(function (resolve, reject) {
            if (body.status == 2) {
                resolve()
            } else {
                Members.findOne({ mobileno: body.contact_number })
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
        })
    }


    const checkEmailExisting = function () {
        return new Promise(function (resolve, reject) {
            if (body.status == 2) {
                resolve()
            } else {
                var un = '^' + body.email_address + '$';
                Members.findOne({ emailadd: { $regex: new RegExp(un, "i") } })
                    .exec((err, result) => {
                        if (err) {
                            reject({ name: err.name });
                        } else {
                            if (!_.isEmpty(result)) {
                                reject({ name: "Email address already exists." });
                            } else {
                                resolve()
                            }
                        }
                    });
            }
        })
    }

    const updateItem = function () {
        return new Promise(function (resolve, reject) {
            var params = {}
            if (body.status == 2) {
                if (body.user_id.isSuperAdmin) {
                    params = { req_status: 0, status: 0 }
                } else {
                    params = { req_status: 0, status: 2 }
                }
            } else {
                if (body.user_id.isSuperAdmin) {
                    params = { status: body.status }
                } else {
                    params = { req_status: 1 }
                }
            }
            MerchantRequest.findByIdAndUpdate(body._id, params)
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        resolve()
                    }
                });
        })
    }

    const createUserId = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                if (body.status != 1) {
                    resolve()
                } else {
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
                }
            } else {
                resolve()
            }
        })
    }

    const createCode = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                if (body.status != 1) {
                    resolve()
                } else {

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
                }
            } else {
                resolve()
            }
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

    const saveNewMember = function () {
        return new Promise(function (resolve, reject) {
            if (body.user_id.isSuperAdmin) {
                if (body.status != 1) {
                    resolve()
                } else {
                    hashPassword(temp_pwd, function (err, hash) {
                        var data = {
                            user_id: userid,
                            fname: "",
                            lname: "",
                            fullname: "",
                            mobileno: body.contact_number,
                            emailadd: body.email_address,
                            pin: "",
                            referral_code: referral_code,
                            isReferral: false,
                            sponsorid: null,
                            status: 0,
                            photo_thumb: body.photo_thumb,
                            isAdmin: false,
                            pwd: hash,
                            plainpwd: temp_pwd,
                            date_subscribed: moment().format("MM/DD/YYYY HH:mm:ss"),
                            store_name: body.store_name,
                            address: body.address,
                            account_type: 1,
                            category_id: body.category_id,
                            sponsorid: body.sponsorid
                        }
                        var newMember = Members(data)
                        newMember.save((err, obj) => {
                            new_member = obj
                            resolve();
                        })
                    })
                }
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
                    to: body.email_address,
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

    checkMobileExisting()
        .then(checkEmailExisting)
        .then(updateItem)
        .then(createCode)
        .then(createUserId)
        .then(createPassword)
        .then(saveNewMember)
        .then(saveEarningHeader)
        .then(sendMail)
        .then(function () {
            if (new_member) {
                saveEarnings(new_member._id, 1, () => { })
            }
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function getMerchantDetails(id, res) {

    var merchant = {}
    var products = []

    const getMerchant = function () {
        return new Promise(function (resolve, reject) {
            Members.findById(new ObjectId(id))
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        merchant = result
                        resolve()
                    }
                });
        })
    }

    const getProducts = function () {
        return new Promise(function (resolve, reject) {
            Product.find({ member_id: new ObjectId(id) })
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        products = result
                        resolve()
                    }
                });
        })
    }

    getMerchant()
        .then(getProducts)
        .then(function () {
            res.json({ status: 1, merchant: merchant, products: products })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function saveProduct(body, res) {

    var product_url = ""

    const checkDuplicate = function () {
        return new Promise(function (resolve, reject) {
            var rxp = '^' + body.product_name + '$';
            Product.find({ product_name: { $regex: new RegExp(rxp, "i") }, member_id: body.member_id })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Product already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const uploadProductPhoto = function () {
        return new Promise(function (resolve, reject) {
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
                            var key = "product/" + body.merchant_id + "/" + "P" + uuid() + ".png"
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
                                    product_url = config.url + key
                                    resolve()
                                }
                            })
                        }
                    })
            }
        })
    }

    const saveItem = function () {
        return new Promise(function (resolve, reject) {
            var data = {
                member_id: body.member_id,
                product_name: body.product_name,
                price: parseFloat(body.price),
                discount: parseFloat(body.discount || 0),
                discounted_price: parseFloat(body.discounted_price || 0),
                photo_thumb: product_url
            }
            var newProduct = Product(data)
            newProduct.save((err, obj) => {
                resolve();
            })
        })
    }

    checkDuplicate()
        .then(uploadProductPhoto)
        .then(saveItem)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function updateProduct(body, res) {

    var product_url = body.photo_thumb

    const checkDuplicate = function () {
        return new Promise(function (resolve, reject) {
            var rxp = '^' + body.product_name + '$';
            Product.find({ product_name: { $regex: new RegExp(rxp, "i") }, _id: { $ne: body._id } })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Product already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const uploadProductPhoto = function () {
        return new Promise(function (resolve, reject) {
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
                                var key = "product/" + body.merchant_id + "/" + "P" + uuid() + ".png"
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
                                        product_url = config.url + key
                                        resolve()
                                    }
                                })
                            }
                        })
                }
            } else {
                resolve()
            }
        })
    }

    const updateItem = function () {
        return new Promise(function (resolve, reject) {
            var params = {
                product_name: body.product_name,
                price: parseFloat(body.price),
                discount: parseFloat(body.discount),
                discounted_price: parseFloat(body.discounted_price),
                photo_thumb: product_url
            }
            Product.findByIdAndUpdate(new ObjectId(body._id), params)
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        resolve()
                    }
                });
        })
    }

    checkDuplicate()
        .then(uploadProductPhoto)
        .then(updateItem)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function deleteProduct(id, res) {

    const deleteItem = function () {
        return new Promise(function (resolve, reject) {
            Product.findByIdAndDelete(new ObjectId(id))
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        resolve()
                    }
                });
        })
    }

    deleteItem()
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function getCategories(res) {

    var categories = []

    const getItems = function () {
        return new Promise(function (resolve, reject) {
            MerchantCategory.find({})
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        categories = result
                        resolve()
                    }
                });
        })
    }

    getItems()
        .then(function () {
            res.json({ status: 1, categories: categories })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function saveCategory(body, res) {

    const checkDuplicate = function () {
        return new Promise(function (resolve, reject) {
            var rxp = '^' + body.category_name + '$';
            MerchantCategory.find({ category_name: { $regex: new RegExp(rxp, "i") } })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Category already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const saveItem = function () {
        return new Promise(function (resolve, reject) {
            var newCategory = MerchantCategory(body)
            newCategory.save((err, obj) => {
                resolve();
            })
        })
    }

    checkDuplicate()
        .then(saveItem)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function updateCategory(body, res) {

    const checkDuplicate = function () {
        return new Promise(function (resolve, reject) {
            var rxp = '^' + body.category_name + '$';
            MerchantCategory.find({ category_name: { $regex: new RegExp(rxp, "i") }, _id: { $ne: body._id } })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            reject({ name: "Category already exists." });
                        } else {
                            resolve()
                        }
                    }
                });
        })
    }

    const updateItem = function () {
        return new Promise(function (resolve, reject) {
            MerchantCategory.findByIdAndUpdate(new ObjectId(body._id), { category_name: body.category_name })
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        resolve()
                    }
                });
        })
    }

    checkDuplicate()
        .then(updateItem)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function deleteCategory(id, res) {

    const deleteItem = function () {
        return new Promise(function (resolve, reject) {
            MerchantCategory.findByIdAndDelete(new ObjectId(id))
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        resolve()
                    }
                });
        })
    }

    deleteItem()
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}