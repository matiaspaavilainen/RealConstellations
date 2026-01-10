import time

from data_fetch import (
    get_star_data,
    load_constellations_json,
)


def main():
    filepath = "data/constellations.json"

    constellations = load_constellations_json(filepath=filepath)

    for constellation in constellations:
        print(constellation["name"])
        for star in constellation["shape_stars"]:
            star_dict = get_star_data(star)
            print(
                star_dict["name"],
                star_dict["distance"],
                star_dict["cartesian"],
            )
            print(
                "-----------------------------------------------------------------------------------------------"
            )
            time.sleep(2)


if __name__ == "__main__":
    main()
