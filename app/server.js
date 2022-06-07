const express = require("express");
const app = express();
const port = 4000

const axios = require("axios")
const { connectDB } = require('./db')
const Station = require("./model");

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/:address', async(req, res) => {
    let { address } = req.params;
    const coordinates = await GetCoordinates(address);
    connectDB();
    await Station.find(
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
        if(err) {
            return  res.status(500).send({
                status: false,
                data: err
            })
        }
        if(location){
            return  res.status(200).send({
                status: true,
                data: location
            })
        }
    })
})
//refer from Roy
async function GetCoordinates(address) {
    let data = await (await axios.get(`https://www.google.com/maps/place?q=${encodeURI(address)}`)).data;
    data = data.toString();
    let pos = data.indexOf('center') + 7;
    data = data.slice(pos, pos + 50);
    const lat = data.slice(0, data.indexOf('%2C'));
    const lng = data.slice(data.indexOf('%2C') + 3, data.indexOf('&amp'));
    return [parseFloat(lng), parseFloat(lat)];
}
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})