# Team class template
from api_connection import ApiConnection
from match import Match


class Team:
    def __init__(self):
        self.team_id = -1
        self.team_name = ""
        self.players = []
        self.coaches = []
        self.logo_link = ""

    # converts the team search result data from the API into a simpler dictionary format
    def parse_team_search(self, api_data):
        self.team_id = api_data["team"]["id"]
        self.team_name = api_data["team"]["name"]
        self.players = api_data["players"]
        return {"team_id": self.team_id, "team_name": self.team_name, "players": self.players}

    # converts the API team data received into a simpler dictionary format
    def parse_team(self, api_data, api_players_data, api_coaches_data):
        self.team_id = api_data["team"]["id"]
        self.team_name = api_data["team"]["name"]
        for i in range(0, len(api_players_data)):
            self.players.append(api_players_data[i]["name"])
        for i in range(0, len(api_coaches_data)):
            self.coaches.append(api_coaches_data[i]["name"])
        self.logo_link = api_data["team"]["logo"]
        return {"team_id": self.team_id, "team_name": self.team_name, "players": self.players,
                "coach": self.coaches, "logo_link": self.logo_link}

    # gets next 10 upcoming matches to display in the teams and
    # players page when the user selects a team to view more information
    @staticmethod
    def get_upcoming_matches_for_team(team_id):
        api_result = ApiConnection.get_data("fixtures", team_id, "team", {"next": 10})
        upcoming_fixtures_for_team = []
        for i in range(0, len(api_result)):
            match = Match()
            match.parse_date_and_time(api_result[i])
            upcoming_fixture = match.generate_match()
            # we already know from the API filter next 10 matches that they will each be upcoming matches
            upcoming_fixture_data = upcoming_fixture.parse_match(api_result[i], None, None)
            upcoming_fixtures_for_team.append(upcoming_fixture_data)
        return upcoming_fixtures_for_team

    # this method is used in order to display upcoming matches for a selected team in the teams and players page
    @staticmethod
    def get_upcoming_match_info_for_team(match):
        return match.team_a + " V " + match.team_b + ": " + str(match.date_and_time.date()) + " at " + str(
            match.date_and_time.time())

    def get_team_id(self):
        return self.team_id

    def parse_team_id(self, api_data):
        self.team_id = api_data["team"]["id"]
        return self.team_id

    # gets all team IDs and their associated leagues' IDs
    @staticmethod
    def get_all_team_league_id_pairs():
        team_ids = []
        with open('static/all_teams.txt', 'r') as file:
            teams = file.readlines()
            for team_data in teams:
                team = team_data.split(":")[0]
                league = team_data.split(":")[1].strip("\n")
                league_id = ApiConnection.get_data('leagues', league, "name")[0]["league"]["id"]
                team = ApiConnection.get_data('teams', team, 'name', {'league': league_id})[0]
                team_id = team["team"]["id"]
                team_ids.append([team_id, league_id])
        return team_ids
