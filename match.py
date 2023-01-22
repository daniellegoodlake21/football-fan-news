# Match class
from datetime import datetime
from datetime import timedelta
from flask import request, json, make_response, jsonify

from api_connection import ApiConnection
from league import League


class Match:
    def __init__(self):
        self.match_id = -1
        self.team_a = ""
        self.team_b = ""
        self.team_a_lineup = {"players": [], "substitutes": [], "coach": ""}
        self.team_b_lineup = {"players": [], "substitutes": [], "coach": ""}
        self.match_location = ""
        self.scorers = {}  # two team names as keys - values are lists of the players who scored a goal in that team
        self.minutes_scored = {}  # two team names as keys - values are lists of corresponding minutes scored for
        # each goal scored
        self.competition = ""
        self.timestamp = -1
        self.date_and_time = None

    # generates a more specific match type based on the time the match took place/is taking place/will be taking place
    def generate_match(self):
        match_start = self.date_and_time
        match_duration = timedelta(minutes=90) # matches are 90 minutes long
        match_end = self.date_and_time + match_duration
        now = datetime.now()
        if match_start < now < match_end:
            return PastMatch(self)
        elif now > match_end:
            return LiveMatch(self)
        else:
            return UpcomingFixture(self)

    # gets all comments for the selected match
    @staticmethod
    def load_match_comments(match_id):
        with open("static/comments.json", "r") as file:
            data = file.read()
        all_comments = json.loads(data)
        match_comments = all_comments.get(str(match_id), [])
        # return empty comments list if no comments exist for match ID
        return match_comments

    # retrieves all matches of a given match type from the API and sends it back to be displayed on the front-end
    # note: if there are no live matches, then a small selection of the most recent past matches are used instead
    @staticmethod
    def get_all_matches_of_type(match_type, overrides_live_matches=False):
        if match_type == "UpcomingFixture":
            extras = {"next": 20}
        elif match_type == "PastMatch":
            if overrides_live_matches:
                extras = {"last": 3}
            else:
                extras = {"last": 20}
        else:
            extras = {"live": "all"}
        api_result = []
        leagues = League.get_league_ids()
        for league in leagues:
            api_result.extend(ApiConnection.get_data("fixtures", league, "league", extras))
        if len(api_result) == 0:
            if match_type == "LiveMatch":
                return Match.get_all_matches_of_type("PastMatch", True)
            all_data = {"matches": []}
            response = make_response(jsonify(all_data), 200)
            response.headers["Content-Type"] = "application/json"
            return response
        matches = []
        for i in range(0, len(api_result)):
            base_match = Match()
            base_match.parse_date_and_time(api_result[i])
            match = base_match.generate_match()
            # above generates an instance of either PastMatch, LiveMatch, or UpcomingFixture
            # depending on the date and time of the match
            match.parse_match_id(api_result[i])
            api_lineup_data = ApiConnection.get_data("fixtures/lineups", match.parse_match_id(api_result[i]), "fixture")
            match_data = {}
            if len(api_lineup_data) == 0:
                api_lineup_data = None
            if isinstance(match, UpcomingFixture):
                match_data = match.parse_match(api_result[i], None, None)
            else:
                api_goals_data = ApiConnection.get_data("fixtures/events", match.get_match_id(), "fixture",
                                                        {"type": "Goal"})
                if len(api_goals_data) == 0:
                    api_goals_data = None
                match_data = match.parse_match(api_result[i], api_goals_data, api_lineup_data)
            match_data["comments"] = Match.load_match_comments(match.get_match_id())
            matches.append(match_data)
        all_data = {"matches": matches}
        response = make_response(jsonify(all_data), 200)
        response.headers["Content-Type"] = "application/json"
        return response

    # adds a comment (all of which are stored in comments.json) for a given match
    @staticmethod
    def add_comment():
        comment = request.args.get("comment").replace("!.!", "")
        match_id = request.args.get("matchID")
        with open("static/comments.json", "r") as file:
            data = file.read()
        all_comments = json.loads(data)
        all_comments[match_id] = all_comments.get(match_id, [])
        all_comments[match_id].append(comment)
        new_data = json.dumps(all_comments)
        with open("static/comments.json", "w") as file:
            file.write(new_data)
        response = make_response(jsonify({"result": "Success"}), 200)
        response.headers["Content-Type"] = "application/json"
        return response

    def parse_date_and_time(self, api_data):
        self.timestamp = api_data["fixture"]["timestamp"]
        self.date_and_time = datetime.fromtimestamp(self.timestamp)

    def get_match_id(self):
        return self.match_id

    def parse_match_id(self, api_data):
        self.match_id = api_data["fixture"]["id"]
        return self.match_id

    # converts the API match data received into a simpler dictionary format
    def parse_match(self, api_data, api_goals_data, api_lineup_data):
        self.match_id = api_data["fixture"]["id"]
        self.team_a = api_data["teams"]["home"]["name"]
        self.team_b = api_data["teams"]["away"]["name"]
        self.match_location = api_data["fixture"]["venue"]["name"]
        if self.match_location is None:
            self.match_location = "Location unavailable"
        self.competition = api_data["league"]["name"]
        if api_lineup_data is not None:
            if "startXI" in api_lineup_data[0]:
                for player_data in api_lineup_data[0]["startXI"]:
                    self.team_a_lineup["players"].append(player_data["player"]["name"])
            if "startXI" in api_lineup_data[1]:
                for player_data in api_lineup_data[1]["startXI"]:
                    self.team_b_lineup["players"].append(player_data["player"]["name"])
            if "substitutes" in api_lineup_data[0]:
                for substitute_data in api_lineup_data[0]["substitutes"]:
                    self.team_a_lineup["substitutes"].append(substitute_data["player"]["name"])
            if "substitutes" in api_lineup_data[1]:
                for substitute_data in api_lineup_data[1]["substitutes"]:
                    self.team_b_lineup["substitutes"].append(substitute_data["player"]["name"])
            self.team_a_lineup["coach"] = api_lineup_data[0]["coach"]["name"]
            self.team_b_lineup["coach"] = api_lineup_data[1]["coach"]["name"]
        kickoff = datetime.fromtimestamp(api_data["fixture"]["timestamp"])
        if api_goals_data is None:
            self.scorers = {self.team_a: [], self.team_b: []}
            self.minutes_scored = {self.team_a: [], self.team_b: []}
            return {"match_id": self.match_id, "team_a": self.team_a, "team_b": self.team_b,
                    "date_and_time": str(self.date_and_time), "team_a_lineup": self.team_a_lineup,
                    "team_b_lineup": self.team_b_lineup, "league": self.competition,
                    "kickoff_date": str(kickoff.date()), "scorers": self.scorers, "minutes_scored": self.minutes_scored,
                    "kickoff_time": str(kickoff.time()), "location": self.match_location}
        self.scorers[self.team_a] = []
        self.scorers[self.team_b] = []
        self.minutes_scored[self.team_a] = []
        self.minutes_scored[self.team_b] = []
        for i in range(0, len(api_goals_data)):
            self.scorers[api_goals_data[i]["team"]["name"]].append(api_goals_data[i]["player"]["name"])
            self.minutes_scored[api_goals_data[i]["team"]["name"]].append(api_goals_data[i]["time"]["elapsed"])
        return {"match_id": self.match_id, "team_a": self.team_a, "team_b": self.team_b, "scorers": self.scorers,
                "minutes_scored": self.minutes_scored, "team_a_lineup": self.team_a_lineup,
                "team_b_lineup": self.team_b_lineup, "match_location": self.match_location,
                "league": self.competition, "kickoff_date": str(kickoff.date()), "kickoff_time": str(kickoff.time())}


