# RealConstellations

A project to visualize how constellations actually look, given the stars that are part of constellations are not at the same distance from Earth. This means that what we see is just the projection.

## Planned features

- View should be atleast relative to Earth, with toggle for hemispheres
  - First person view, how to control
  - Maybe detect user location from IP <https://dev.maxmind.com/geoip/geolocate-an-ip/databases/>
  - If Earth simulated, user can select the location <https://github.com/dr5hn/countries-states-cities-database>
  - Possibly user could set viewing position to any star, to see how the constellations would look like from there
- Possibility to click on the constellation to zoom into it and display information
  - AVG distance from Earth
  - Names of the stars
  - Short description about the origins and theme
  - Projection outline and 3D shape
  - Can rotate the view to see the actual shape from different angles
  - Click each star
    - Detailed info, what constellation is part of
    - Accurate color
    - More detailed 3D model, maybe a generic one in Blender and colored according to data
- Search box
  - Constellations
  - Stars
- Some sort of loading screen maybe needed?
- Other controls
  - Lanugages?
  - Maybe other skycultures?
- Other notes
  - Constellations indexed internally by the scientific name, example: Ursa Major for Big Bear.

## Potential problems

- Coordinate conversion
- Location selection, if earth not modelled as sphere
- Time selection
- How to simulate light travelling, some stars are dimmer and if position can be selected, some will get brighter and some might become invisible
- How many stars to support?
- Performance, probably going to be 1000s of stars. Can be very simple model in the view from Earth.
- Where to get constellation data?
  - Western probably not problem
  - Other skycultures

## How to do some things

- Each constellation should be drawn by calculating the vector projection towards the users location from the actual vectors between stars.
  - Should be quite future proof and work for everything
- Position on Earth is illusion, just rotate the camera at a certain angle.
  - How to set ground, so can't see through it?
  - Can just be a flat plane, looks like that anyways
- Should only get the bare minimum amount of data for each star to draw it in a constellation, e.g. location and color, maybe size
  - When clicking to constellation, would be epic if just zoom in and then somehow seamlessly switch the scene so that only said constellation is visible.
    - Increase quality of models and query all the info for the constellation when zoomed

## MVP

- At first get only the stars in big dipper, to test and verify that conversion and whatnot works.
- Use that to test everything, maybe add

## Technologies

- Backend
  - Python
  - Django or FastAPI
    - MongoDB
    - Star and constellation separated
  - Astropy for star stuff, GAIA as data source?
    - Load data from GAIA only once, store in local DB, which is then used, GAIA doesn't get updated
  - Main purpose is to store the star data, maybe convert from the celestial coordinate system to Earth centered cartesian for three.js.
    - If user can't select time, then conversion can be done in the backend
      - Data apparently from 2016, includes the direction thing
      - Get the users current time and use that to calculate the locations
    - If time acceleration etc. requires calculation for each frame to determine the position
    - If only options like +100 years, +100000 years, then fine to query positions from backend
- Frontend
  - TypeScript + React or TypeScript Vanilla
  - React Three Fiber or Three.js
