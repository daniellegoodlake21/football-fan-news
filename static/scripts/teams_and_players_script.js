// Football Fan News website JavaScript for teams and players webpage
function displayTeamsAndPlayers()
{
    let url = "/teams_and_players";
    let search = "?" + window.location.href.split("?")[1]; // empty string if no parameters
    url += search;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                let result = JSON.parse(this.responseText);
                document.getElementById("loadingImage").style.display = "none";
                let players = result["players"];
                let player;
                let teams = result["teams"];
                let team;
                // if linking to a specific team or player from the search page, display that team or player information
                let playerID = result["player_result_id"];
                let teamID = result["team_result_id"];
                if (playerID != null)
                {
                    // get player info for player id
                    for (player of players)
                    {
                        console.log("player_id = "+player["player_id"].toString());
                        if (player["player_id"].toString() === playerID.toString())
                        {
                            displayPlayerInfo(player["player_name"], player["team"], player["position"], player["image_link"]);
                        }
                    }
                }
                else if (teamID != null)
                {
                    for (team of teams)
                    {
                        console.log("team_id = "+team["team_id"].toString());
                        if (team["team_id"].toString() === teamID.toString())
                        {
                            let upcomingFixtures = [];
                            let upcomingFixture;
                            for (upcomingFixture of team["upcoming_fixtures"])
                            {
                                let upcomingFixtureString = upcomingFixture["team_a"] + "!" + upcomingFixture["team_b"] + "!" + upcomingFixture["kickoff_date"] + "!" + upcomingFixture["kickoff_time"];
                                upcomingFixtures.push(upcomingFixtureString);
                            }
                            let upcomingFixturesString = upcomingFixtures.join("::");
                            let playersString = team["players"].join(",");
                            displayTeamInfo(team["team_name"], team["coach"], upcomingFixturesString, playersString, team["logo_link"]);
                        }
                    }
                }
                let playersHTML = "";
                for (player of players)
                {
                    playersHTML = playersHTML + "<li onclick=\"displayPlayerInfo('" + player["player_name"] + "','" + player["team"] + "','" + player["position"] + "','" + player["image_link"] + "')\">" + player["player_name"] + "</li>";
                }
                document.getElementById("playersList").innerHTML = playersHTML;
                let teamsHTML = "";
                for (team of teams)
                {
                    let upcomingFixtures = team["upcoming_fixtures"];
                    let upcomingFixturesArray = [];
                    let upcomingFixture;
                    for (upcomingFixture of upcomingFixtures)
                    {
                        let upcomingFixtureString = upcomingFixture["team_a"] + "!" + upcomingFixture["team_b"] + "!" + upcomingFixture["kickoff_date"] + "!" + upcomingFixture["kickoff_time"];
                        upcomingFixturesArray.push(upcomingFixtureString);
                    }
                    let upcomingFixturesString = upcomingFixturesArray.join("::");
                    let playersString = team["players"].join(",");
                    teamsHTML = teamsHTML + "<li onclick=\"displayTeamInfo('" + team["team_name"] + "','" + team["coach"] + "','" + upcomingFixturesString + "','" + playersString + "','" + team["logo_link"] + "')\">" + team["team_name"] + "</li>";
                }
            document.getElementById("teamsList").innerHTML = teamsHTML;
            }
        }
        xmlhttp.open('GET', url, true);
        xmlhttp.send();

}
function displayPlayerInfo(name, team, position, image_link)
{
    // show only the relevant div on the right of the screen
    document.getElementById("morePlayerInfo").style.display = "block";
    document.getElementById("moreTeamInfo").style.display = "none";
    document.getElementById("blankMoreInfoArea").style.display = "none";
    // set the text in for the player name, position and team
    document.getElementById("playerName").innerText = name;
    document.getElementById("playerPosition").innerText = position;
    document.getElementById("playerTeam").innerText = team;
    // add the player image
    let playerImage = document.getElementById("playerImage");
    playerImage.setAttribute("src", image_link);
}

function displayTeamInfo(name, coach, upcomingFixtures, players, logo)
{
    upcomingFixtures = upcomingFixtures.split("::");
    players = players.split(",");
    // show only the relevant div on the right of the screen
    document.getElementById("moreTeamInfo").style.display = "block";
    document.getElementById("morePlayerInfo").style.display = "none";
    document.getElementById("blankMoreInfoArea").style.display = "none";
    // set the text for the team name, its coaches and upcoming matches
    document.getElementById("teamName").innerText = name;
    document.getElementById("teamCoach").innerText = "Coach: " + coach;
    let upcomingMatchesHTML = "";
    let i;
    for (i = 0; i < upcomingFixtures.length; i++)
    {
        upcomingFixtures[i] = upcomingFixtures[i].split("!");
        let upcomingFixture = upcomingFixtures[i][0] + " V " + upcomingFixtures[i][1] + " on " + upcomingFixtures[i][2] + " at " + upcomingFixtures[i][3];
        upcomingMatchesHTML = upcomingMatchesHTML + "<li>" + upcomingFixture + "</li>";
    }
    document.getElementById("teamUpcomingMatches").innerHTML = upcomingMatchesHTML;
    // add the team logo
    let teamLogo = document.getElementById("teamLogo");
    teamLogo.setAttribute("src", logo);
    // filter the players to only those in the selected team
    let teamPlayers = document.getElementById("playersList").getElementsByTagName("li");
    for (let i = 0; i < teamPlayers.length; i++)
    {
        if (players.includes(teamPlayers.item(i).innerText))
        {
            teamPlayers.item(i).style.display  = "block";
        }
        else
        {
            teamPlayers.item(i).style.display = "none";
        }

    }

}
function searchByTeam()
{
    let search = document.getElementById("searchByTeamSearch").value;
    let teams = document.getElementById("teamsList").children;
    let i;
    for (i = 0; i < teams.length; i++)
    {
        let teamName = teams.item(i).innerText;
        if (search == "" || teamName.toLowerCase().includes(search.toLowerCase()))
        {
            teams.item(i).style.display = "block";
        }
        else
        {
            teams.item(i).style.display = "none";
        }
    }
    document.getElementById("teamsList").children = teams;
}
function searchByPlayer()
{
    let search = document.getElementById("searchByPlayerSearch").value;
    let players = document.getElementById("playersList").children;
    let i;
    for (i = 0; i < players.length; i++)
    {
        let playerName = players.item(i).innerText;
        if (search == "" || playerName.toLowerCase().includes(search.toLowerCase()))
        {
            players.item(i).style.display = "block";
        }
        else
        {
            players.item(i).style.display = "none";
        }
    }
    document.getElementById("playersList").children = players;
}
let matches = {}
window.onload = function()
{
    displayTeamsAndPlayers();
}