 
const express = require("express");
const router = express.Router();


const data =[{
    id : 1,
    text : "hh",
    done: false
  }] 

router.get('/', function (req, res) { 
    res.json(data)
    return data 
  }) 


router.post("/",() =>{
const{text, done} = req.body;
data.push({
    id: id++, text, done
})
return res.send("success")
})


module.exports = router;
 