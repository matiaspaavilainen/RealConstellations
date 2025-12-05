import json
import time
import numpy as np
from astroquery.gaia import Gaia
from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord
from astropy import units as u

with open("constellations.json", "r") as file:
    data = json.load(file)

constellation = data["constellations"][2]

# for constellation in data["constellations"]:
#     constellation_list = []
#     for star in constellation["shape_stars"]:
#         result = Simbad.query_tap(
#             f"""
#             SELECT ident.id, ids.ids
#             FROM basic
#             JOIN ids ON ids.oidref = basic.oid
#             JOIN ident ON ident.oidref = basic.oid
#             WHERE ident.id = '{star}'
#             """
#         )
#         constellation_dict = {}
#         constellation_dict["name"] = result[0]["id"]
#         constellation_dict["ids"] = result[0]["ids"].split("|")
#         constellation_list.append(constellation_dict)
#         time.sleep(1)
#     print(constellation["name"])
#     for con in constellation_list:
#         for i in con["ids"]:
#             if str(i).startswith("Gaia DR3"):
#                 print(f"{con["name"]} - {str(i).split(" ")[2]}")
#     print("______________________")

constellation_stars = []
for star in constellation["shape_stars"]:
    result = Simbad.query_tap(
        f"""
        SELECT ident.id, basic.ra, mesPM.pmra, basic.dec, mesPM.pmde, mesPM.bibcode, mesDistance.dist, mesDistance.unit, mesDistance.dist_prec
        FROM basic
        JOIN mesDistance ON mesDistance.oidref = basic.oid
        JOIN ident ON ident.oidref = basic.oid
        JOIN mesPM ON mesPM.oidref = basic.oid
        WHERE ident.id = '{star}' AND mesPM.mespos = 1 AND mesDistance.mespos = 1
        """
    )

    star_dict = {}
    if len(result) > 0:
        star_dict["name"] = str(result[0]["id"]).split(" ")[1].strip()
        star_dict["ra"] = result[0]["ra"]
        star_dict["dec"] = result[0]["dec"]
        star_dict["proper_motion_ra"] = result[0]["pmra"]
        star_dict["proper_motion_de"] = result[0]["pmde"]
        star_dict["distance"] = result[0]["dist"]
        star_dict["unit"] = result[0]["unit"]
        star_dict["distance_precision"] = result[0]["dist_prec"]
    else:
        result = Simbad.query_tap(
            f"""
        SELECT ident.id, basic.ra, basic.dec
        FROM basic
        JOIN ident ON ident.oidref = basic.oid
        WHERE ident.id = '{star}'
        """
        )
        star_dict["name"] = str(result[0]["id"]).split(" ")[1].strip()
        star_dict["ra"] = result[0]["ra"]
        star_dict["dec"] = result[0]["dec"]
        if star_dict["name"] == "Caph":
            star_dict["distance"] = np.float64(16.8)
        time.sleep(1)
    constellation_stars.append(star_dict)
    time.sleep(1)

for star in constellation_stars:
    print(star["name"])
    try:
        c = SkyCoord(
            star["ra"] * u.degree,
            star["dec"] * u.degree,
            star["distance"] * u.pc,
            frame="icrs",
        )
        star["cartesian"] = [c.cartesian.x, c.cartesian.y, c.cartesian.z]  # type: ignore
        print(star["cartesian"])
    except KeyError:
        pass


print("-------------------------------------------------------")
