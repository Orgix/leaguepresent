import dotenv from 'dotenv';
dotenv.config();

// Region mapping object
const regionMapping = {
    eun1: 'europe',
    euw1: 'europe',
    na1: 'americas',
    oc1:'sea',
    kr: 'asia',
    jp: 'asia',
    br:'americas',
    lan1:'americas',
    lan2:'americas',
    // Add more region codes and their corresponding region names here
  };
const spells = {
    1:["SummonerBoost","Cleanse"],
    3:["SummonerExhaust","Exhaust"],
    4:["SummonerFlash","Flash"],
    6:["SummonerHaste","Ghost"],
    7:["SummonerHeal","Heal"],
    11:["SummonerSmite","Smite"],
    12:["SummonerTeleport","Teleport"],
    13:["SummonerMana","Clarity"],
    14:["SummonerDot", "Ignite"],
    21:["SummonerBarrier","Barrier"],
    32:["SummonerSnowball","Mark"]
 }
export const queueTypes={
    420:'5v5 Ranked Solo',
    450:'ARAM',
    430:'Blind Pick',
    400:'Draft Pick',
    440:'5v5 Flex',
    700:"Summoner's Rift Clash game",
    830:"Intro Tutorial",
    840:"Beginner Co-op",
    850:"Intermediate Co-op",
    1400:"Ultimate Spellbook"
}
export const config = {
    api:{
        key:process.env.API_KEY
    },
    urls:{
        summoner:'https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summonerName}?api_key={apiKey}',
        ranked: 'https://{region}.api.riotgames.com/lol/league/v4/entries/by-summoner/{encryptedSummonerId}?api_key={apiKey}',
        match: {
            byPuuid: 'https://{region}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=20&api_key={apiKey}',
            singleGame:'https://{region}.api.riotgames.com/lol/match/v5/matches/{matchId}?api_key={apiKey}',
        },
        summonerMastery:''
    },
    regionMapping: regionMapping,
    spellsMappings: spells,
    patch: process.env.ACTIVE_PATCH
}

