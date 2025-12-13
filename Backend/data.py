import json
from math import inf
import re
import numpy as np
from astroquery.simbad import Simbad
from astroquery.gaia import Gaia
from astropy.coordinates import SkyCoord, Distance
from astropy import units as u
from astropy.time import Time
from astropy.table import Table

GREEK_ALPHABET = {
    "alf": "α",
    "bet": "β",
    "gam": "γ",
    "del": "δ",
    "eps": "ε",
    "zet": "ζ",
    "eta": "η",
    "tet": "θ",
    "iot": "ι",
    "kap": "κ",
    "lam": "λ",
    "mu": "μ",
    "nu": "ν",
    "xi": "ξ",
    "omi": "ο",
    "pi": "π",
    "rho": "ρ",
    "sig": "σ",
    "tau": "τ",
    "ups": "υ",
    "phi": "φ",
    "chi": "χ",
    "psi": "ψ",
    "ome": "ω",
}


def load_test_constellations_json(
    filename: str,
) -> list[dict]:
    with open(filename, "r") as file:
        data = json.load(file)

    constellations = data["constellations"]
    return constellations


def name_processing(id: str, star: str):
    try:
        if str(id).startswith("NAME"):
            name = str(id).replace("NAME", "").strip()
        else:
            # designation is for example del01, alf,
            _, designation, _ = str(id).split(" ")
            # constellation in the pluralized latin format andromeda -> andromedae from the json
            constellation = star.split(" ")[1]
            # if has number, split the number off
            if bool(re.search(r"\d", designation)):
                if designation.split(" "):
                    name = f"{designation}"
                else:
                    try:
                        name = f"{GREEK_ALPHABET[designation.split("0")[0]]} {designation.split("0")[1]}"
                    except KeyError:
                        name = f"{" ".join(designation.split("0"))}"
            else:
                try:
                    name = f"{GREEK_ALPHABET[designation.lower()]}"
                except KeyError:
                    name = f"{designation.lower()}"
            name = f"{name} {constellation}"
    except Exception:
        name = str(id)

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
            print("Found distance from GAIA")
            return float(result["distance_gspphot"][0])  # type: ignore
    except IndexError:
        return


def get_simbad_data(star_dict: dict[str, str | float]):
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
        SELECT mesDistance.dist, mesDistance.unit
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
        star_dict["distance_unit"] = result_dist["unit"][0]
        print("Found distance from SIMBAD")


def estimate_dist_with_parallax(star: str) -> float | None:
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


def manual_data_entry(star_dict: dict):
    print(f"Star {star_dict["name"]} has no data.")
    star_dict["ra"] = float(input("RA in hours: "))
    star_dict["dec"] = float(input("DEC in degrees: "))
    star_dict["pm_ra"] = float(input("PM_RA: "))
    star_dict["pm_dec"] = float(input("PM_DEC: "))
    star_dict["distance"] = float(input("Distance in pc: "))
    star_dict["dist_estimated"] = True


def get_star_data(star_name: str):
    star_dict = {
        "name": star_name,
        "ra": None,
        "dec": None,
        "pm_ra": None,
        "pm_dec": None,
        "distance": None,
        "distance_unit": "pc",
        "dist_estimated": False,
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
            print("Distance estimated with parallax")
            dist = estimate_dist_with_parallax(star_name)
            star_dict["dist_estimated"] = True

        # Finally if there is no parallax get input
        if not dist:
            print("NO DISTANCE FROM ANYWHERE")
            # dist = input("Distance in pc: ")

        star_dict["distance"] = dist

    # calculate the cartesian coordinates
    if star_dict["distance"]:
        calculate_cartesian(star_dict)

    return star_dict


def calculate_cartesian(star_dict: dict):

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
