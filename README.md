# RealConstellations

A project to visualize how constellations actually look. As the stars that are part of constellations are not at the same distance from Earth, we only see the flat projection.

## Technologies used

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Astropy](https://img.shields.io/badge/Astropy-ED5C27?style=for-the-badge&logo=python&logoColor=white)](https://www.astropy.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://docs.pmnd.rs/react-three-fiber/)

## Current features

- Visualizes 55/88 constellations
- Decent orbital controls
- Current view is based at the barycenter of the solar system. It shouldn't affect the shapes basically at all (a few million km vs. lightyears)

## Necessary features

- Add the rest of the constellations
- Possibility to click on the constellation to zoom into it and display information
  - AVG distance from Earth
  - Names of the stars
  - Short description about the origins and theme
  - Projection outline and 3D shape
  - Projection as a plane facing earth
  - Can rotate the view to see the actual shape from different angles
- Search box
  - Constellations
  - Stars
- Some sort of loading screen maybe needed?

## Would be cool

- Realistic view based on location
  - Maybe detect user location from IP <https://dev.maxmind.com/geoip/geolocate-an-ip/databases/>
  - If Earth simulated, user can select the location <https://github.com/dr5hn/countries-states-cities-database>
- Or view from other stars

- Other skycultures, realtively simple from a technical standpoint, just need the data
- Better models for the stars in the constellation
- Realistic size for the star, not sure how possible in terms of making it visible
