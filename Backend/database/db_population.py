import os
import time
from pymongo import MongoClient
from pymongo.collection import Collection
from typing import TypedDict, NotRequired
from bson import ObjectId
from dotenv import load_dotenv

from data.data_fetch import (
    Star,
    ConstellationJSON,
    get_star_data,
    load_constellations_json,
)


class Constellation(TypedDict):
    _id: NotRequired[ObjectId]
    name: str
    astronomical_data: list[Star]
    general_info: str
    connections: list[str]


def init_db(client: MongoClient):
    try:
        database = client.get_database("constellations")
        database.drop_collection("constellations")
        constellation: Collection[Constellation] = database.create_collection(
            "constellations"
        )
        return constellation
    except Exception as e:
        raise Exception("The following error occurred: ", e)


def create_constellation_object(constellation: ConstellationJSON):
    astronomical_data = []

    print(f"------------------{constellation["name"]}------------------")
    for star in constellation["shape_stars"]:
        star_dict = get_star_data(star)
        astronomical_data.append(star_dict)
        # avoid getting timed out from simbad
        time.sleep(1)

    constellation_object: Constellation = {
        "name": constellation["name"],
        "astronomical_data": astronomical_data,
        "general_info": constellation["info"],
        "connections": constellation["connections"],
    }

    return constellation_object


if __name__ == "__main__":

    # RUN WITH python -m database.db_population from Backend dir because python
    load_dotenv(".env")
    db_user = os.getenv("MONGO_DEV_USER")
    db_pass = os.getenv("MONGO_DEV_PASS")
    db_url = os.getenv("MONGO_DB_URL_LOCAL")

    print(f"Logging in as {db_user}:{db_pass}")

    CLIENT = MongoClient(db_url, username=db_user, password=db_pass)
    CLIENT.admin.command("ping")
    print("Success")
    collection = init_db(CLIENT)

    jsonpath = "data/constellations.json"
    constellations = load_constellations_json(filepath=jsonpath)

    for constellation in constellations:
        constellation_object = create_constellation_object(constellation)
        collection.insert_one(constellation_object)
