import json
import re
from typing import TypedDict
from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord, Distance
from astropy import units as u


class Star(TypedDict):
    name: str
    ra: float | None
    dec: float | None
    pm_ra: float | None
    pm_dec: float | None
    distance: float | None
    distance_estimated: bool
    cartesian: list[float] | None
    cartesian_velocity: list[float] | None


class ConstellationJSON(TypedDict):
    name: str
    shape_stars: list[str]
    connections: list[str]
    info: str


GREEK_ALPHABET = {
    "alf": "Alpha",
    "bet": "Beta",
    "gam": "Gamma",
    "del": "Delta",
    "eps": "Epsilon",
    "zet": "Zeta",
    "eta": "Eta",
    "tet": "Theta",
    "iot": "Iota",
    "kap": "Kappa",
    "lam": "Lambda",
    "mu": "Mu",
    "nu": "Nu",
    "ksi": "Xi",
    "omi": "Omicron",
    "pi": "Pi",
    "rho": "Rho",
    "sig": "Sigma",
    "tau": "Tau",
    "ups": "Upsilon",
    "phi": "Phi",
    "chi": "Chi",
    "psi": "Psi",
    "ome": "Omega",
}


def load_constellations_json(
    filepath: str,
) -> list[ConstellationJSON]:
    """
    Loads constellations from JSON to dict

    :param filepath: Filepath for JSON
    :type filepath: str
    :return: list of dicts
    :rtype: list[ConstellationJSON]
    """
    with open(filepath, "r") as file:
        data = json.load(file)
    number_of_constellations = 0
    for index, constellation in enumerate(data["constellations"]):
        # quick "check" to see that all the data is there
        try:
            print(constellation["name"])
            constellation["shape_stars"]
            constellation["connections"]
            constellation["info"]
            number_of_constellations += 1
        except KeyError:
            raise Exception(f"Problem in JSON, constellation {index}")

    print(f"Found {number_of_constellations} constellations")
    constellations: list[ConstellationJSON] = data["constellations"]
    return constellations


def name_processing(simbad_id: str, star_name: str):
    """
    Formats the SIMBAD id properly. Querying SIMBAD doesn't work with the nice formattings all the time,
    so they can't be used directly in the JSON.

    :param simbad_id: Star identifier from SIMBAD
    :type simbad_id: str
    :param star_name: The original name used in the JSON
    :type star_name: str
    """

    # NAME name
    # NAME name name
    # NAME -IAU Larawag

    if simbad_id.startswith("NAME"):
        split = simbad_id.split()
        try:
            split.remove("-IAU")
        except ValueError:
            pass
        # return the last part of the name
        return " ".join(split[1:])

    if simbad_id.startswith("*"):
        constellation = " ".join(star_name.split(" ")[1:])
        # * alf Const
        # * nu. Const
        # * tau Boötis A
        # * tet Coronae Borealis

        if not bool(re.search(r"\d", simbad_id)):
            # no numbers in the string
            split = simbad_id.split()
            greek_abrv = split[1]
            greek_abrv = greek_abrv.strip(".").lower()
            try:
                return f"{GREEK_ALPHABET[greek_abrv]} {constellation}"
            except KeyError:
                print(f"No processing done, using the name from JSON: {star_name}")
                return star_name

        # there are numbers in the string

        # *  XX Const
        _, designation, _ = simbad_id.split()

        if designation.isnumeric():
            return f"{designation} {constellation}"

        # * psiXX Const
        greek_abrv = designation[:3].strip(". ").lower()
        num = designation[3:].strip("0")

        return f"{GREEK_ALPHABET[greek_abrv]} {num} {constellation}"

    print(f"No processing done, using the name from JSON: {star_name}")

    return star_name


def get_simbad_data(
    star_dict: Star,
):
    """
    Queries SIMBAD for the star. Attempts to find the RA, DEC, PM_RA, PM_DEC, and distance.
    If distance isn't in SIMBAD, queries again without distance. The dictionary is modified directly.
    SIMBAD search is case sensitive, and as such there are likely mistakes where for example Mu and mu result
    in different stars.

    :param star_name: Description
    :type star_name: str
    """

    star_name = star_dict["name"]

    # attempt to query with distance first, more often than not distance exists
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde, mesDistance.dist
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        JOIN mesDistance ON mesDistance.oidref = ident.oidref
        WHERE ident.id = '{star_name}'
        AND mesPM.mespos = 1
        AND mesDistance.mespos = 1
        """
    )

    if len(result) > 0:
        star_dict["name"] = name_processing(result["id"][0], star_dict["name"])
        star_dict["ra"] = float(result["ra"][0])
        star_dict["dec"] = float(result["dec"][0])
        star_dict["pm_ra"] = float(result["pmra"][0])
        star_dict["pm_dec"] = float(result["pmde"][0])
        star_dict["distance"] = float(result["dist"][0])
        print(f"Found distance from SIMBAD for {star_dict["name"]}")
        return

    # Most common reason to fail a query is missing distance
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        WHERE ident.id = '{star_name}' AND mesPM.mespos = 1
        """
    )

    if len(result) > 0:
        star_dict["name"] = name_processing(result["id"][0], star_dict["name"])
        star_dict["ra"] = float(result["ra"][0])
        star_dict["dec"] = float(result["dec"][0])
        star_dict["pm_ra"] = float(result["pmra"][0])
        star_dict["pm_dec"] = float(result["pmde"][0])
        return

    print(f"No data found for {star_dict["name"]} from SIMBAD.")


