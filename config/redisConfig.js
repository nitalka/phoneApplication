const redis=require('redis');
const express=require('express');

const REDIS_PORT=process.env.REDIS_PORT||6379;
const client = redis.createClient(REDIS_PORT);


client.on('connect',function() {
    console.log("conected...");
})

client.on('error',function(error){
    console.log("error while connecting..");
})

module.exports=client;