const express = require("express");
const app = express();
const axios = require("axios")
const mongoose = require('mongoose');
const { connectDB } = require('./db')
const Station = require("./model");

async function GetCoordinates(address) {
    let data = await (await axios.get(`https://www.google.com/maps/place?q=${encodeURI(address)}`)).data;
    data = data.toString();
    let pos = data.indexOf('center') + 7;
    data = data.slice(pos, pos + 50);
    const lat = data.slice(0, data.indexOf('%2C'));
    const lng = data.slice(data.indexOf('%2C') + 3, data.indexOf('&amp'));
    return [parseFloat(lng), parseFloat(lat)];
}

async function GetNearSpot(address){
    console.log("address: ", address);
    const coordinates = await GetCoordinates(address);
    console.log("coordinates: ", coordinates);
    connectDB();
    const res = Station.find(
        {
        location:{
            $near: {
                $geometry:{
                    type: "Point",
                    coordinates 
                },
                $maxDistance: 20*20
            } 
        }
    }
    ).exec((err, location)=>{
        if(err) console.log(err);
        else{
            console.log("location: ", location);
        }
    })
}

setInterval(async()=>{
    await GetNearSpot("台北101");
},3000);