const express = require('express');
const bodyParser = require('body-parser');
const easyxml = require('easy-soap-request');
const xmlsjs = require('xml-js');
const bseconfig = require('../model/bseConfig');
const router = express.Router();

bseconfig.aggregate([{$project:{"bseProd.MFD.userId":1,"bseProd.MFD.memberId":1,"bseProd.MFD.password":1,"_id":0}}]).then((result)=>{
  let a = Object.entries(result)
  a.forEach(([key,value])=>{
    // console.log(value)
    // console.log(value.bseProd.MFD.userId)
  })
}).catch((err)=>{
  console.log(err);
})

router.post('/api/mforderentry',(req,res)=>{
  console.log('Working..!');
  let uid         = req.body.uid;
  let orderval    = req.body.orderval;
  let schemecode  = req.body.schemecode;
  let d = new Date();
  var transNo=`${d.getFullYear()}${d.getMonth()}${d.getDate()}${d.getSeconds()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`;
  const url ='https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure';
  const header = {
    'Content-Type':'application/soap+xml'
    };
    bseconfig.aggregate([{$project:{"bseProd.MFD.userId":1,"bseProd.MFD.memberId":1,"bseProd.MFD.password":1,"_id":0}}]).then((result)=>{
      let a = Object.entries(result)
      a.forEach(([key,value])=>{
        // console.log(value.bseProd.MFD.userId)
        const userid    = value.bseProd.MFD.userId;
        const memberid  = value.bseProd.MFD.memberId;
        const password  = value.bseProd.MFD.password;
        const xmlbody = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:bses="http://bsestarmf.in/">
                    <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://bsestarmf.in/MFOrderEntry/getPassword</wsa:Action><wsa:To>https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure</wsa:To></soap:Header>
                    <soap:Body>
                      <bses:getPassword>
                          <!--Optional:-->
                          <bses:UserId>${userid}</bses:UserId>
                          <!--Optional:-->
                          <bses:Password>${password}</bses:Password>
                          <!--Optional:-->
                          <bses:PassKey>ragu@123</bses:PassKey>
                      </bses:getPassword>
                    </soap:Body>
                    </soap:Envelope>`;  
        const xmlresponse = easyxml({url:url,headers:header,xml:xmlbody}).then(({response:{body,statusCode}})=>{
          let jsondata = xmlsjs.xml2json(body,{compact: true, spaces: 4});
          jsondata = JSON.parse(jsondata);
          const code = jsondata['s:Envelope']['s:Body']['getPasswordResponse']['getPasswordResult']['_text'];
          var status = code.slice(0,3);
          console.log("Password API", status);
          if(status == '100'){
          let encryptedpassword = code.substring(4);
          const orderEntryBody = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:bses="http://bsestarmf.in/">
                        <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://bsestarmf.in/MFOrderEntry/orderEntryParam</wsa:Action><wsa:To>https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc/Secure</wsa:To></soap:Header>
                        <soap:Body>
                          <bses:orderEntryParam>
                              <!--Optional:-->
                              <bses:TransCode>NEW</bses:TransCode>
                              <!--Optional:-->
                              <bses:TransNo>${transNo}</bses:TransNo>
                              <!--Optional:-->
                              <bses:OrderId></bses:OrderId>
                              <!--Optional:-->
                              <bses:UserID>${userid}</bses:UserID>
                              <!--Optional:-->
                              <bses:MemberId>${memberid}</bses:MemberId>
                              <!--Optional:-->
                              <bses:ClientCode>${uid}</bses:ClientCode>
                              <!--Optional:-->
                              <bses:SchemeCd>${schemecode}</bses:SchemeCd>
                              <!--Optional:-->
                              <bses:BuySell>P</bses:BuySell>
                              <!--Optional:-->
                              <bses:BuySellType>FRESH</bses:BuySellType>
                              <!--Optional:-->
                              <bses:DPTxn>P</bses:DPTxn>
                              <!--Optional:-->
                              <bses:OrderVal>${orderval}</bses:OrderVal>
                              <!--Optional:-->
                              <bses:Qty></bses:Qty>
                              <!--Optional:-->
                              <bses:AllRedeem>N</bses:AllRedeem>
                              <!--Optional:-->
                              <bses:FolioNo></bses:FolioNo>
                              <!--Optional:-->
                              <bses:Remarks></bses:Remarks>
                              <!--Optional:-->
                              <bses:KYCStatus>Y</bses:KYCStatus>
                              <!--Optional:-->
                              <bses:RefNo></bses:RefNo>
                              <!--Optional:-->
                              <bses:SubBrCode></bses:SubBrCode>
                              <!--Optional:-->
                              <bses:EUIN>E026424</bses:EUIN>
                              <!--Optional:-->
                              <bses:EUINVal>N</bses:EUINVal>
                              <!--Optional:-->
                              <bses:MinRedeem>N</bses:MinRedeem>
                              <!--Optional:-->
                              <bses:DPC>Y</bses:DPC>
                              <!--Optional:-->
                              <bses:IPAdd></bses:IPAdd>
                              <!--Optional:-->
                              <bses:Password>${encryptedpassword}</bses:Password>
                              <!--Optional:-->
                              <bses:PassKey>ragu@123</bses:PassKey>
                              <!--Optional:-->
                              <bses:Parma1></bses:Parma1>
                              <!--Optional:-->
                              <bses:Param2></bses:Param2>
                              <!--Optional:-->
                              <bses:Param3></bses:Param3>
                          </bses:orderEntryParam>
                        </soap:Body>
                      </soap:Envelope>`;
                      const orderEntryResponse =easyxml({url:url,headers:header,xml:orderEntryBody}).then(({response:{body,orderStatusCode}})=>{
                        let orderResponseToJson = xmlsjs.xml2json(body,{compact: true, spaces: 4});
                        orderResponseToJson = JSON.parse(orderResponseToJson)
                        const orderResponse = orderResponseToJson['s:Envelope']['s:Body']["orderEntryParamResponse"]["orderEntryParamResult"]['_text'];
                          // res.json(orderResponse);
                        console.log(orderResponse);
                          let data = orderResponse.split("|");
                        //  console.log(data.length)
                        if(data[7]=="1"){
                          res.json({
                            "status":403,
                            "data":[],
                            "message":data[6]
                          })
                        }
                        if(data[7]="0"){
                         res.json({
                           "status":200,
                          "data":{
                            "ordertype":data[0],
                            "ordernumber":data[2],
                            "ordermessage":data[6]
                          },
                          "message": "Success...!"
                         }) 
                        }
                      })          
          }
        })
      })
    }).catch((err)=>{
     res.json({
       "status":500,
       "data":[],
       "message":"Somthing Went to Wrong..!" + err
     })
    })  
})

module.exports = router;