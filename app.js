const express = require('express');
const fetch = require('node-fetch');
const Headers = require('node-fetch').Headers;
const crypto = require('crypto');
const app = express();
let port = 3000;


//? Verify checksum is the same.
//! Possibly find new way to do this.
async function verifyCheckSum(data, md5){
    let check = await crypto.createHash('md5').update(data).digest('base64');
    if(check === md5){
        return true;
    }else{
        return false;
    }
}


//! Get an entry from datastore API
app.get('/api/datastore/:universeId/:dataStoreName/:entryKey/:scope', async function(req, res){
    
    //* Verify that an API key was passed.
    let apiKey = await req.get('x-api-key');
    if(apiKey == undefined){return res.send("You did not send an x-api-key header.")};
    

    //* Get params
    let params = await req.params;
    let universeId = params.universeId;
    let dataStoreName = params.dataStoreName;
    let entryKey = params.entryKey;
    let scope = params.scope;

    //* Prep for request
    let url = `https://apis.roblox.com/datastores/v1/universes/${universeId}`;
    let headers = new Headers({
        "x-api-key": apiKey
    });

    //* Make the request
    let response;
    try{
        response = await fetch(`${url}/standard-datastores/datastore/entries/entry?datastoreName=${dataStoreName}&entryKey=${entryKey}&scope=${scope}`, 
        {
            method: 'GET', 
            headers: headers
        });
    }catch(error){
        return res.send(error);
    }

    //* Format and send the data.
    try{
        let data = await response.json();
        res.send(data);
    }catch(error){
        res.send({response: response, error: error});
    }
    
});

//! Update an entry
app.post('/api/datastore/:universeId/:dataStoreName/:entryKey/:scope', express.json({type: '*/*'}), async function(req, res){
    
    //* Verify that an API key & md5 hash was passed.
    let apiKey = await req.get('x-api-key');
    if(apiKey == undefined){return res.send({error: "!API-KEY", explanation: "An x-api-key header is required."})};
    let md5 = await req.get('content-md5');
    if(md5 == undefined){return res.send({error: "!MD5", explanation: "A content-md5 header is required."})};
    

    //* Get params
    let params = await req.params;
    let universeId = params.universeId;
    let dataStoreName = params.dataStoreName;
    let entryKey = params.entryKey;
    let scope = params.scope;
    let body = await req.body;
    let bodyString = JSON.stringify(body);

    //* Verify that the md5 checksum is the same of that which is passed as a parameter.
    let checkSum = await verifyCheckSum(bodyString, md5);
    if(!checkSum){return res.send({error: "MD5 Checksum failed."})};

    //* Prep for request
    let url = `https://apis.roblox.com/datastores/v1/universes/${universeId}`;
    let headers = new Headers({
        "x-api-key": apiKey,
        "content-md5": md5
    });

    //* Make the request
    let response;
    try{
        response = await fetch(`${url}/standard-datastores/datastore/entries/entry?datastoreName=${dataStoreName}&entryKey=${entryKey}&scope=${scope}`, 
        {
            method: 'POST', 
            headers: headers,
            body: bodyString
        });
    }catch(error){
        return res.send(error);
    }

    //* Format and send the data.
    try{
        let data = await response.json();
        res.send({response: data});
    }catch(error){
        res.send({response: response, error: error});
    }
    
});

app.listen(port);
console.log("[✅] Listening on port 3000.");