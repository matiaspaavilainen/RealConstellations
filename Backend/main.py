import time

from data import (
    get_star_gaia_id,
    get_test_data,
    calculate_cartesian,
    load_test_constellations_json,
)

if __name__ == "__main__":
    filename = "constellations.json"

    constellations = load_test_constellations_json(filename=filename)

    # for constellation in constellations:
    #     for star in constellation["shape_stars"]:
    #         gaia_id = get_star_gaia_id(star)
    #         time.sleep(1)
    #         print(gaia_id)

    # cassiopeia for test
    for star in constellations[3]["shape_stars"]:
        star_data = get_test_data(star)
        time.sleep(1)
        calculate_cartesian(star_data)
        print(star_data)
