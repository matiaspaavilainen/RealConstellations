# RealConstellations

A project to visualize how constellations look in 3D space. As the stars that are part of constellations are not at the same distance from Earth, we only see the flat projection. Work in progress.

Self-hosted with Docker and Traefik on [realconstellations.com](https://realconstellations.com)

## Technologies used

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Astropy](https://img.shields.io/badge/Astropy-ED5C27?style=for-the-badge&logo=python&logoColor=white)](https://www.astropy.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://docs.pmnd.rs/react-three-fiber/)

## Current status

- Core functionality works, more or less done.

## Necessary features

- Some sort of loading screen maybe needed?
- Mobile experience works, but needs polishing

## Would be cool

- Realistic view based on location
  - Maybe detect user location from IP <https://dev.maxmind.com/geoip/geolocate-an-ip/databases/>
  - If Earth simulated, user can select the location <https://github.com/dr5hn/countries-states-cities-database>
- Or view from other stars

- Other skycultures, should be relatively simple from a technical standpoint, just need the data
- Better models for the stars in the detailed view?
- Realistic colors for stars, does data exist?
