function displayUpcomingFixtures()
{
    let url = "/upcoming_fixtures";
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
            let matchData = document.createElement("div");
            matchData.setAttribute("class", "teamPlaying");
            let teams = document.createElement("h3");
            teams.setAttribute("id", "teamsPlayingList");
            teams.innerHTML = match["team_a"] + "<br> &nbsp; &nbsp; vs <br>" + match["team_b"];
            let gameDetails = document.createElement("h4");
            gameDetails.setAttribute("id", "detailsForGame");
            let location = match["match_location"];
            if (!location)
            {
                location = "Location undecided";
            }
            // get basic match data
            let league = match["league"];
            let daysRemaining = match["days_remaining"];
            // set elements used for searching by competition and team
            let competitionElement = document.createElement("input");
            competitionElement.setAttribute("type", "hidden");
            competitionElement.setAttribute("class", "competition");
            competitionElement.setAttribute("value", league);
            matchData.appendChild(competitionElement);
            let teamA = match["team_a"];
            let teamB = match["team_b"];
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
            gameDetails.innerHTML = match["kickoff_date"] + "<br>" + match["kickoff_time"] + "<br>" + location;
            let moreInfoButton = document.createElement("button");
            // set more info button attributes and inner text
            moreInfoButton.innerText = "More Info >";
            moreInfoButton.setAttribute("class", "moreInfoButton");
            console.log(match["match_id"]);
            moreInfoButton.setAttribute("onclick", "displayMoreMatchInfo(\"" + match["match_id"] + "\",\"" + teamA + "\",\"" + teamB + "\",\"" + league + "\",\"" + location + "\",\"" + daysRemaining + "\")");
            // add to the match div
            matchData.appendChild(teams);
            matchData.appendChild(gameDetails);
            matchData.appendChild(moreInfoButton);
            //let teamA = document.createElement("p");
            //teamA.innerText = match["team_a"];
            //let teamB = document.createElement("p");
            //teamB.innerText = match["team_b"];
            document.getElementById("upcomingMatchesLeftBox").appendChild(matchData);
            }
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
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
            console.log(response);
            let comments = response["comments"];
            displayMatchComments(comments);

        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function addCommentToMatch()
{
    let comment = document.getElementById("commentsTextarea").value.replace("\"", "'");
    let matchID = document.getElementById("matchID").value;
    let url = "/upcoming_fixtures?matchID=" + matchID + "&comment=" + comment;
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
function displayMoreMatchInfo(matchID, teamA, teamB, league, location, daysRemaining)
{
    document.getElementById("postSuccessMessage").innerText = "";
    document.getElementById("matchID").setAttribute("value", matchID);
    document.getElementById("teamScore").innerText = teamA + " V " + teamB;
    document.getElementById("competition").innerText = "Competition: " + league;
    document.getElementById("location").innerText = "Location: " + location;
    document.getElementById("daysRemaining").innerText = "Time Remaining: " + daysRemaining;
    getCommentsForSpecificMatch(matchID);

}
window.onload = function()
{

    displayUpcomingFixtures();
}