def estimate_dist_with_parallax(star: str) -> float | None:
    """
    Estimates the distance to a star using it's parallax.
    If star doesn't have parallax associated with it, returs None.

    :param star: Star name
    :type star: str
    :return: distance or None
    :rtype: float | None
    """
    result = Simbad.query_tap(
        f"""
        SELECT basic.plx_value
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        WHERE ident.id = '{star}'
        """
    )

    if len(result) > 0:
        return Distance(parallax=result["plx_value"][0] * u.mas).value


def manual_data_entry(star_dict: Star):
    """
    The last option in data entry, only used when SIMBAD has no data at all.

    :param star_dict: Star dictionary
    :type star_dict: Star
    """
    print(f"Star {star_dict["name"]} has no data.")
    ra = str(input("RA in hours (00h00m00s): "))
    dec = str(input("DEC in degrees (00d00m00s): "))

    c = SkyCoord(ra, dec, frame="icrs")

    star_dict["ra"] = float(c.ra.degree)  # type: ignore
    star_dict["dec"] = float(c.dec.degree)  # type: ignore

    star_dict["pm_ra"] = float(input("PM_RA (float): "))
    star_dict["pm_dec"] = float(input("PM_DEC (float): "))
    star_dict["distance"] = float(input("Distance in pc: "))
    star_dict["distance_estimated"] = True


def calculate_cartesian(star_dict: Star):
    """
    Calculates the cartesian (x,y,z) coordinates and velocities for a given star.
    Requires proper motions, and a distance.

    Coordinates are transformed from ICRS to a system suitable for Three.js:
    - ICRS X -> Three.js X
    - ICRS Y -> Three.js Z (negated for correct handedness)
    - ICRS Z -> Three.js Y (celestial north becomes "up")

    :param star_dict: Star dictionary
    :type star_dict: Star
    """
    sc = SkyCoord(
        star_dict["ra"] * u.degree,
        star_dict["dec"] * u.degree,
        star_dict["distance"] * u.pc,
        frame="icrs",
        pm_ra_cosdec=star_dict["pm_ra"] * u.mas / u.yr,
        pm_dec=star_dict["pm_dec"] * u.mas / u.yr,
    )

    star_dict["cartesian"] = [
        float(sc.cartesian.x.to_value()),  # type: ignore
        float(sc.cartesian.z.to_value()),  # type: ignore
        float(-sc.cartesian.y.to_value()),  # type: ignore
    ]
    star_dict["cartesian_velocity"] = [
        float(sc.velocity.d_x.to_value()),  # type: ignore
        float(sc.velocity.d_z.to_value()),  # type: ignore
        float(-sc.velocity.d_y.to_value()),  # type: ignore
    ]


def get_star_data(star_name: str):
    """
    Finds the data for a star and fills out the dictionary specified by the Star class. A "star" in a constellation can be a multi-star system,
    in which case the name for that is used, and the average of the values is used.

    :param star_name: Star name
    :type star_name: str
    """
    star_dict: Star = {
        "name": star_name,
        "ra": None,
        "dec": None,
        "pm_ra": None,
        "pm_dec": None,
        "distance": None,
        "distance_estimated": False,
        "cartesian": None,
        "cartesian_velocity": None,
    }

    get_simbad_data(star_dict)

    # If simbad doesn't have data, example Acrab, do manual data entry
    # Same applies for multi-star systems like Kuma
    # Very rare
    if not star_dict["ra"]:
        manual_data_entry(star_dict)

    # If simbad doesn't have distance, try GAIA
    # Basically never has data that isn't in SIMBAD
    if not star_dict["distance"]:
        print(f"Estimating distance with parallax for {star_dict["name"]}")
        # use the unformatted version which works with simbad
        dist = estimate_dist_with_parallax(star_name)
        star_dict["distance_estimated"] = True

        # Finally if there is no parallax get user input
        if not dist:
            print(f"No distance anywhere for {star_dict["name"]}")
            dist = input("Distance in pc: ")

        star_dict["distance"] = float(dist)

    # calculate the cartesian coordinates
    calculate_cartesian(star_dict)

    return star_dict
