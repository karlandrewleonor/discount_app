import EarnSettings from '../models/earn_settings'
import MerchantEarnSettings from '../models/merchant_earn_settings'
import Member from '../models/member'
import Earning from '../models/earning'
import EarningTransaction from '../models/earning_transaction'
import MoveStatus from '../models/move_status'

import _ from 'lodash'
import moment from 'moment'
import async from 'async'

var ObjectId = require('mongoose').Types.ObjectId;

function queryTrans(id, ctype, cb) {

    var total = 0

    EarningTransaction.aggregate([
        {
            $match: { earning_id: new ObjectId(id), earning_type: ctype }
        },
        {
            $group: {
                _id: { pid: "$earning_id", ptype: "$earning_type" },
                total: { $sum: "$amount" }
            }
        }
    ])
        .exec((err, result) => {
            if (!err) {
                if (!_.isEmpty(result)) {
                    if (result.length > 0) {
                        total = result[0].total
                        if (total < 0) {
                            total = 0
                        }
                    }
                }
            }
            cb(total)
        })
}

export function updateBalances(id, callback) {

    var total = {
        direct: 0,
        indirect: 0,
        total_sent: 0,
        total_received: 0,
        accumulated: 0,
        total_withdrawal: 0,
        balance: 0
    }

    const getDirect = function () {
        return new Promise(function (resolve, reject) {
            queryTrans(id, 0, (result) => {
                total.direct = result
                resolve()
            })
        })
    }

    const getIndirect = function () {
        return new Promise(function (resolve, reject) {
            queryTrans(id, 1, (result) => {
                total.indirect = result
                resolve()
            })
        })
    }

    const getWithdrawal = function () {
        return new Promise(function (resolve, reject) {
            queryTrans(id, 2, (result) => {
                total.total_withdrawal = result
                resolve()
            })
        })
    }

    const getTotalSent = function () {
        return new Promise(function (resolve, reject) {
            queryTrans(id, 3, (result) => {
                total.total_sent = result
                resolve()
            })
        })
    }

    const getTotalReceived = function () {
        return new Promise(function (resolve, reject) {
            queryTrans(id, 4, (result) => {
                total.total_received = result
                resolve()
            })
        })
    }

    const updateEarning = function () {
        return new Promise(function (resolve, reject) {
            total.accumulated = total.direct + total.indirect + total.total_received

            total.balance = total.accumulated - (total.total_withdrawal + total.total_sent)
            total.balance = total.balance < 0 ? 0 : total.balance

            Earning.findByIdAndUpdate(id, total).exec((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    getDirect()
        .then(getIndirect)
        .then(getWithdrawal)
        .then(getTotalSent)
        .then(getTotalReceived)
        .then(updateEarning)
        .then(() => {
            callback()
        })
        .catch((error) => {
            console.log(error)
            callback()
        })
}

export function getSettings(res) {

    var settings = {}

    const fetchRecord = function () {
        return new Promise(function (resolve, reject) {
            EarnSettings.findOne({})
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        settings = result
                        resolve()
                    }
                });
        })
    }

    fetchRecord()
        .then(function () {
            res.json({ status: 1, data: settings })
        })
        .catch(function (err) {
            console.log(err);
            var response = { status: 0, message: err.name };
            res.json(response);
        })
}

export function updateSettings(body, res) {

    const update = function () {
        return new Promise(function (resolve, reject) {
            var param = {
                direct_referral: body.direct_referral,
                lvl2: body.lvl2,
                lvl3: body.lvl3,
                lvl4: body.lvl4,
                lvl5: body.lvl5,
            }
            if (_.isEmpty(body._id) || body._id == null) {
                var newRecord = EarnSettings(param)
                newRecord.save((err, obj) => {
                    resolve();
                })
            } else {
                EarnSettings.findByIdAndUpdate(new ObjectId(body._id), param).exec((err, result) => {
                    if (err) {
                        var _err = { name: err.name };
                        reject(_err);
                    } else {
                        resolve()
                    }
                });
            }
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

export function getMerchantEarnSettings(res) {

    var settings = null

    const fetchRecord = function () {
        return new Promise(function (resolve, reject) {
            MerchantEarnSettings.findOne({}).exec((err, result) => {
                if (result) {
                    settings = result
                }

                resolve()
            });
        })
    }

    fetchRecord()
        .then(function () {
            res.json({ status: 1, data: settings })
        })
        .catch(function (err) {
            console.log(err);
            res.json({ status: 0, message: err.name });
        })
}

export function updateMerchantEarnSettings(body, res) {

    const update = function () {
        return new Promise(function (resolve, reject) {
            var param = {
                direct_referral: body.direct_referral,
                lvl2: body.lvl2,
                lvl3: body.lvl3,
                lvl4: body.lvl4,
                lvl5: body.lvl5,
            }
            if (_.isEmpty(body._id) || body._id == null) {
                var newRecord = MerchantEarnSettings(param)
                newRecord.save((err, obj) => {
                    resolve();
                })
            } else {
                MerchantEarnSettings.findByIdAndUpdate(new ObjectId(body._id), param).exec((err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve()
                    }
                });
            }
        })
    }


    update()
        .then(function () {
            res.json({ status: 1 });
        })
        .catch(function (err) {
            console.log(err);
            res.json({ status: 0, message: err.name });
        })
}

export function saveEarnings(memberid, etype, callback) {

    // etype 0 - member 1 - merchant

    var earnSettings = null

    function getMember(id, cb) {
        let data = null
        Member.findById(id, "sponsorid").lean().exec((err, result) => {
            if (result) {
                data = result
            }
            cb(data)
        })
    }

    const getEarningSettings = function () {
        return new Promise(function (resolve, reject) {
            if (etype == 0) {
                EarnSettings.findOne({}).lean().exec((err, result) => {
                    if (result) {
                        earnSettings = result
                        resolve()
                    } else {
                        reject({ name: "Earn settings not found." })
                    }
                })
            } else if (etype == 1) {
                MerchantEarnSettings.findOne({}).lean().exec((err, result) => {
                    if (result) {
                        earnSettings = result
                        resolve()
                    } else {
                        reject({ name: "Merchant Earn settings not found." })
                    }
                })
            } else {
                reject({ name: "Invalid type." })
            }
        })
    }

    function getLevelAmount(level, settings, cb) {
        let amount = 0
        if (level == 1) {
            amount = settings.direct_referral
        } else if (level == 2) {
            amount = settings.lvl2
        } else if (level == 3) {
            amount = settings.lvl3
        } else if (level == 4) {
            amount = settings.lvl4
        } else if (level == 5) {
            amount = settings.lvl5
        }

        cb(amount)
    }

    function saveEarningTransaction(id, amount, earning_type, cb) {
        Earning.findOne({ member_id: id }).lean().exec((err, result) => {
            if (result) {
                let obj = {
                    earning_id: result._id,
                    transdate: moment().toDate(),
                    transtime: moment().toDate(),
                    earning_type: earning_type,
                    amount: amount,
                    member_id: id,
                    from_member_id: memberid
                }
                const newEarningTransaction = new EarningTransaction(obj)
                newEarningTransaction.save((err1, result1) => {
                    updateBalances(result._id, () => { })
                    cb()
                })
            } else {
                cb()
            }
        })
    }

    const mapEarnings = function () {
        return new Promise(function (resolve, reject) {
            getMember(memberid, (directSponsor) => {
                let currentSponsorId = directSponsor.sponsorid
                let currentLevel = 1
                async.whilst(
                    function check(proceed) {
                        proceed(null, (currentSponsorId != null && currentLevel <= 5))
                    }, function iter(next) {
                        getLevelAmount(currentLevel, earnSettings, (amount) => {
                            let earning_type = 0
                            if (currentLevel > 1) {
                                earning_type = 1
                            }
                            saveEarningTransaction(currentSponsorId, amount, earning_type, () => {
                                getMember(currentSponsorId, (nextSponsor) => {
                                    currentSponsorId = nextSponsor ? nextSponsor.sponsorid : null
                                    currentLevel += 1
                                    next()
                                })
                            })
                        })
                    }, function () {
                        resolve()
                    }
                )
            })
        })
    }

    getEarningSettings()
        .then(mapEarnings)
        .then(() => {
            callback()
        })
        .catch((error) => {
            console.log(error)
            callback()
        })
}

export function getEarningTransactions(body, res) {

    var earning_id = null

    var header = {
        referral_reward: 0,
        indirect_reward: 0,
        total_earnings: 0,
        total_withdrawn: 0,
        balance: 0
    }

    var transactions = {
        earnings: {},
        withdrawals: {},
        balance_transactions: {}
    }

    const getEarningHeader = function () {
        return new Promise(function (resolve, reject) {
            Earning.findOne({ member_id: body.id }).lean().exec((err, result) => {
                if (result) {
                    earning_id = result._id
                    header.referral_reward = result.direct
                    header.indirect_reward = result.indirect
                    header.total_earnings = Number(result.direct) + Number(result.indirect)
                    header.balance = result.balance
                    resolve()
                } else {
                    reject({ name: "Earnings not found. " })
                }
            })
        })
    }

    const getEarningTransactions = function () {
        return new Promise(function (resolve, reject) {
            EarningTransaction.find({ earning_id: earning_id })
                .populate({ path: "from_member_id", select: "fullname account_type store_name" })
                .sort({ transdate: -1 })
                .lean()
                .exec((err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        let filtered_earnings = _.filter(result, function (o) { return [0, 1].includes(o.earning_type) })
                        transactions.earnings = _.groupBy(filtered_earnings, function (o) { return moment(o.transdate).format("MMM DD, YYYY") })

                        let filtered_withdrawals = _.filter(result, function (o) { return [2].includes(o.earning_type) })
                        transactions.withdrawals = _.groupBy(filtered_withdrawals, function (o) { return moment(o.transdate).format("MMM DD, YYYY") })

                        let filtered_balance_trans = _.filter(result, function (o) { return [3, 4].includes(o.earning_type) })
                        transactions.balance_transactions = _.groupBy(filtered_balance_trans, function (o) { return moment(o.transdate).format("MMM DD, YYYY") })

                        header.total_withdrawn = _.sumBy(Object.keys(transactions.withdrawals), function (o) {
                            return _.sumBy(transactions.withdrawals[o], (i) => { return i.amount })
                        })
                        resolve()
                    }
                })
        })
    }

    getEarningHeader()
        .then(getEarningTransactions)
        .then(() => {
            res.json({ status: 1, header: header, transactions: transactions })
        })
        .catch((error) => {
            console.log(error)
            res.json({ status: 0, message: error.name })
        })

}

export function saveMembersEarningHeader(res) {

    var savedCount = 0

    function checkAndSaveEarningHeader(id, callback) {
        Earning.findOne({ member_id: id }).exec((err, result) => {
            if (result) {
                callback()
            } else {
                let earningObj = {
                    member_id: id,
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
                    savedCount += 1
                    callback()
                })
            }
        })
    }

    const getMembers = function () {
        return new Promise(function (resolve, reject) {
            Member.find({}, "_id").lean().exec((err, result) => {
                async.eachSeries(result, function (e, next) {
                    checkAndSaveEarningHeader(e._id, () => {
                        next()
                    })
                }, function () {
                    console.log(savedCount, " - saved")
                    resolve()
                })
            })
        })
    }

    getMembers()
        .then(() => {
            res.json({ status: 1 })
        })
        .catch((error) => {
            console.log(error)
            res.json({ status: 0, message: error.name })
        })
}

export function createTransferTransaction(body, res) {

    var new_transaction_id = null
    var moveStatus = null

    const checkExistingRecord = function () {
        return new Promise(function (resolve, reject) {
            MoveStatus.findOne({ member_id: body.memberId, transtype: body.transtype }).exec((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    if (result) {
                        moveStatus = result
                        resolve()
                    } else {
                        resolve()
                    }
                }
            })
        })
    }


    const saveOrUpdateRecord = function () {
        return new Promise(function (resolve, reject) {
            new_transaction_id = new Date().getTime()
            if (moveStatus) {
                MoveStatus.findByIdAndUpdate(moveStatus, { transaction_id: new_transaction_id }).exec((err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            } else {
                let obj = {
                    member_id: body.memberId,
                    transtype: body.transtype,
                    status: 0,
                    transaction_id: new_transaction_id
                }

                let newMoveStatus = new MoveStatus(obj)
                newMoveStatus.save((err1, result1) => {
                    if (err1) {
                        reject(err1)
                    } else {
                        moveStatus = result1
                        resolve()
                    }
                })
            }
        })
    }

    checkExistingRecord()
        .then(saveOrUpdateRecord)
        .then(() => {
            res.json({ status: 1, transaction_id: new_transaction_id })
        })
        .catch((error) => {
            console.log(error)
            res.json({ status: 1, message: error.name })
        })
}