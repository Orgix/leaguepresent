export const getTimeAgo = (timestamp) => {
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

  export const formatDateTime = (dateTime) => {
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

 export  const determineColor = (remake, outcome) =>{
    if(remake) return "remake"
    return outcome ? "victory":"defeat"
  }

  export const stringCapitalize = (matchOutcome)=>{
    return matchOutcome.charAt(0).toUpperCase() + matchOutcome.slice(1)
  }