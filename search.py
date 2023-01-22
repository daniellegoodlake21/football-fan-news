# search class
from flask import make_response, jsonify
from api_connection import ApiConnection
from player import Player
from team import Team


class SearchComponent:

    def __init__(self):
        self.team_to_player_map = {}
        self.player_to_team_map = {}

    # gets all players within the team
    @staticmethod
    def find_matching_players_for_team(team_id):
        team = ApiConnection.get_data("players/squads", team_id, "team")[0]
        players = team["players"]
        parsed_players = []
        for i in range(0, len(players)):
            parsed_players.append(Player().parse_player(players[i], team, True))
        return parsed_players

    # retrieves all teams and players search data, converts it into a simpler dictionary format, and sends the
    # result to the front-end
    def get_all_search_data(self):
        teams = []
        players = []
        team_league_id_pairs = Team.get_all_team_league_id_pairs()
        for team_league_id_pair in team_league_id_pairs:
            team_id = team_league_id_pair[0]
            team_data = ApiConnection.get_data("players/squads", team_id, "team")
            if len(team_data) > 0:
                team = Team().parse_team_search(team_data[0])
                teams.append(team)
                players.extend(Player.get_players_in_team(team, True))
                players_for_team = SearchComponent.find_matching_players_for_team(team["team_id"])
                self.team_to_player_map[team["team_id"]] = players_for_team
                for player in players_for_team:
                    self.player_to_team_map[player["player_id"]] = team
        response = make_response(jsonify({"teams": teams, "players": players,
                                          "team_to_players": self.team_to_player_map,
                                          "player_to_team": self.player_to_team_map}), 200)
        response.headers["Content-Type"] = "application/json"
        return response
