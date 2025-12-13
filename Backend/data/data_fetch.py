import json
import re
from typing import TypedDict, NotRequired
from astroquery.simbad import Simbad
from astroquery.gaia import Gaia
from astropy.coordinates import SkyCoord, Distance
from astropy import units as u
from astropy.table import Table


class Star(TypedDict):
    name: str
    ra: float | None
    dec: float | None
    pm_ra: float | None
    pm_dec: float | None
    distance: float | None
    distance_estimated: bool
    cartesian: NotRequired[list[float]]
    cartesian_velocity: NotRequired[list[float]]


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
    "xi": "Xi",
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
    name = ""
    # NAME name
    # NAME -IAU Larawag
    if simbad_id.startswith("NAME"):
        split = simbad_id.split()
        # return the last part of the name
        return split[len(split) - 1]

    if simbad_id.startswith("*"):
        constellation = star_name.split(" ")[1].strip()
        # * alf Const
        # * nu. Const
        # * tau Boötis A

        # are there numbers in the string
        if not bool(re.search(r"\d", simbad_id)):
            split = simbad_id.split()
            greek_abrv = split[1]
            greek_abrv = greek_abrv.strip(".").lower()
            if len(split) > 3:
                return f"{GREEK_ALPHABET[greek_abrv]} {constellation} {split[3]}"
            return f"{GREEK_ALPHABET[greek_abrv]} {constellation}"

        # there are numbers in the string

        # *  XX Const
        _, designation, _ = simbad_id.split()

        if designation.isnumeric():
            return f"{designation} {constellation}"

        # * psiXX Const
        greek_abrv = designation[:3].strip(". ").lower()
        num = designation[3:].strip("0")

        return f"{GREEK_ALPHABET[greek_abrv]} {num} {constellation}"

    return name


def get_gaia_id(star_name: str) -> int:
    """
    Find the GAIA DR3 id for a given star. Queries simbad with the name of the star,
    to find either the GAIA id directly.

    :param star: Name of a star
    :type star: str
    :return: GAIA DR3 id
    :rtype: str
    """
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, ids.ids
        FROM basic
        JOIN ids ON ids.oidref = basic.oid
        JOIN ident ON ident.oidref = basic.oid
        WHERE ident.id = '{star_name}'
        """
    )

    try:
        gaia_id = [
            int(str(id).split(" ")[2])
            for id in result["ids"][0].split("|")
            if str(id).startswith("Gaia DR3")
        ][0]

    except (KeyError, IndexError):
        gaia_id = 0

    return gaia_id


def get_gaia_dist(gaia_id: int) -> float | None:
    """
    Get distance from GAIA if there is no distance in SIMBAD. 99.99% of time,
    if Gaia id is in SIMBAD, it also has the distance. So basically never needed.

    :param gaia_id: Gaia DR 3 ID
    :type gaia_id: int
    :return: Distance or None if not found
    :rtype: float | None
    """
    Gaia.ROW_LIMIT = 1
    job = Gaia.launch_job(
        f"""
        SELECT
        distance_gspphot
        FROM gaiadr3.gaia_source
        WHERE source_id = '{gaia_id}'
        """
    )

    result: Table = job.get_results()  # type: ignore

    try:
        if str(result["distance_gspphot"][0]).isdigit():
            print(f"Found distance from GAIA for {gaia_id}")
            return float(result["distance_gspphot"][0])  # type: ignore
    except IndexError:
        return


def get_simbad_data(star_dict: Star):
    """
    First finds the correct star from SIMBAD, and gets the most basic data for it.
    Then attempts to get the distance as well. Modifies the star_dict directly.

    :param star_dict: Star dictionary
    :type star_dict: Star
    """
    result_basic = Simbad.query_tap(
        f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        WHERE ident.id = '{star_dict["name"]}' AND mesPM.mespos = 1
        """
    )

    if len(result_basic) < 1:
        print(f"Failed to fetch simbad data for {star_dict["name"]}")
        return

    star_dict["ra"] = float(result_basic["ra"][0])
    star_dict["dec"] = float(result_basic["dec"][0])
    star_dict["pm_ra"] = float(result_basic["pmra"][0])
    star_dict["pm_dec"] = float(result_basic["pmde"][0])

    # need a second query, if one of the items doesn't exist, nothing is returned
    result_dist = Simbad.query_tap(
        f"""
        SELECT mesDistance.dist
        FROM ident
        JOIN mesDistance ON mesDistance.oidref = ident.oidref
        WHERE ident.id = '{star_dict["name"]}' AND mesDistance.mespos = 1
        """,
    )

    # set the name after the second query
    star_dict["name"] = name_processing(
        str(result_basic["id"][0]), str(star_dict["name"])
    )

    if len(result_dist) > 0:
        star_dict["distance"] = float(result_dist["dist"][0])
        print(f"Found distance from SIMBAD for {star_dict["name"]}")


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

    star_dict["pm_ra"] = float(input("PM_RA: "))
    star_dict["pm_dec"] = float(input("PM_DEC: "))
    star_dict["distance"] = float(input("Distance in pc: "))
    star_dict["distance_estimated"] = True


def calculate_cartesian(star_dict: Star):
    """
    Calculates the cartesian (x,y,z) coordinates and velocities for a given star.
    Requires proper motions, and a distance.

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
        float(sc.cartesian.y.to_value()),  # type: ignore
        float(sc.cartesian.z.to_value()),  # type: ignore
    ]
    star_dict["cartesian_velocity"] = [
        float(sc.velocity.d_x.to_value()),  # type: ignore
        float(sc.velocity.d_y.to_value()),  # type: ignore
        float(sc.velocity.d_z.to_value()),  # type: ignore
    ]


def get_star_data(star_name: str):
    """
    Find the data for a star, fills out the dictionary specified by Star class.

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
    }

    get_simbad_data(star_dict)

    # if simbad doesn't have data, example acrab, do manual data entry
    if not star_dict["ra"]:
        manual_data_entry(star_dict)

    # If simbad doesn't have distance, fall back to gaia
    if not star_dict["distance"]:
        gaia_3_id = get_gaia_id(star_name)
        dist = get_gaia_dist(gaia_3_id)

        # If there GAIA doesn't have it, estimate with parallax
        if not dist:
            print(f"Distance estimated with parallax for {star_dict["name"]}")
            dist = estimate_dist_with_parallax(star_name)
            star_dict["distance_estimated"] = True

        # Finally if there is no parallax get input
        if not dist:
            print("NO DISTANCE ANYWHERE")
            dist = input("Distance in pc: ")

        star_dict["distance"] = float(dist)

    # calculate the cartesian coordinates
    if star_dict["distance"]:
        calculate_cartesian(star_dict)

    return star_dict
