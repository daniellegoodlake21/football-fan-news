import random
from flask import Flask, render_template, make_response, jsonify, request
from api_connection import ApiConnection
from match import Match, UpcomingFixture, PastMatch

from player import Player
from search import SearchComponent
from team import Team

app = Flask(__name__)


@app.route('/')
def homepage():
    return render_template('index.html')


# retrieves home page JSON data to display on the front-end and sends it back to the front end
@app.route("/index", methods=['GET'])
def get_past_match_and_upcoming_fixture():
    api_past_matches = ApiConnection.get_data("fixtures", 10, "last", {"status": "FT"})
    api_featured_past_match = random.choice(api_past_matches)
    api_upcoming_fixtures = ApiConnection.get_data("fixtures", 10, "next")
    api_featured_upcoming_fixture = random.choice(api_upcoming_fixtures)
    empty_base_match = Match()
    featured_past_match = PastMatch(empty_base_match)
    featured_past_match.parse_date_and_time(api_featured_past_match)
    past_match_data = featured_past_match.parse_match(api_featured_past_match, None, None)
    featured_upcoming_fixture = UpcomingFixture(empty_base_match)
    featured_upcoming_fixture.parse_date_and_time(api_featured_upcoming_fixture)
    upcoming_fixture_data = featured_upcoming_fixture.parse_match(api_featured_upcoming_fixture, None, None)
    all_data = {"past_match": past_match_data, "upcoming_fixture": upcoming_fixture_data}
    response = make_response(jsonify(all_data), 200)
    response.headers["Content-Type"] = "application/json"
    return response


# retrieves past matches JSON data to display on the front-end and sends it back to the front end
@app.route("/past_matches", methods=["GET", "POST"])
def get_all_past_matches():
    if request.method == "POST":
        return Match.add_comment()
    else:
        match_id = request.args.get("matchID", None)
        if match_id is not None:
            # get the comments for this match ID only
            comments = Match.load_match_comments(match_id)
            response = make_response(jsonify({"comments": comments}), 200)
            response.headers["Content-Type"] = "application/json"
            return response
        else:
            return Match.get_all_matches_of_type("PastMatch")

#  retrieves match comments JSON data to display on the front-end and sends it back to the front end
@app.route("/match_comments", methods=["GET"])
def get_match_comments():
    match_id = request.args.get("matchID", None)
    if match_id is not None:
        # get the comments for this match ID only
        comments = Match.load_match_comments(match_id)
    else:
        comments = []
    response = make_response(jsonify({"comments": comments}), 200)
    response.headers["Content-Type"] = "application/json"
    return response


# retrieves live matches JSON data to display on the front-end and sends it back to the front end
@app.route("/live_matches", methods=["GET", "POST"])
def get_all_live_matches():
    if request.method == "POST":
        return Match.add_comment()
    else:
        match_id = request.args.get("matchID", None)
        if match_id is not None:
            # get the comments for this match ID only
            comments = Match.load_match_comments(match_id)
            response = make_response(jsonify({"comments": comments}), 200)
            response.headers["Content-Type"] = "application/json"
            return response
        else:
            return Match.get_all_matches_of_type("LiveMatch")

# retrieves upcoming fixtures JSON data to display on the front-end and sends it back to the front end
@app.route("/upcoming_fixtures", methods=["GET", "POST"])
def upcoming_fixtures_page():
    if request.method == "POST":
        return Match.add_comment()
    else:
        match_id = request.args.get("matchID", None)
        if match_id is not None:
            # get the comments for this match ID only
            comments = Match.load_match_comments(match_id)
            response = make_response(jsonify({"comments": comments}), 200)
            response.headers["Content-Type"] = "application/json"
            return response
        else:
            return Match.get_all_matches_of_type("UpcomingFixture")


# retrieves teams and players JSON data to display on the front-end and sends it back to the front end
@app.route('/teams_and_players', methods=['GET'])
def list_teams_and_players():
    # get list of teams
    teams_data = []
    all_teams = Team.get_all_team_league_id_pairs()
    players_data = []
    for i in range(0, len(all_teams)):
        team = Team()
        api_result_team = ApiConnection.get_data("teams", all_teams[i][0], "id", {"league": all_teams[i][1]})
        team_id = team.parse_team_id(api_result_team[0])
        api_result_team_coaches = ApiConnection.get_data("coachs", team_id, "team")
        api_result_team_from_squad = ApiConnection.get_data("players/squads", team_id, "team")
        api_result_team_players = api_result_team_from_squad[0]["players"]
        team_data = team.parse_team(api_result_team[0], api_result_team_players, api_result_team_coaches)
        team_data["upcoming_fixtures"] = Team.get_upcoming_matches_for_team(team_id)
        teams_data.append(team_data)
        players_in_team = Player.get_players_in_team(api_result_team_from_squad)
        players_data.extend(players_in_team)
    all_data = {"players": players_data, "teams": teams_data}
    # if this page has been reached via clicking a search result, add the searched player/team ID to the result
    player_id_to_display = request.args.get("playerSearchResult", None)
    team_to_id_display = request.args.get("teamSearchResult", None)
    if player_id_to_display is not None:
        all_data["player_result_id"] = player_id_to_display
    if team_to_id_display is not None:
        all_data["team_result_id"] = team_to_id_display
    response = make_response(jsonify(all_data), 200)
    response.headers["Content-Type"] = "application/json"
    return response


@app.route("/search", methods=["GET"])
def search_page():
    search_component = SearchComponent()
    return search_component.get_all_search_data()


@app.route('/league_tables.html')
def league_tables():
    return render_template('league_tables.html')


@app.route('/teams_and_players.html')
def teams_and_players():
    return render_template('teams_and_players.html')


@app.route('/past_matches.html')
def past_matches():
    return render_template('past_matches.html')


@app.route('/live_matches.html')
def live_matches():
    return render_template('live_matches.html')


@app.route('/upcoming_fixtures.html')
def upcoming_fixtures():
    return render_template('upcoming_fixtures.html')


@app.route('/search.html')
def search():
    return render_template('search.html')


if __name__ == '__main__':
    app.run()
