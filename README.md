# RealConstellations

A project to visualize how constellations actually look. As the stars that are part of constellations are not at the same distance from Earth, we only see the flat projection.

## Technologies used

### Backend

[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Astropy](https://img.shields.io/badge/Astropy-ED5C27?logo=python&logoColor=white)](https://www.astropy.org/)

### Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-000000?logo=threedotjs&logoColor=white)](https://docs.pmnd.rs/react-three-fiber/)

## Current features

- Visualizes 55/88 constellations
- Decent orbital controls
- Current view is based at the barycenter of the solar system. It shouldn't affect the shapes basically at all (a few million km vs. lightyears)

## Necessary features

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
  - Possibly user could set viewing position to any star, to see how the constellations would look like from there

- Other skycultures, realtively simple from a technical standpoint, just need the data
- Better models for the stars in the constellation
- Realistic size for the star, not sure how possible in terms of making it visible
