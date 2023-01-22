function getTeamsAndPlayers(data)
{
    let url = "/search";
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            console.log(this.responseText);
            let result = JSON.parse(this.responseText);
            document.getElementById("loadingImage").style.display = "none";
            document.getElementById("btnSearch").enabled = true;
            data["players"] = result["players"];
            data["player_to_team"] = result["player_to_team"];
            data["teams"] = result["teams"];
            data["team_to_players"] = result["team_to_players"];
        }
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function displaySearchResults()
{
    document.getElementById("teamResults").innerHTML = "";
    document.getElementById("playerResults").innerHTML = "";

    let searchInput = document.getElementById("searchInput").value;
    if (searchInput == "")
    {
        return;
    }
    let player;
    let playerIds = [];
    for (player of data["players"])
    {
        let playerId = player["player_id"];
        playerIds.push(playerId);
        let name = player["player_name"];
        if (name.toLowerCase().includes(searchInput.toLowerCase()))
        {
            let playerItem = document.createElement("li");
            playerItem.innerHTML = "<li><a href='/teams_and_players.html?playerSearchResult=" + playerId + "'>" + name + "</a></li>";
            document.getElementById("playerResults").appendChild(playerItem);
            let teamFromPlayer = data["player_to_team"][playerId];
            let teamName = teamFromPlayer["team_name"];
            let teamItem = document.createElement("li");
            teamItem.innerHTML = "<li><a href='/teams_and_players.html?teamSearchResult=" + player["team_id"] + "'>" + teamName + "</a></li>";
            document.getElementById("teamResults").appendChild(teamItem);
        }
    }
    let team;
    let teamIds = [];
    for (team of data["teams"])
    {
        let teamId = team["team_id"];
        teamIds.push(teamId);
        let name = team["team_name"];
        if (name.toLowerCase().includes(searchInput.toLowerCase()))
        {
            let teamItem = document.createElement("li");
            teamItem.innerHTML = "<li><a href='teams_and_players.html?teamSearchResult=" + teamId + "'>" + name + "</a></li>";
            document.getElementById("teamResults").appendChild(teamItem);
            let playerFromTeam;
            for (playerFromTeam of data["team_to_players"][teamId])
            {
                let playerName = playerFromTeam["player_name"];
                let playerItem = document.createElement("li");
                playerItem.innerHTML = "<li><a href='teams_and_players.html?playerSearchResult=" + player["player_id"] + "'>" + playerName + "</a></li>";
                document.getElementById("playerResults").appendChild(playerItem);
            }
        }
    }
}
let data = {};
window.onload = function()
{
    document.getElementById("btnSearch").enabled = false;
    getTeamsAndPlayers(data);
}