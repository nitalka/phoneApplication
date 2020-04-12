const express=require('express');
const userModel=require('../models/userModel');
const dynamoDB=require('../config/DynamoDbConfig');
const uuidv1 = require('uuid/v1');

exports.getCachedData= (req,res,next)=> {
    
    const phoneNo=req.params.phoneNo;
    let callback = (err, result) => {
        if(result!=null) {
            if(Object.keys(result).length ===0) {
                next();
            } else {
                res.status(200).send(JSON.parse(result));
            }
        } else  {
            next();
        }
    }
    userModel.getCachedUserData(phoneNo, callback);
}

exports.getAllUsers = async (req,res) => {
    try {
        const result = await userModel.getAllUsersData();
        if(result == "data does not exist") {
            res.status(500).send(result);
        } else {
            res.status(200).send(result);
        }   
    } catch(err) {
        res.status(500).send(err.message);
    }
}

exports.getUserByNumber= (req,res)=>{

    userModel.getUserDataByNumber(req.params.phoneNo).then(result=>{
        if(Object.keys(result).length === 0) {
            res.status(500).send("Item is not present");
        } else {
            res.status(200).send(result);
        }
    }).catch((err)=> {
        res.status(500).send({err:err.message}); 
    });
}

exports.createNewUser=(req,res)=>{
    const body=req.body;
    console.log(body);
    const result=userModel.createNewUserData(body).then(result=>{
        res.status(201).send(result)
    }).catch(err=>{
        if(err.message =="The conditional request failed") {
            res.status(400).send("PhoneNo already exists!!");
        } else {
            res.status(500).send(err.message);
        }
    })
}


exports.updateUserByNumber=(req,res)=>{

userModel.updateUserDataByNumber(req.params.phoneNo,req.body).then(result=>{
    res.status(201).send(result)
}).catch(e=>{res.status(500).send("User does not exist")});

}

exports.deleteUserByNumber=(req,res)=> {

    userModel.deleteUserDataByNumber(req.params.phoneNo).then((result) => {
        res.status(200).json(result);
    }).catch((e)=>{
        if(e.message =="The conditional request failed") {
            res.status(400).send("PhoneNo does not exists!!");
        } else{
            res.status(500).send(e.message);
        }
    })
}

exports.getUsersPaginated=(req,res)=> {

    userModel.getUsersDataPaginated(req.query).then(result=>{
        res.status(200).send(result);
    }).catch(e=>{
        res.status(500).send(e.message);
    });
}


