import json
import numpy as np
from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord
from astropy import units as u


def load_test_constellations_json(
    filename: str,
) -> list[dict[str, str | list[str]]]:
    with open(filename, "r") as file:
        data = json.load(file)

    constellations = data["constellations"]
    return constellations


def get_star_gaia_id(star: str) -> tuple[str, int]:
    """
    Find the GAIA DR3 id for a given star. Queries simbad with the name of the star,
    to find either the GAIA id directly, or to get the coordinates of the star.
    If GAIA id isn't found directly, performs a cone search on GAIA, to find the id.

    :param star: Name of a star
    :type star: str
    :return: Star name, GAIA DR3 id
    :rtype: tuple[str, int]
    """
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, ids.ids
        FROM basic
        JOIN ids ON ids.oidref = basic.oid
        JOIN ident ON ident.oidref = basic.oid
        WHERE ident.id = '{star}'
        """
    )

    name = result[0]["id"].split(" ")[1:]

    try:
        gaia_id = [
            int(str(id).split(" ")[2])
            for id in result[0]["ids"].split("|")
            if str(id).startswith("Gaia DR3")
        ][0]
    except (KeyError, IndexError):
        # If simbad doesn't have gaia id, get coordinates and search for the object from gaia with cone
        result = Simbad.query_tap(
            f"""
        SELECT ident.id, basic.ra, basic.dec
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        WHERE ident.id = '{star}'
        """
        )

        # TODO: Gaia implementation when Gaia is up again
        # Do cone search of the coords, get stars, and try to match the name or something

        gaia_id = 0

    return (name, gaia_id)


def get_test_data(star: str) -> dict[str, str | np.float64]:
    """
    Get test data from SIMBAD, for cassiopeia as it has almost all the data needed in there.
    Use only for cassiopeia.

    :param star: Name of a star
    :type star: str
    :return: name, ra, dec, pm_ra, pm_dec, distance, distance_unit, distance_error
    :rtype: dict[str, str | float64]
    """
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde, mesDistance.dist, mesDistance.unit, mesDistance.plus_err
        FROM basic
        JOIN mesDistance ON mesDistance.oidref = basic.oid
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        WHERE ident.id = '{star}' AND mesPM.mespos = 1 AND mesDistance.mespos = 1
        """,
    )

    star_dict = {}

    if len(result) > 0:
        star_dict["name"] = str(result[0]["id"]).split(" ")[1].strip()
        star_dict["ra"] = result[0]["ra"]
        star_dict["dec"] = result[0]["dec"]
        star_dict["pm_ra"] = result[0]["pmra"]
        star_dict["pm_dec"] = result[0]["pmde"]
        star_dict["distance"] = result[0]["dist"]
        star_dict["distance_unit"] = result[0]["unit"]
        star_dict["distance_error"] = result[0]["plus_err"]
    else:
        result = Simbad.query_tap(
            f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        WHERE ident.id = '{star}' AND mesPM.mespos = 1
        """
        )
        star_dict["name"] = str(result[0]["id"]).split(" ")[1].strip()
        star_dict["ra"] = result[0]["ra"]
        star_dict["dec"] = result[0]["dec"]
        # Proper motions
        star_dict["pm_ra"] = result[0]["pmra"]
        star_dict["pm_dec"] = result[0]["pmde"]
        if star_dict["name"] == "Caph":
            star_dict["distance"] = np.float64(16.8)
            star_dict["distance_error"] = np.float64(0.1)

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

    star_dict["ra"] = float(star_dict["ra"])
    star_dict["dec"] = float(star_dict["dec"])
    del star_dict["pm_ra"]
    del star_dict["pm_dec"]

    star_dict["distance"] = float(star_dict["distance"])
    star_dict["distance_error"] = float(star_dict["distance_error"])

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
