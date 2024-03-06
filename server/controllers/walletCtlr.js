import WRequest from '../models/wrequest'
import Earning from '../models/earning'
import EarningTransaction from '../models/earning_transaction'
import Member from '../models/member'
import MoveStatus from '../models/move_status'

import Paymethod from '../models/paymethod'
import _ from 'lodash'
import moment from 'moment'

import { updateBalances } from './earnSettingsCtlr'

var ObjectId = require('mongoose').Types.ObjectId;

export function getAllReq(body, res) {

    var wrequests = []

    var params = {}
    if (body.filter > -1) {
        params = { status: body.filter }
    }

    const getItems = function () {
        return new Promise(function (resolve, reject) {
            WRequest.find(params)
                .populate({ path: "member_id" })
                .populate({path: "paymethod_id"})
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        reject({ name: err.name });
                    } else {
                        wrequests = result
                        resolve()
                    }
                });
        })
    }

    getItems()
        .then(function () {
            res.json({ status: 1, data: wrequests })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}


export function approve(body, res) {

    var request = null
    var earning_header = null
    var moveStatus = null

    const checkMoveStatus = function () {
        return new Promise(function (resolve, reject) {
            MoveStatus.findOne({ member_id: body.member_id, transtype: body.transtype, }).exec((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    if (result) {
                        moveStatus = result
                        if (Number(result.transaction_id) == Number(body.transId)) {
                            resolve()
                        } else {
                            reject({ name: "Transaction failed. Please try again later." })
                        }
                    } else {
                        resolve()
                    }
                }
            })
        })
    }

    const validate = function () {
        return new Promise(function (resolve, reject) {
            WRequest.findById(new ObjectId(body.id))
                .exec((err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (!_.isEmpty(result)) {
                            if (result.status == 1) {
                                reject({ name: "Request already approved." });
                            } else if (result.status == 2) {
                                reject({ name: "Request already rejected." });
                            } else {
                                request = result
                                resolve()
                            }
                        } else {
                            reject({ name: "Request not found." })
                        }
                    }
                });
        })
    }

    const checkBalance = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: request.member_id }).lean().exec((err, result) => {
                if (result) {
                    if (Number(request.amount) > Number(result.balance)) {
                        reject({ name: "Insufficient balance." })
                    } else {
                        earning_header = result
                        resolve()
                    }
                } else {
                    reject({ name: "Earnings not found." })
                }
            })
        })
    }

    const saveTransaction = function () {
        return new Promise(function (resolve, reject) {
            let obj = {
                earning_id: earning_header._id,
                transdate: moment().toDate(),
                transtime: moment().toDate(),
                earning_type: 2,
                amount: request.amount,
                member_id: request.member_id,
                from_member_id: request.member_id
            }

            const newEarningTransaction = new EarningTransaction(obj)
            newEarningTransaction.save((err, result) => {
                updateBalances(earning_header._id, () => { })
                resolve()
            })
        })
    }

    const update = function () {
        return new Promise(function (resolve, reject) {
            WRequest.findByIdAndUpdate(new ObjectId(body.id), { status: 1 }).exec((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve()
                }
            });
        })
    }

    checkMoveStatus()
        .then(validate)
        .then(checkBalance)
        .then(saveTransaction)
        .then(update)
        .then(function () {
            updateMoveStatus(moveStatus)
            res.json({ status: 1 })
        })
        .catch(function (err) {
            console.log(err);
            updateMoveStatus(moveStatus)
            res.json({ status: 0, message: err.name });
        })
}

