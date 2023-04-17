import express from 'express'; 
import fetch from 'node-fetch';
import { config, queueTypes } from './api/config.js';
import { makeApiCall,getChampionName} from './api/helpers.js';


const app = express();
const port = 3000;
const API_KEY = config.api.key;
const status = {
  message:"",
  code:""
}

// Define the API endpoint URL for retrieving ranked data

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/summoner/:Region/:SummonerName', async(request, response)=>{
  try{
    //get root parameters
  const REGION = request.params.Region;
  const SUMMONER_NAME = request.params.SummonerName; 
  //------------------
  //define endpoint url
  const SUMMONER_ENDPOINT =config.urls.summoner.replace('{region}', REGION).replace('{summonerName}', SUMMONER_NAME).replace('{apiKey}', API_KEY);
  //-------------------
  //get Summoner information
  const fetchResponse = await makeApiCall(SUMMONER_ENDPOINT)
  console.log(fetchResponse)
  //if the response had some reason to be incorrect, the status property should exist withing the response object
  //return the status message
  if(fetchResponse["status"]){
    status.message = fetchResponse["status"]["message"];
    status.code = "summoner"
    response.json(status);
  } 
  else{
    //ranked URL
    
    const RANKED_ENDPOINT = config.urls.ranked.replace('{region}', REGION).replace('{encryptedSummonerId}', encodeURIComponent(fetchResponse.id)).replace('{apiKey}', API_KEY);
    
    //proceed with geting the rank of the requested summoner. Keep neededValues in an object
    let sumObj = {
      id:fetchResponse.id,
      puuid:fetchResponse.puuid,
      name: fetchResponse.name,
      profileIcon: fetchResponse.profileIconId,
      level: fetchResponse.summonerLevel,
      server: REGION
    }
      
    //--------------------
      //once id is fetched, replace placeholder with it and fetch any ranked stats on this id
      const fetch_ranked_response = await makeApiCall(RANKED_ENDPOINT)
      //---------------------
      //if response is empty array, update object with value of Unranked
      if(fetch_ranked_response.length < 1){
        sumObj.rank = "Unranked"
      }
      //---------------------
      else{
        //Update rank field with an array. Map loops through each array entry and keeps certain fields
        sumObj.rank = fetch_ranked_response.map(entry=>
        ({TYPE: entry.queueType, TIER : entry.tier, 
          RANK: entry.rank, POINTS: entry.leaguePoints, 
          WINS:entry.wins, LOSSES: entry.losses}))
      }

      
      //--------------------
      //return route results
      response.json(sumObj);
  }
  }
  catch(error){
    console.log(error);
    status.message = error;
    status.code = "server"
    response.status(500).json(status);
  }
})

app.get('/matches/:Region/:puuid', async (request, response) =>{
  const puuid = request.params.puuid;
  const REGION = request.params.Region;
  const MATCH_IDS_ENDPOINT = config.urls.match.byPuuid.replace('{region}',config.regionMapping[REGION]).replace('{puuid}',puuid).replace('{apiKey}',API_KEY);
  let MATCH_ENDPOINT = config.urls.match.singleGame.replace('{region}',config.regionMapping[REGION]).replace('{apiKey}',API_KEY)
  try{
    let matches = [];
    const fetch_match_ids = await makeApiCall(MATCH_IDS_ENDPOINT)
    console.log(fetch_match_ids)
      if(fetch_match_ids.length > 0){
        let iter_match;
        let match_resp;
        
        for(let i=0;i<=9;i++){
            iter_match = MATCH_ENDPOINT;
            iter_match = iter_match.replace('{matchId}',fetch_match_ids[i])
            match_resp = await makeApiCall(iter_match)

            let matchDetails ={
              time:{
              started: match_resp.info.gameCreation,
              ended:match_resp.info.gameEndTimestamp,
              lasted:match_resp.info.gameDuration
            },
            place:match_resp.info.gameMode, 
            summoners: createPartObj(match_resp.info.participants),
            queue: queueTypes[match_resp.info.queueId],
            isRemake: match_resp.info.gameDuration < 300 
          } 
          matches.push(matchDetails);
        }
      }
      else{
        console.log("No matches")
        matches= "No matches Found"
      }
      console.log(matches)
      response.json(matches)
  }
  catch(error){
    console.log(error);
    response.status(500).json({error: 'Internal Server Error'});
  } 
  
})
const createPartObj = (entries) =>{
  return entries.map((entry)=>{
    console.log(entry)
    return ({win : entry.win, team: entry.teamId,name: entry.summonerName, champion: entry.championName,
    cs:entry.totalMinionsKilled,kills: entry.kills, deaths: entry.deaths, assists: entry.assists, kda: determineKDA(entry.kills,entry.deaths,entry.assists)})
  })
}

const determineKDA = (kills,deaths,assists) =>{
  
  if(kills === 0 && deaths === 0 && assists === 0){
    return 0;
  } 
  else if(deaths === 0 && (kills > 0 || assists > 0)){
    return "Perfect"
  } else{
    return parseFloat(((kills+assists)/deaths).toFixed(2))
  }
}
//many summoners have multiple rankings in multiple queues, fix the UI to have all 3 of them presented
// add parameters to the start/end on the match url. e.g. load first 10 games, load the next 10 with the press of a button
//fetch summoners spells used, items before returning the object
//add a method that will be taking the image name for each champion inside the match object in order to use the path at Ddragon
//after testing some edge cases, another change to happen is to make sure that user knows if an associated account has no games(presented)
//separate js code in front