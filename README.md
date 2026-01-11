# RealConstellations

A project to visualize how constellations actually look. As the stars that are part of constellations are not at the same distance from Earth, we only see the flat projection.

## Technologies used

- Backend
  - Python
    - FastAPI
    - MongoDB
  - Astropy for star stuff, SIMBAD as data sources
  - Main purpose is to store the star data and convert to cartesian coordinates for use with three.js.
  - Serve the data as an API to query from the frontend
- Frontend
  - TypeScript + React
  - React Three Fiber

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
