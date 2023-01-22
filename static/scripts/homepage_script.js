
//slideshow//
let counter = 1;
setInterval(function(){
   document.getElementById('radio' + counter).checked = true;
   counter++;
   if(counter>4){
       counter=1;
   }
},5000);

//player of the month//
window.onload = randomPic;
let playersArray = ["../templates/salah.png","../templates/ronaldo.png", "../templates/giroud.png"]

function randomPic(){
    let randomNumber = Math.floor(Math.random()*randomPic.length);
    document.getElementById("playerOfTheMonth").src = playersArray[randomNumber];
}

//past match//
function displayMatches ()
{
    let testResponse = "{\n" +
        "\"past_match\": {\n" +
        "\"match_id\": 1,\n" +
        "\"team_a\": \"Manchester United\",\n" +
        "\"team_b\": \"Chelsea\",\n" +
        "\"scorers\": [\n" +
        "\"Cristiano Ronaldo\",\n" +
        "\"Olivier Giroud\"\n" +
        "],\n" +
        "\"minutes_scored\": [\n" +
        "19,\n" +
        "34\n" +
        "],\n" +
        "\"match_type\": \"PAST\",\n" +
        "\"team_a_score\": 2,\n" +
        "\"team_b_score\": 1\n" +
        "},\n" +
        "\"upcoming_fixture\": {\n" +
        "\"match_id\": 2,\n" +
        "\"team_a\": \"Liverpool\",\n" +
        "\"team_b\": \"Manchester City\"\n" +
        "}\n" +
        "}"

    let result = JSON.parse(testResponse);
    let past_match_team_a = result["past_match"]["team_a"];
    let past_match_team_b = result["past_match"]["team_b"];
    let past_match_a_score = result["team_a_score"];
    let past_match_b_score = result["team_b_score"];

    document.getElementById("teamA").innerText = past_match_team_a;
    document.getElementById("teamB").innerText = past_match_team_b;
    document.getElementById("teamAScore").innerText = past_match_a_score;
    document.getElementById("teamBScore").innerText = past_match_b_score;
}

window.onload = function ()
{
    displayMatches()
}