export function reject(id, res) {

    const validate = function () {
        return new Promise(function (resolve, reject) {
            WRequest.findById(new ObjectId(id))
                .exec((err, result) => {
                    if (err) {
                        reject({ name: err.name });
                    } else {
                        if (!_.isEmpty(result)) {
                            if (result.status == 1) {
                                reject({ name: "Request already approved." });
                            } else if (result.status == 2) {
                                reject({ name: "Request already rejected." });
                            }
                        }
                        resolve()
                    }
                });
        })
    }

    const update = function () {
        return new Promise(function (resolve, reject) {
            WRequest.findByIdAndUpdate(new ObjectId(id), { status: 2 }).exec((err, result) => {
                if (err) {
                    var _err = { name: err.name };
                    reject(_err);
                } else {
                    resolve()
                }
            });
        })
    }

    validate()
        .then(update)
        .then(function () {
            res.json({ status: 1, message: "success" })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function saveRequest(body, res) {
  
    const checkBalance = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: body.member_id }).lean().exec((err, result) => {
                if (result) {
                    if (Number(body.amount) > Number(result.balance)) {
                        reject({ name: "Insufficient balance." })
                    } else {
                        resolve()
                    }
                } else {
                    reject({ name: "Earnings not found." })
                }
            })
        })
    }

    const saveItem = function () {

        var data = {
            member_id: body.member_id,
            paymethod_id: body.paymethod,
            transtime: moment().format('MM/DD/YYYY HH:mm:ss'),
            transdate: moment().format('MM/DD/YYYY'),
            recipient: body.recipient,
            mobileno: body.mobileno,
            bankname: body.bankname,
            branch: body.branch,
            accountno: body.accountno,
            accountname: body.accountname,
            amount: Number(body.amount),
            status: 0,
            ptype: body.ptype
        }

        return new Promise(function (resolve, reject) {
            var newRecord = WRequest(data)
            newRecord.save((err, obj) => {
                resolve();
            })
        })
    }

    checkBalance()
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

const updateMoveStatus = function (moveStatus) {
    if (moveStatus) {
        MoveStatus.findByIdAndUpdate(moveStatus._id, { transaction_id: 0 }).exec((err, result) => {

        })
    }
}

export function transfer(body, res) {

    var recepient = null
    var sender_earning_header = null
    var recepient_earning_header = null
    var moveStatus = null

    const checkMoveStatus = function () {
        return new Promise(function (resolve, reject) {
            MoveStatus.findOne({ member_id: body.sender_id, transtype: body.transtype, }).exec((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    if (result) {
                        moveStatus = result
                        if (Number(result.transaction_id) == Number(body.transId)) {
                            resolve()
                        } else {
                            reject({ name: "Transaction failed. Please try again later." })
                        }
                    } else {
                        resolve()
                    }
                }
            })
        })
    }

    const checkRecepient = function () {
        return new Promise(function (resolve, reject) {
            Member.findOne({ mobileno: body.form.receiver_number }).lean().exec((err, result) => {
                if (result) {
                    if (result._id == body.sender_id) {
                        reject({ name: "Invalid receiver number." })
                    } else {
                        recepient = result
                        resolve()
                    }
                } else {
                    reject({ name: "Receiver number does not exists." })
                }
            })
        })
    }

    const checkBalance = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: body.sender_id }).lean().exec((err, result) => {
                if (result) {
                    if (Number(body.form.amount) > Number(result.balance)) {
                        reject({ name: "Insufficient balance." })
                    } else {
                        sender_earning_header = result
                        resolve()
                    }
                } else {
                    reject({ name: "Earnings not found." })
                }
            })
        })
    }

    const getRecepientEarningHeader = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: recepient._id }).lean().exec((err, result) => {
                if (result) {
                    recepient_earning_header = result
                    resolve()
                } else {
                    reject({ name: "Recepient earnings not found." })
                }
            })
        })
    }

    const saveTransferTransactions = function () {
        return new Promise(function (resolve, reject) {
            let earningsTrans = [
                // SEND
                {
                    earning_id: sender_earning_header._id,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    earning_type: 3,
                    amount: body.form.amount,
                    member_id: body.sender_id,
                    from_member_id: recepient._id
                },
                // RECEIVE
                {
                    earning_id: recepient_earning_header._id,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    earning_type: 4,
                    amount: body.form.amount,
                    member_id: recepient._id,
                    from_member_id: body.sender_id
                }
            ]

            EarningTransaction.insertMany(earningsTrans).then(() => {
                updateBalances(sender_earning_header._id, () => { })
                updateBalances(recepient_earning_header._id, () => { })
                resolve()
            })
        })
    }

    checkMoveStatus()
        .then(checkRecepient)
        .then(checkBalance)
        .then(getRecepientEarningHeader)
        .then(saveTransferTransactions)
        .then(function () {
            updateMoveStatus(moveStatus)
            res.json({ status: 1 })
        })
        .catch(function (err) {
            console.log(err);
            updateMoveStatus(moveStatus)
            res.json({ status: 0, message: err.name });
        })
}

