var AWS = require('aws-sdk');
let awsConfig = {
    "region": "ap-south-1",
    "endpoint": "http://dynamodb.ap-south-1.amazonaws.com",
};


AWS.config.update(awsConfig);

let dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports=dynamoDB;

