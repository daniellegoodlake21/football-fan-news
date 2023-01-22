# Player class template
from api_connection import ApiConnection


class Player:
    def __init__(self):
        self.player_id = -1
        self.player_name = ""
        self.team = ""
        self.position = ""
        self.image_link = ""

    def parse_player(self, api_data, api_team_data, is_search=False):
        self.player_id = api_data["id"]
        self.player_name = api_data["name"]
        if is_search:
            self.team = api_team_data["players"]
            return {"player_id": self.player_id, "player_name": self.player_name, "team": self.team}
        else:
            self.team = api_team_data[0]["team"]["name"]
            self.position = api_data["position"]
            self.image_link = api_data["photo"]
            return {"player_id": self.player_id, "player_name": self.player_name, "team": self.team,
                    "position": self.position, "image_link": self.image_link}

    @staticmethod
    def get_players_in_team(api_result_team, is_search=False):
        # get list of players
        players_data = []
        api_result_players = []
        if is_search:
            api_result_players = api_result_team["players"]
        else:
            api_result_players = api_result_team[0]["players"]
        for j in range(0, len(api_result_players)):
            player = Player()
            player_data = player.parse_player(api_result_players[j], api_result_team, is_search)
            players_data.append(player_data)
        return players_data
