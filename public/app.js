import {stringCapitalize, determineColor, formatDateTime, getTimeAgo} from './helper.js'

let data;
let divRes = document.getElementById("result");
let match_container = document.getElementById("match-cont");
let btnContainer = document.getElementsByClassName("btn-container")[0];
let presented = false;

async function getSummoner(summonerName,Region){
    const response = await fetch(`/summoner/${Region}/${summonerName}`);
    data = await response.json();
    return data;
}

document.getElementById("sumName").addEventListener("keydown",async (ev)=>{
    
    if(ev.key === "Enter"){
        ev.preventDefault();
        divRes.innerHTML = "";
        match_container.innerHTML = "";
        presented = false;
        match_container.style.display="none"
        btnContainer.style.display = "none"

    let summonerName;
    let region;
    let formData = new FormData(document.getElementById("sumSearch"))
    
    if(formData.get("summonerName") !== "" && formData.get("regionList") !== "reg"){
        document.getElementById("sumName").disabled = true;
        summonerName = encodeURIComponent(formData.get("summonerName"))
        region = formData.get("regionList");
        const data = await getSummoner(summonerName,region);
        if(data.message) {
            console.log(data) // change it and present in case of code:"summoner"
        }
        else{
            divRes.innerHTML = createSummonerCard(data)
            btnContainer.style.display = "flex";
        }
        document.getElementById("sumName").disabled = false;
    } 
        else{
            alert("Summoner Name can't be empty")
        }  
    }   
})

