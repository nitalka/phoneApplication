const dynamoDB=require('..//config/DynamoDbConfig');
const uuidv1 = require('uuid/v1');
const redisClient=require("../config/redisConfig");


exports.getCachedUserData = (phoneNo, callback)=>{

    redisClient.get(phoneNo,(err,reply)=> {
        if(reply){
            console.log("fetching data from redis.....");
            console.log(reply);
            callback(null, reply);
        } else {
            callback(err, null);
        } 
    })
}

exports.getAllUsersData = async() => { 

    try{
        
        var params = {
            TableName:"MyPhoneTable"
        };
    
        let queryExecute = new Promise((resolve, reject) => {
            dynamoDB.scan(params,function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    console.log("Success! scan method fetch data from dynamodb");
                    resolve(data.Items);
                    if(data==null) {
                        return "data does not exist";
                    }
                }
                
            }); 
        });
    
        const result = await queryExecute;
        console.log(result); 
        return result;

    } catch(err) {
       throw err;
    }
}


exports.getUserDataByNumber = async(phoneNo) => {

    try{
        var params = {
            TableName:"MyPhoneTable",
            Key:{
                "phoneNo": phoneNo
            }
        };

        let queryExecute = new Promise((resolve, reject) => {
            dynamoDB.get(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    console.log("Success! get method fetch data from dynamodb");
                    resolve(data);
                    redisClient.setex(phoneNo,3600,JSON.stringify(data));
                }
            }); 
        });
        const result = await queryExecute;
        console.log(result);
        return result;
    } catch(err) {
        throw err;
    }
}


exports.createNewUserData=async(body)=> {

    const phoneNo=body.phoneNo;
    const username=body.username;
    const address=body.address;
    const createdAt = Date.now();
    const uuid=uuidv1();    

    try {
        const params = {
            TableName: "MyPhoneTable",
            Item: {
            "phoneNo": phoneNo,
            "username": username,
            "address": address,
            "createdAt":createdAt,
            "uuid":uuid
            },
            //ConditionExpression: "phoneNo <> :phoneNo",
            ConditionExpression: "attribute_not_exists(phoneNo)",
            // ExpressionAttributeValues:{
            //     ":phoneNo": phoneNo
            // }
        };
        let putExecute = new Promise((resolve, reject) => {
            dynamoDB.put(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    resolve(params.Item);
                    redisClient.setex(phoneNo,60,JSON.stringify(params.Item));
                } 
            });
        });
        const result=await putExecute; 
        return result;
    } catch(err) {
        throw err;
    }
}


exports.updateUserDataByNumber=async(phoneNo,body)=> {

    try{
        const myphoneNo=phoneNo;
        const myaddress=body.address;
        const myusername=body.username;
     
         
         const params = {
             TableName: "MyPhoneTable",
             Key:{
                 "phoneNo":myphoneNo
 
             },
             UpdateExpression: "set address = :r,username =  :y ",
             ConditionExpression: "phoneNo = :myphoneNo",
             ExpressionAttributeValues:{
                 ":r": myaddress,
                 ":y": myusername,
                 ":myphoneNo":myphoneNo
             },
             ReturnValues:"ALL_NEW"
           };

        let putExecute = new Promise((resolve, reject) => {
            dynamoDB.update(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    resolve(data.Attributes);
                    let value=data.Attributes;
                    console.log("BBBB");
                    redisClient.get(phoneNo,(err,reply)=>{
                        console.log(reply);
                        if(reply){
                            reply=JSON.parse(reply);
                            if(myusername){
                                reply.username=myusername;
                            }
                            if(myaddress){
                                reply.address=myaddress;
                            }
                            redisClient.setex(phoneNo, 3600, JSON.stringify(reply));
                            
                        } else if(err) {
                            console.log("aaaa");
                            redisClient.del(phoneNo);
                            console.log(err);
                        }
                    });
                }
            });
        })
        const result=await putExecute;
        return result;
    } catch(err) {
        throw err;
    }
}

exports.deleteUserDataByNumber=async(phoneNo) => {

    try{
        console.log(phoneNo);
        var params = {
            TableName:"MyPhoneTable",
            Key:{
                "phoneNo": phoneNo
            },
            //ConditionExpression: "phoneNo = :phoneNo",
            ConditionExpression: "attribute_exists(phoneNo)",
            // ExpressionAttributeValues:{
            //     ":phoneNo":phoneNo
            // },
            ReturnValues:"ALL_OLD"
          
        };
    
    
        let queryExecute = new Promise((resolve, reject) => {
            dynamoDB.delete(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    console.log("Deleted Successfully user :"+phoneNo);
                    console.log(data);
                    resolve(data);  
                    redisClient.del(phoneNo, function(err, response) {
                        console.log(response);
                        if (response == 1) {
                           console.log("Deleted Successfully!")
                        } else{
                         console.log("Cannot delete")
                        }
                    })          
                }
            }); 
        });
        const result = await queryExecute;
        console.log('result', result);
        return result; 
    }
    catch(err){
        console.log("aaassss");
        throw err;
    }
}

exports.getUsersDataPaginated=async(query) => {

    try{
        console.log("query", query);
        const limit=query.limit;
        var params = {
            TableName:"MyPhoneTable",
            Limit:limit
        };

        if(query.LastEvaluatedKey) {
            params.ExclusiveStartKey = { "phoneNo" : query.LastEvaluatedKey }
        }

        let queryExecute = new Promise((resolve, reject) => {
            dynamoDB.scan(params,function(err, data) {
                
                if (err) {
                    console.log("Error", err);
                    reject(err);
                } else {
                    console.log("Success! paginated scan method fetch data from dynamodb");
                    resolve(data.Items);
                    if(data==null) {
                        return "data does not exist";
                    }
                }
                
            }); 
        });
    
        const result = await queryExecute;
        console.log(result); 
        return result;
    } catch(err) {
        console.log(err);
       throw err;
    }
}








