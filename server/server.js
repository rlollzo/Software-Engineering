const express = require('express')
const app = express()
const cors = require('cors')
const port = 4444

const mainPage = require("./Router/main")  
const modelPrice = require("./Router/pythonCon") 
const apiSale = require("./Router/apiSale")
const apiReal = require("./Router/apiReal")
const db = require("./Router/db")
const model = require("./Router/pythonCon")
const maria = require("./database/connect/maria")
const corsOption={
    origin : "*",
    optionSuccessStatus:200,
};
  

app.use(cors(corsOption)) 
app.use("/main",mainPage)
app.use("/modelPrice",modelPrice) 
app.use("/apiSale",apiSale)
app.use("/apiReal",apiReal)
app.use("/db",db)
app.use("/model",model)
maria.connect

app.get('/', function (req, res) {
  res.send('Hello Model')
})  
app.listen(port, () =>{
    console.log('Listening on port : ', port)
})

module.exports = app  
 