export function pay(body, res) {

    var recepient = null
    var sender_earning_header = null
    var recepient_earning_header = null
    var moveStatus = null

    const checkMoveStatus = function () {
        return new Promise(function (resolve, reject) {
            MoveStatus.findOne({ member_id: body.sender_id, transtype: body.transtype, }).exec((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    if (result) {
                        moveStatus = result
                        if (Number(result.transaction_id) == Number(body.transId)) {
                            resolve()
                        } else {
                            reject({ name: "Transaction failed. Please try again later." })
                        }
                    } else {
                        resolve()
                    }
                }
            })
        })
    }

    const checkRecepient = function () {
        return new Promise(function (resolve, reject) {
            Member.findOne({ mobileno: body.form.receiver_number }).lean().exec((err, result) => {
                if (result) {
                    if (result._id == body.sender_id) {
                        reject({ name: "Invalid receiver number." })
                    } else {
                        recepient = result
                        resolve()
                    }
                } else {
                    reject({ name: "Receiver number does not exists." })
                }
            })
        })
    }

    const checkBalance = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: body.sender_id }).lean().exec((err, result) => {
                if (result) {
                    if (Number(body.form.amount) > Number(result.balance)) {
                        reject({ name: "Insufficient balance." })
                    } else {
                        sender_earning_header = result
                        resolve()
                    }
                } else {
                    reject({ name: "Earnings not found." })
                }
            })
        })
    }

    const getRecepientEarningHeader = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: recepient._id }).lean().exec((err, result) => {
                if (result) {
                    recepient_earning_header = result
                    resolve()
                } else {
                    reject({ name: "Recepient earnings not found." })
                }
            })
        })
    }

    const saveTransferTransactions = function () {
        return new Promise(function (resolve, reject) {
            let earningsTrans = [
                // SEND
                {
                    earning_id: sender_earning_header._id,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    earning_type: 3,
                    amount: body.form.amount,
                    member_id: body.sender_id,
                    from_member_id: recepient._id
                },
                // RECEIVE
                {
                    earning_id: recepient_earning_header._id,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    earning_type: 4,
                    amount: body.form.amount,
                    member_id: recepient._id,
                    from_member_id: body.sender_id
                }
            ]

            EarningTransaction.insertMany(earningsTrans).then(() => {
                updateBalances(sender_earning_header._id, () => { })
                updateBalances(recepient_earning_header._id, () => { })
                resolve()
            })
        })
    }

    checkMoveStatus()
        .then(checkRecepient)
        .then(checkBalance)
        .then(getRecepientEarningHeader)
        .then(saveTransferTransactions)
        .then(function () {
            updateMoveStatus(moveStatus)
            res.json({ status: 1 })
        })
        .catch(function (err) {
            console.log(err);
            updateMoveStatus(moveStatus)
            res.json({ status: 0, message: err.name });
        })
}

export function getDD(body, res){
    
    var paymethods =  []

    const getItems = function(){
        return new Promise(function(resolve, reject){
            Paymethod.find({ptype: body.ptype})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    paymethods = result
                    resolve()
                }
            });
        })
    }

    getItems()
    .then(function(){
        res.json({status: 1, message: "success", data: paymethods})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}