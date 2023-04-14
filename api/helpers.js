import fetch from 'node-fetch';

export let champions = {};
export async function makeApiCall(endpoint) {
    const response = await fetch(endpoint, { method: 'GET' });
    const data = await response.json();
    return data;
}

export const getChampionName = async (championId) => {
    if(Object.keys(champions).length === 0){
     champions = JSON.parse(JSON.stringify(await getChampions()))
     
    } 
    
    for (const champion in champions["data"]) {
      if(champions["data"][champion].key == championId){
        return champions["data"][champion].id;
      }
    }
    
    return 'Unknown Champion';
  }
  
  export async function getChampions(){
    const response = await fetch('http://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json');
    const championData = await response.json();
    return championData;
  }

  