function createSummonerCard(summonerData) {
  let flexPresented = false;
  let soloPresented = false;
  const dict = {
    RANKED_SOLO_5x5:"Ranked Solo",
    RANKED_FLEX_SR :"Ranked Flex"
  }
  let cardTemplate = `
      <div class="summoner-card">
        <h2 class="summoner-name">${summonerData.name}</h2>
        <div class="summoner">
              <img src="http://ddragon.leagueoflegends.com/cdn/${summonerData.patch}/img/profileicon/${summonerData.profileIcon}.png" alt="${summonerData.name}" class="profile-icon">
              <div class="summoner-level"><span>${summonerData.level}</span></div>
        </div>
        <div class="rank-info-row">`;
  //if summoner is unranked in all queues, rank property will be string
  if(typeof(summonerData.rank) !== "string"){
    for(var queue of summonerData.rank){
      if(queue.TYPE === "RANKED_SOLO_5x5") {
        soloPresented = true;
      }else{
        flexPresented =  true
      } 
      cardTemplate +=`
      <div class="rank-info-col">
        <div class="ranked-icon">
            <img src="rankedIcons/${queue.TIER}.png" class="rank-icon">
        </div>
        <div class="ranked-details">
            <span class="queue-type">${dict[queue.TYPE]}</span>
            <span class="rank-text">${queue.TIER} ${queue.RANK}</span>
            <span class="league-points">${queue.POINTS} LP</span>
            <span class="win-loss">${queue.WINS}W ${queue.LOSSES}L</span>
        </div>
      </div>`
    }
    //flex is unranked
    if(!flexPresented){
      flexPresented = true
      cardTemplate += `
      <div class="rank-info-col">
      <div class="ranked-icon">
      <div class="rank-icon"></div>
  </div>
                    <div class="ranked-details">
                        <span class="queue-type">Ranked Flex</span>
                        <span class="rank-text">UNRANKED</span>
                        <span class="league-points">Play more games</span>
                        <span class="win-loss">to unlock</span>
                    </div>
                </div>
      `
    }//solo is unranked
    else if(!soloPresented){
      soloPresented = true;
      cardTemplate += `
      <div class="rank-info-col">
      <div class="ranked-icon">
      <div class="rank-icon"></div>
  </div>
                    <div class="ranked-details">
                        <span class="queue-type">Ranked Solo</span>
                        <span class="rank-text">UNRANKED</span>
                        <span class="league-points">Play more games</span>
                        <span class="win-loss">to unlock</span>
                    </div>
                </div>
      `
    }
    //if both are ranked, the foor loop will have rendered them to the DOM
  } 
  else{
    //both are empty
    cardTemplate += `
    <div class="rank-info-col">
    <div class="ranked-icon">
        <div class="rank-icon"></div>
    </div>
    <div class="ranked-details">
        <span class="queue-type">Ranked Solo</span>
        <span class="rank-text">UNRANKED</span>
        <span class="league-points">Play more games</span>
        <span class="win-loss">to unlock</span>
    </div>
</div>
<div class="rank-info-col">
<div class="ranked-icon">
        <div class="rank-icon"></div>
    </div>
<div class="ranked-details">
    <span class="queue-type">Ranked Flex</span>
    <span class="rank-text">UNRANKED</span>
    <span class="league-points">Play more games</span>
    <span class="win-loss">to unlock</span>
</div>
</div>
      `
  }
    cardTemplate += `</div></div>`
    return cardTemplate;
  }
  
  document.getElementById("match").addEventListener("click", async ()=>{
    match_container.style.display = "flex";
    //in case the games were already fetched, do not fetch attempt to fetch them again
    if(!presented){
      const Region = data.server;
      const puuid = data.puuid;
      try{
          let fetch_matches = await fetch(`/matches/${Region}/${puuid}`);
          let match_response = await fetch_matches.json();
          if(match_response !== "No matches Found"){
            presentMatchHistory(match_response);
          }
          else{
            alert("no matches")
          }
          presented = true;
      }
      catch(error){
        console.log(error)
      }
    }
    
    
  })
  
  document.getElementById("hideMatches").addEventListener("click", ()=>{
    match_container.style.display="none"
  })


  
  const presentMatchHistory = (games) =>{
    for(var game of games){
        //create matchCard
        match_container.innerHTML += createCard(game)
    }
  }
  
  const createCard = (details) =>{
    //get all info regarding time
    let time = {
      minutes:Math.floor(details.time.lasted / 60),
      seconds:details.time.lasted  % 60,
      ago: getTimeAgo(parseInt(details.time.ended)),
      started: formatDateTime(new Date(details.time.started + details.time.lasted * 1000))
    };
    //get activeSummonerName
    const activeSummoner ={name:data.name, patch: data.patch};
    const summoners = details.summoners;
    for(var summoner of summoners){
      //when you find active summoner, keep info.
      if(summoner.name === activeSummoner.name){
       activeSummoner["champion"] = summoner.champion;
       activeSummoner["won"] = summoner.win;
       activeSummoner["score"] = {
        kills:summoner.kills,
        deaths: summoner.deaths,
        assists:summoner.assists,
        kda: summoner.kda
       }
       activeSummoner["items"] = summoner.items;
       activeSummoner["spells"] = summoner.spells;
       //in case summoner is found before the end of for loop, break;
       break;
      }
    }
    const outcome = stringCapitalize(determineColor(details.isRemake, activeSummoner.won))
    const first_team = details.summoners.filter(summoner =>summoner.team === 100)
    const second_team = details.summoners.filter(summoner =>summoner.team === 200)
    let card_result = `
    <div class="match-card ${determineColor(details.isRemake, activeSummoner.won)}">
            <div class="match-header">
                <div class="imgcont">
                    <img src="champion/${activeSummoner.champion}.png" alt="${activeSummoner.champion}" class="champion-used">
                </div>
                <div class="rest">
                    <div class="match-result">${outcome}</div>
                    <div class="match-duration">${time.minutes}m ${time.seconds}s</div>
                    <div class="match-type-container">
                        <span class="match-type">${details.queue}</span>
                        <span class="middle">•</span>
                        <span class="timestamp">${time.ago}</span>
                    </div>
                </div>
            </div>
            <div class="score">
                <div class="kda">
                    <span class="kills">${activeSummoner.score.kills}</span>
                    <span class="deaths">${activeSummoner.score.deaths}</span>
                    <span class="assists">${activeSummoner.score.assists}</span>
                </div>
                <span class="kda">${activeSummoner.score.kda} KDA</span>
                <div class="itemlist">
                  <ul>`
                    for(var item of activeSummoner.items){
                      if(item !== 0){
                        card_result += `<li>
                        <div class="item"><img src="http://ddragon.leagueoflegends.com/cdn/${activeSummoner.patch}/img/item/${item}.png"
                                alt="" class="itemimg"></div>
                        </li>`
                      }
                      else{
                        card_result += `<li>
                        <div class="item"></div>
                        </li>`
                      }
                    }
                  card_result += `</ul>
                </div>
            </div>
            <div class="match-summary">
              <div class="summoner-line-ups"><ul>`;
    for(summoner of first_team){
      card_result += `
      <li class="Summoner">
        <div>
            <img class="participant-icon" src="champion/${summoner.champion}.png" alt="${summoner.champion}">
        </div>
        <div class="name"><a href="#" class="summonerlink ${summoner.name === activeSummoner.name ? "active-summoner":''}">${summoner.name}</a></div>
      </li>`  
    }
    card_result += "</ul><ul>"
    for(summoner of second_team){
      card_result += `
      <li class="Summoner">
        <div>
            <img class="participant-icon" src="champion/${summoner.champion}.png" alt="${summoner.champion}">
        </div>
        <div class="name"><a href="#" class="summonerlink ${summoner.name === activeSummoner.name ? "active-summoner":''}">${summoner.name}</a></div>
      </li>`  
    }
    card_result += "</ul></div></div></div>"
    return card_result;
  }

 