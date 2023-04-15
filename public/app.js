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
            
            let summonerId= data.name;
            let SummonerLevel = data.SummonerLevel;
            //divRes.innerHTML = Object.keys(data).length > 0 ? 
            //JSON.stringify(data,null, 2) : 'Currently Unranked';
            //createImageElem(data);
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
    let rankImg = '';
  
    if (typeof(summonerData.rank) !== "string") {
      rankImg = `<img src="rankedIcons/${summonerData.rank[0].TIER}.png" class="rank-img">`;
    }
  
    let cardTemplate = `
      <div class="summoner-card">
        <img src="http://ddragon.leagueoflegends.com/cdn/13.7.1/img/profileicon/${summonerData.profileIcon}.png" alt="${summonerData.name}'s Profile Icon" class="profile-icon">
        <h2 class="summoner-name">${summonerData.name}</h2>
        <div class="summoner-level">Level ${summonerData.level}</div>`;

        cardTemplate += typeof(summonerData.rank) !== "string"? 
        `<div class="rank-info">
          ${rankImg}
          <div class="rank-text">${summonerData.rank[0].TIER} ${summonerData.rank[0].RANK}</div>
          <div class="league-points">${summonerData.rank[0].POINTS} LP</div>
          <div class="win-loss">${summonerData.rank[0].WINS}W ${summonerData.rank[0].LOSSES}L</div>
        </div>
        <div class="queue-type">${summonerData.rank[0].TYPE}</div>`
        :
        `<div class="rank-text">Unranked</div>`
        cardTemplate += `</div>`;
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
      ago: getTimeAgo(parseInt(details.time.started)),
      started: formatDateTime(new Date(details.time.started + details.time.lasted * 1000))
    };
    //get activeSummonerName
    const activeSummoner ={name:data.name};
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
       }//in case summoner is found before the end of for loop, break;
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
                    <div class="kills">${activeSummoner.score.kills} /</div>
                    <div class="deaths">${activeSummoner.score.deaths} /</div>
                    <div class="assists">${activeSummoner.score.assists}</div>
                </div>
                <div class="kda">${activeSummoner.score.kda} KDA</div>
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

  function getTimeAgo(timestamp) {
    // Get the current time in milliseconds
    const currentTime = new Date().getTime();
    
    // Calculate the time elapsed since the game started
    const timeElapsed = currentTime - timestamp;
    
    // Convert the time elapsed to seconds
    const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
    
    // Convert the time elapsed to minutes
    const timeElapsedMinutes = Math.floor(timeElapsedSeconds / 60);
    
    // Convert the time elapsed to hours
    const timeElapsedHours = Math.floor(timeElapsedMinutes / 60);
    
    // Convert the time elapsed to days
    const timeElapsedDays = Math.floor(timeElapsedHours / 24);
    
    // Return the time elapsed as a human-readable string
    if (timeElapsedDays > 0 && timeElapsedDays < 2) {
      return `${timeElapsedDays} day ago`;
    } 
    else if(timeElapsedDays >= 2){
      return `${timeElapsedDays} days ago`;
    }
    else if (timeElapsedHours > 0 && timeElapsedHours < 2) {
      return `${timeElapsedHours} hour ago`;
    } 
    else if (timeElapsedHours >= 2) {
      return `${timeElapsedHours} hours ago`;
    }else if (timeElapsedMinutes > 0 && timeElapsedMinutes < 2 ) {
      return `${timeElapsedMinutes} minute ago`;
    } else if (timeElapsedMinutes >= 2) {
      return `${timeElapsedMinutes} minutes ago`;
    }else {
      return `${timeElapsedSeconds} seconds ago`;
    }
  }

  const formatDateTime = (dateTime) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    return formatter.format(dateTime);
  } 

  const determineColor = (remake, outcome) =>{
    if(remake) return "remake"
    return outcome ? "victory":"defeat"
  }

  const stringCapitalize = (matchOutcome)=>{
    return matchOutcome.charAt(0).toUpperCase() + matchOutcome.slice(1)
  }