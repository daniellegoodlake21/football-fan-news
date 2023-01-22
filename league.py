from api_connection import ApiConnection


# League class template
class League:
    def __init__(self):
        self.league_id = -1
        self.league_name = ""
        self.teams = []

    def parse_league_id(self, api_data):
        self.league_id = api_data[0]["league"]["id"]
        return self.league_id

    # converts the API league data into a simpler dictionary format and sends it back to the front end
    def parse_league(self, api_data, api_teams_data):
        self.league_id = api_data[0]["league"]["id"]
        self.league_name = api_data[0]["league"]["name"]
        for i in range(0, len(api_teams_data)):
            self.teams.append(api_teams_data[i]["team"]["name"])
        return {"league_id": self.league_id, "league_name": self.league_name, "teams": self.teams}

    def get_league_id(self):
        return self.league_id

    # get all league IDs - for each league that our website will be concerned with
    @staticmethod
    def get_league_ids():
        league_ids = []
        with open('static/all_leagues.txt', 'r') as file:
            leagues = file.readlines()
            for league_data in leagues:
                league = league_data.strip("\n")
                league_id = ApiConnection.get_data('leagues', league, "name")[0]["league"]["id"]
                league_ids.append(league_id)
        return league_ids
