import time

from data_fetch import (
    get_star_data,
    load_constellations_json,
)


def main():
    star = "Epsilon Scorpii"
    star_dict = get_star_data(star)
    print(
        star_dict["name"],
        star_dict["distance"],
        star_dict["cartesian"],
    )
    print(
        "-----------------------------------------------------------------------------------------------"
    )


if __name__ == "__main__":
    main()
