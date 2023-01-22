function displayUpcomingFixtures()
{
    let url = "/live_matches";
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            let result = JSON.parse(this.responseText);
            document.getElementById("loadingImage").style.display = "none";
            let match;
            for (match of result["matches"])
            {
            let teamA = match["team_a"];
            let teamB = match["team_b"];
            let teamAScore = match["scorers"][teamA].length;
            let teamBScore = match["scorers"][teamB].length;
            let matchData = document.createElement("div");
            matchData.setAttribute("class", "teamPlaying");
            let teams = document.createElement("h3");
            teams.setAttribute("id", "teamsPlayingList");
            teams.innerHTML = "<h3 id=\"teamsPlayingList\">" + teamA + " &nbsp; &nbsp;" + teamAScore + " <br> &nbsp; &nbsp; vs <br> " + teamB + " &nbsp; &nbsp;" + teamBScore + "</h3>";
            let gameDetails = document.createElement("h4");
            gameDetails.setAttribute("id", "detailsForGame");
            gameDetails.innerHTML = match["kickoff_date"] + "<br>" + match["kickoff_time"] + "<br>" + match["match_location"];
            let moreInfoButton = document.createElement("button");
            // get basic match data
            let league = match["league"];
            let location = match["match_location"];
            if (!location)
            {
                location = "Location undecided";
            }
            // set elements used for searching by competition and team
            let competitionElement = document.createElement("input");
            competitionElement.setAttribute("type", "hidden");
            competitionElement.setAttribute("class", "competition");
            competitionElement.setAttribute("value", league);
            matchData.appendChild(competitionElement);
            let teamAElement = document.createElement("input");
            teamAElement.setAttribute("type", "hidden");
            teamAElement.setAttribute("class", "teamA");
            teamAElement.setAttribute("value", teamA);
            matchData.appendChild(teamAElement);
            let teamBElement = document.createElement("input");
            teamBElement.setAttribute("type", "hidden");
            teamBElement.setAttribute("class", "teamB");
            teamBElement.setAttribute("value", teamB);
            matchData.appendChild(teamBElement);
            // get match goals data
            let teamAScorers = match["scorers"][teamA].join("!");
            let teamBScorers = match["scorers"][teamB].join("!");
            let teamAMinutesScored = match["minutes_scored"][teamA].join("!");
            let teamBMinutesScored = match["minutes_scored"][teamB].join("!");
            // get match lineup data
            // team A
            let teamALineup = match["team_a_lineup"];
            let teamAPlayers = teamALineup["players"].join("!");
            let teamASubstitutes = teamALineup["substitutes"].join("!");
            let teamACoach = teamALineup["coach"];
            let teamALineupString = teamAPlayers + "::" + teamASubstitutes + "::" + teamACoach;
            // team B
            let teamBLineup = match["team_b_lineup"];
            let teamBPlayers = teamBLineup["players"].join("!");
            let teamBSubstitutes = teamBLineup["substitutes"].join("!");
            let teamBCoach = teamBLineup["coach"];
            let teamBLineupString = teamBPlayers + "::" + teamBSubstitutes + "::" + teamBCoach;
            // set more info button attributes and inner text
            moreInfoButton.innerText = "More Info >";
            moreInfoButton.setAttribute("class", "moreInfoButton");
            console.log(match["match_id"]);
            moreInfoButton.setAttribute("onclick", "displayMoreMatchInfo(\"" + match["match_id"] + "\",\"" + teamA + "\",\"" + teamB + "\",\""  + teamAScore + "\",\""  + teamBScore + "\",\"" + league + "\",\"" + location + "\",\"" + teamALineupString + "\",\"" + teamBLineupString +"\",\"" + teamAScorers + "\",\"" + teamBScorers + "\",\"" + teamAMinutesScored + "\",\"" + teamBMinutesScored + "\")");
            // add to the match div
            matchData.appendChild(teams);
            matchData.appendChild(gameDetails);
            matchData.appendChild(moreInfoButton);
            //let teamA = document.createElement("p");
            //teamA.innerText = match["team_a"];
            //let teamB = document.createElement("p");
            //teamB.innerText = match["team_b"];
            let matchLocation = document.createElement("p");
            matchLocation.innerText = "Location: " + match["match_location"];
            document.getElementById("liveMatchesLeftBox").appendChild(matchData);
            }
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}
function displayTeamALineup(teamALineupString)
{
    if (teamALineupString === "::::")
    {
        return;
    }
    document.getElementById("lineup1Players").innerHTML = "";
    let teamALineup = teamALineupString.split("::");
    let teamAPlayers = teamALineup[0].split("!");
    let teamASubstitutes = teamALineup[1].split("!");
    let teamACoach = teamALineup[2];
    let player;
    for (player of teamAPlayers)
    {
        let playerElement = document.createElement("li");
        playerElement.innerText = player;
        document.getElementById("lineup1Players").appendChild(playerElement);
    }
    let substitute;
    for (substitute of teamASubstitutes)
    {
        let substituteElement = document.createElement("li");
        substituteElement.innerText = substitute;
        document.getElementById("lineup1Substitutes").appendChild(substituteElement);
    }
    document.getElementById("lineup1Coach").innerText = teamACoach;
}
function displayTeamBLineup(teamBLineupString)
{
    if (teamBLineupString === "::::")
    {
        return;
    }
    document.getElementById("lineup2Players").innerHTML = "";
    let teamBLineup = teamBLineupString.split("::");
    let teamBPlayers = teamBLineup[0].split("!");
    let teamBSubstitutes = teamBLineup[1].split("!");
    let teamBCoach = teamBLineup[2];
    let player;
    for (player of teamBPlayers)
    {
        let playerElement = document.createElement("li");
        playerElement.innerText = player;
        document.getElementById("lineup2Players").appendChild(playerElement);
    }
    let substitute;
    for (substitute of teamBSubstitutes)
    {
        let substituteElement = document.createElement("li");
        substituteElement.innerText = substitute;
        document.getElementById("lineup2Substitutes").appendChild(substituteElement);
    }
    document.getElementById("lineup2Coach").innerText = teamBCoach;
}
function displayMatchComments(comments)
{
    document.getElementById("commentsList").innerHTML = "";
    let comment;
    for (comment of comments)
    {
        let commentElement = document.createElement("li");
        commentElement.innerText = comment;
        document.getElementById("commentsList").appendChild(commentElement);
    }
}
function getCommentsForSpecificMatch(matchID)
{
    let url = "/match_comments?matchID=" + matchID;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            let response = JSON.parse(this.responseText);
            let comments = response["comments"];
            let commentsList = "";
            let comment;
            for (comment of comments)
            {
                commentsList = commentsList + "<li>"+ comment + "</li>";
            }
            document.getElementById("commentsList").innerHTML = commentsList;
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function addCommentToMatch()
{
    let comment = document.getElementById("commentsTextarea").value.replace("\"", "'");
    let matchID = document.getElementById("matchID").value;
    let url = "/live_matches?matchID=" + matchID + "&comment=" + comment;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            document.getElementById("postSuccessMessage").innerText = "Comment posted!";
            getCommentsForSpecificMatch(matchID);
        }
    }
    xmlhttp.open('POST', url, true);
    xmlhttp.send();
}

