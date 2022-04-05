const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Headers = require('node-fetch').Headers;
const app = express();
let port = 3000;



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



app.listen(port);