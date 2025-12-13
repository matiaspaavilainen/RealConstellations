import time
import numpy as np

from data import (
    get_star_data,
    load_test_constellations_json,
)


def main():
    filename = "constellations.json"

    constellations = load_test_constellations_json(filename=filename)

    for constellation in constellations:
        for star in constellation["shape_stars"]:
            star_dict = get_star_data(star)
            print(
                star_dict["name"],
                star_dict["distance"],
                star_dict["pm_ra"],
                star_dict["pm_dec"],
            )
            print(
                "-----------------------------------------------------------------------------------------------"
            )
            time.sleep(2)


if __name__ == "__main__":
    main()
