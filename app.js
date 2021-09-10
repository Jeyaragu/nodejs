const express = require('express');
const mongoose = require('mongoose');
const app = express();

const port = 1222;

const config = require('./routes/config')

mongoose.connect('mongodb://localhost:27017/node_db',{useNewUrlParser: true,
useUnifiedTopology: true}).then(()=>{
  app.listen(port);
  console.log('App Listing With Port '+port);
}).catch((err)=>{
  console.log(err);
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/',config);


var name = 'aabcc';
let final = []
for (var i = 0;i< name.length;i++){
  for(var j = 1;j < name.length;j++){
    if(name[i].localeCompare(name[j]) != '0' || name[i].localeCompare(name[j]) != '1' || name[i].localeCompare(name[j]) || '-1'){
     console.log(name[j]);
    }
  }
}
// No. Occurance
// How to filter no repeated values


module.exports = app;