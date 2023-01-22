from flask import Flask, json
from pip._vendor import requests

app = Flask(__name__)


class ApiConnection:

    # retrieves data without the need for another parameter (except the default of season) from a URL in the API
    @staticmethod
    def get_all_data(data_type):
        headers = {
            'x-rapidapi-host': "api-football-v1.p.rapidapi.com",
            'x-rapidapi-key': "0dff86e16dmshaa2709149384dbdp137bdajsn614c917fa3c7"
        }
        response = requests.request("GET", "https://api-football-v1.p.rapidapi.com/v3/" + data_type + "?season=2021",
                                    headers=headers, data={})
        data = json.loads(response.text)
        return data["response"]

    # retrieves data from the API using data_type as part of the URL path, field as a parameter name,
    # value as the parameter's value and extra_field_value_pairs as any additional required parameter keys
    # and values where necessary
    @staticmethod
    def get_data(data_type, value, field, extra_field_value_pairs={}):
        extras = ""
        season = "&season=2021"
        no_season_data_types = ["coachs", "fixtures/events", "players/squads", "leagues", "fixtures/lineups"]
        if data_type in no_season_data_types:
            season = ""
        for key in extra_field_value_pairs:
            extras += "&" + key + "=" + str(extra_field_value_pairs[key])
        headers = {
            'x-rapidapi-host': "api-football-v1.p.rapidapi.com",
            'x-rapidapi-key': "placeholder_for_github"
        }
        response = requests.request("GET",
                                    "https://api-football-v1.p.rapidapi.com/v3/" + data_type + "?" + str(field) + "=" +
                                    str(value) + season + extras,
                                    headers=headers, data={})
        data = json.loads(response.text)
        print("Requests remaining today:")
        print(data)
        print(response.headers["x-ratelimit-requests-remaining"])
        return data["response"]
