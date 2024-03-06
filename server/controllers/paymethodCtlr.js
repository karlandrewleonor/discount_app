import Paymethod from '../models/paymethod'
import _ from 'lodash'

var ObjectId = require('mongoose').Types.ObjectId;

export function getAll(res){

    var paymethods = []

    const getItems = function(){
        return new Promise(function(resolve, reject){
            Paymethod.find({})
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
        res.json({status: 1, data: paymethods})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function savePaymethod(body, res){

    const checkDuplicate = function(){
        return new Promise(function(resolve, reject){
            var rxp = '^' + body.name + '$';
            Paymethod.find({name: { $regex: new RegExp(rxp, "i") }})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    if(!_.isEmpty(result)){
                        reject({ name: "Payment Method already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const saveItem = function(){
        return new Promise(function(resolve, reject){
            var newRecord= Paymethod(body)
            newRecord.save((err, obj)=>{
                resolve();
            })
        })
    }

    checkDuplicate()
    .then(saveItem)
    .then(function(){
        res.json({status: 1, message: "success"})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function updatePaymethod(body, res){
 
    const checkDuplicate = function(){
        return new Promise(function(resolve, reject){
            var rxp = '^' + body.name + '$';
            Paymethod.find({name: { $regex: new RegExp(rxp, "i") }, _id: {$ne: body._id}})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    if(!_.isEmpty(result)){
                        reject({ name: "Payment Method already exists." });
                    }else{
                        resolve()
                    }
                }
            });
        })
    }

    const updateItem = function(){
        return new Promise(function(resolve, reject){
            Paymethod.findByIdAndUpdate(new ObjectId(body._id), {name: body.name, ptype: body.ptype})
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    resolve()
                }
            });
        })
    }

    checkDuplicate()
    .then(updateItem)
    .then(function(){
        res.json({status: 1, message: "success"})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}

export function deletePaymethod(id, res){

    const deleteItem = function(){
        return new Promise(function(resolve, reject){
            Paymethod.findByIdAndDelete(new ObjectId(id))
            .exec((err, result)=>{
                if (err){
                    console.log(err)
                    reject({ name: err.name });
                }else{
                    resolve()
                }
            });
        })
    }

    deleteItem()
    .then(function(){
        res.json({status: 1, message: "success"})
    })
    .catch(function(err){
        console.log(err);
        var response =  {status: 0, message: err.name };
        res.json(response);
	})
}