function displaySearchResults()
{
    let searchText = document.getElementById("enterTeamTextBox").value;
    let matchesElements = document.getElementsByClassName("teamPlaying");
    let i;
    for (i = 0; i < matchesElements.length; i++)
    {
        matchesElements.item(i).style.display = "block";
        let competition = matchesElements.item(i).getElementsByClassName("competition").item(0).value;
        let teamA = matchesElements.item(i).getElementsByClassName("teamA").item(0).value;
        let teamB = matchesElements.item(i).getElementsByClassName("teamB").item(0).value;
        if (searchText !== "")
        {
            if (!competition.toLowerCase().includes(searchText.toLowerCase()) && !teamA.toLowerCase().includes(searchText.toLowerCase()) && !teamB.toLowerCase().includes((searchText.toLowerCase())))
            {
                matchesElements.item(i).style.display = "none";
            }

        }
        else
        {
            matchesElements.item(i).style.display = "block";
        }

    }
}
function displayGoalsInfo(teamAScorersList, teamBScorersList, teamAMinutesScoredList, teamBMinutesScoredList)
{
    document.getElementById("teamAGoals").innerHTML = "";
    let i;
    if (teamAScorersList != null)
    {
        for (i = 0; i < teamAScorersList.length; i++) {
            let goalInfo = teamAScorersList[i] + " scored a goal at " + teamAMinutesScoredList[i] + " minutes in.";
            let goalInfoElement = document.createElement("li");
            goalInfoElement.innerText = goalInfo;
            document.getElementById("teamAGoals").appendChild(goalInfoElement);
        }
    }
    document.getElementById("teamBGoals").innerHTML = "";
    if (teamBScorersList !=  null)
    {
        for (i = 0; i < teamBScorersList.length; i++) {
            let goalInfo = teamBScorersList[i] + " scored a goal at " + teamBMinutesScoredList[i] + " minutes in.";
            let goalInfoElement = document.createElement("li");
            goalInfoElement.innerText = goalInfo;
            document.getElementById("teamBGoals").appendChild(goalInfoElement);
        }
    }
}
function displayMoreMatchInfo(matchID, teamA, teamB, teamAScore, teamBScore, league, location, teamALineupString, teamBLineupString, teamAScorers, teamBScorers, teamAMinutesScored, teamBMinutesScored)
{
    document.getElementById("postSuccessMessage").innerText = "";
    document.getElementById("matchID").setAttribute("value", matchID);
    document.getElementById("teamScore").innerText = teamA + " " + teamAScore + " V " + teamB + " " + teamBScore;
    document.getElementById("competition").innerText = "Competition: " + league;
    document.getElementById("location").innerText = "Location: " + location;
    if (teamAScore.toString() === "0")
    {
        document.getElementById("teamAGoalsText").innerText = teamA + "'s Goals - No Goals";
        teamAScorers = null;
        teamAMinutesScored = null;
    }
    else
    {
        document.getElementById("teamAGoalsText").innerText = teamA + "'s Goals";
        teamAScorers = teamAScorers.split("!");
        teamAMinutesScored = teamAMinutesScored.split("!");
    }
    if (teamBScore.toString() === "0")
    {
       document.getElementById("teamBGoalsText").innerText = teamB + "'s Goals - No Goals";
       teamBScorers = null;
       teamBMinutesScored = null;
    }
    else
    {
        document.getElementById("teamBGoalsText").innerText = teamB + "'s Goals";
        teamBScorers = teamBScorers.split("!");
        teamBMinutesScored = teamBMinutesScored.split("!");
    }
    displayGoalsInfo(teamAScorers, teamBScorers, teamAMinutesScored, teamBMinutesScored);
    displayTeamALineup(teamALineupString);
    displayTeamBLineup(teamBLineupString);
    getCommentsForSpecificMatch(matchID);

}
window.onload = function()
{
    displayUpcomingFixtures();
}

