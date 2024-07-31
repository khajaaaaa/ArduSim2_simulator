# ArduSim2 simulator

# Description
This project is a full-stack application that processes real-time data from a UDP server, validates it against a JSON schema, and updates a front-end web application using WebSockets. The front-end is a React application that visualizes data through different components, including a Leaflet map and a 3D map powered by Cesium.


## Features

- **UDP Server:** Listens for data on a specified address and port.
- **Data Validation:** Validates incoming JSON data against a predefined schema.
- **Data Persistence:** Stores valid data in a JSON file.
- **WebSocket Server:** Sends updates to the connected clients whenever new data is     received.
- **React Front-end:** Displays data through two main components:
  - **CardComponent:** just the front of the app that shows the Ardusim simulator.
  - **MapComponent:** Visualizes data on a 2D/3D globe using Leaflet and Cesium.

## Architecture

This application consists of two main parts:

1. **Back-end Server:**
   - Implemented with Node.js and Express.
   - Listens for UDP messages.
   - Validates and processes data.
   - Serves static files and handles WebSocket connections.

2. **Front-end Application:**
   - Built with React and React Router.
   - Provides a dynamic user interface for data visualization.


## Installation:

1. Clone the repository:
   - https://github.com/khajaaaaa/ArduSim2_simulator.git
   - cd ArduSim2_simulator

2. Install dependencies:
    npm install

## Running the Application :

# Running with Docker :

    1.Build and run the Docker container:
       - docker-compose up --build

# Running without Docker :

    1.Start the Node.js server:
        npm run start:server 
        or 
        node server.js

    2.Start the React application:
        npm start

# Directory Structure :

The project is organized into two main directories: the root directory, which contains configuration files and the back-end server code, and the `src` directory, which houses the front-end application code.

project-root/
│
├── server.js                # Main server file for the back-end
├── config.json              # Configuration file
├── json_scheme.txt          # JSON schema for data validation
├── package.json             # Back-end dependencies and scripts
│
└── src/                     # Front-end source directory
    ├── App.js               # Main React component
    ├── components/          # React components
    │   ├── CardComponent.js # Card view component
    │   └── MapComponent.js  # Map view component
    ├── data.json            # Persistent data storage
    ├── index.js             # Front-end entry point
    ├── css/                 # CSS styles
    │   └── App.css          # Main styles
    └── package.json         # Front-end dependencies and scripts


## Frontend Overview

The front-end of the application is built with React and uses Leaflet and Cesium for mapping functionalities. The following sections provide details on the primary components and functionalities implemented.

### Key Components

#### `App.js`

The entry point of the React application that sets up routing between different components:
- **`CardComponent`**: Displays data in card format.
- **`MapComponent`**: Renders a map with dynamic features.

#### `MapComponent.js`

This component leverages **Leaflet** for rendering and interacting with maps. Here's an overview of its functionalities:

- **Map Initialization and Rendering**:
  - Uses `MapContainer`, `TileLayer`, `Marker`, `Polyline`, and `LayersControl` from `react-leaflet` to render the map.
  - Provides base layers for both OpenStreetMap and Google Satellite imagery.

- **Drawing and Editing Features**:
  - Incorporates `EditControl` from `react-leaflet-draw` for user interactions like drawing polylines and circles on the map.
  - Handles drawing events to compute distances and radii.

- **Drone Data Management**:
  - Fetches drone data from `http://localhost:3001/data.json` at regular intervals.
  - Processes and filters the drone data, grouping it by drone ID and sorting by time.

- **Simulation and Playback**:
  - Manages drone simulation with play, stop, and reset functionalities.
  - Updates the map based on simulation time and user interactions.

- **Filtering and Display**:
  - Includes filters for position, altitude, speed, battery, flight mode, and status.
  - Applies filters to displayed drones and their trajectories.
  - Uses a `DroneInfo` component to show details about the selected drone.

- **Custom Icons**:
  - Uses custom drone icons (`droneIcon`) and point markers (`pointIcon`) for visual representation.

### Leaflet Integration

**Leaflet** is utilized to provide interactive maps with the following features:

- **Map Layers**:
  - **OpenStreetMap**: Provides standard map tiles.
  - **Satellite View**: Uses Google Maps satellite imagery.

- **Drawing Tools**:
  - Allows users to draw and edit shapes like lines and circles on the map.
  - Computes and displays distances and radii for drawn shapes.

- **Event Handling**:
  - Handles map clicks to deselect drones.
  - Manages zoom level changes to focus on selected drones.

### Additional Components

- **`Timeline.js`**:
  - Provides a timeline interface for controlling simulation time.
  - Allows users to start, stop, and reset simulations, and adjust the time manually.

- **`DroneInfo.js`**:
  - Displays detailed information about the selected drone, including its trajectory.



#Dependencies :

Back-end

    express
    cors
    dgram
    ws
    ajv

Front-end

    react
    react-router-dom
    leaflet (for the 2D display)
    cesium (for 3D map visualization)

    