class PastMatch(Match):
    def __init__(self, base_match):
        self.match_id = base_match.match_id
        self.team_a = base_match.team_a
        self.team_b = base_match.team_b
        self.match_location = base_match.match_location
        self.scorers = base_match.scorers  # list of players who scored
        self.minutes_scored = base_match.minutes_scored  # when the goals happened
        self.competition = base_match.competition
        self.timestamp = base_match.timestamp
        self.date_and_time = base_match.date_and_time
        self.team_a_lineup = base_match.team_a_lineup
        self.team_b_lineup = base_match.team_b_lineup


class LiveMatch(Match):
    def __init__(self, base_match):
        self.match_id = base_match.match_id
        self.team_a = base_match.team_a
        self.team_b = base_match.team_b
        self.match_location = base_match.match_location
        self.scorers = base_match.scorers  # list of players who scored
        self.minutes_scored = base_match.minutes_scored  # when the goals happened
        self.competition = base_match.competition
        self.timestamp = base_match.timestamp
        self.date_and_time = base_match.date_and_time
        self.team_a_lineup = base_match.team_a_lineup
        self.team_b_lineup = base_match.team_b_lineup


class UpcomingFixture(Match):
    def __init__(self, base_match):
        self.match_id = base_match.match_id
        self.team_a = base_match.team_a
        self.team_b = base_match.team_b
        self.match_location = base_match.match_location
        self.scorers = []
        self.minutes_scored = []
        self.competition = base_match.competition
        self.timestamp = base_match.timestamp
        self.date_and_time = base_match.date_and_time
        self.team_a_lineup = base_match.team_a_lineup
        self.team_b_lineup = base_match.team_b_lineup
        self.days_remaining = -1

    @staticmethod
    def calculate_days_remaining(kickoff):
        today = datetime.now()
        return str(kickoff - today).split(".")[0]

    def parse_match(self, api_data, api_goals_data, api_lineup_data):
        base_match_data = super().parse_match(api_data, api_goals_data, api_lineup_data)
        kickoff = datetime.fromtimestamp(api_data["fixture"]["timestamp"])
        self.days_remaining = UpcomingFixture.calculate_days_remaining(kickoff)
        base_match_data["days_remaining"] = self.days_remaining
        return base_match_data
