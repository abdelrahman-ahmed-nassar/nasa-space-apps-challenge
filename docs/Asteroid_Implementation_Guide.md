# Asteroid Impact Simulation - Usage Guide

## 🎯 Simple Implementation

This asteroid simulation system is designed to be straightforward:

1. **Input**: Starting XYZ coordinates + Impact date
2. **Output**: Linear trajectory from start point to Earth at impact date
3. **Result**: Asteroid moves along calculated path and hits Earth precisely at the specified date

## 🚀 How to Use

### 1. Through the UI Panel

- Use the asteroid control panel in the top-right corner
- Enter starting coordinates (X, Y, Z)
- Select impact date
- Click "Start Simulation"

### 2. Programmatically

```javascript
// Access the app instance
const app = window.solarSystemApp;

// Setup asteroid trajectory
const config = {
  startXYZ: { x: 200, y: 50, z: 100 }, // Starting position
  impactDate: new Date("2025-11-15"), // When asteroid hits Earth
};

// Start simulation
app.setupAsteroidImpact(config);
```

## 🔧 Key Functions

### Calculate Earth Position at Any Date

```javascript
// The system automatically calculates where Earth will be
const earthPos = app.asteroidTrajectory.calculateEarthPosition(
  new Date("2025-12-01")
);
console.log(`Earth will be at: ${earthPos.x}, ${earthPos.y}, ${earthPos.z}`);
```

### Check Simulation Status

```javascript
// Check if asteroid simulation is running
const isActive = app.asteroidTrajectory.getIsActive();

// Get time until impact (in days)
const timeToImpact = app.asteroidTrajectory.getTimeToImpact();

// Get current asteroid position
const asteroidPos = app.asteroidTrajectory.getAsteroidPosition();
```

## 📋 Example Scenarios

### Scenario 1: Close Approach

```javascript
app.setupAsteroidImpact({
  startXYZ: { x: 120, y: 20, z: 80 },
  impactDate: new Date("2025-10-20"), // 17 days from now
});
```

### Scenario 2: Distant Approach

```javascript
app.setupAsteroidImpact({
  startXYZ: { x: 300, y: 100, z: 200 },
  impactDate: new Date("2026-01-01"), // 3 months from now
});
```

### Scenario 3: High Velocity Impact

```javascript
app.setupAsteroidImpact({
  startXYZ: { x: 500, y: 150, z: 300 },
  impactDate: new Date("2025-11-01"), // 1 month from now
});
```

## ⏰ Time Synchronization

The asteroid trajectory is **fully synchronized** with the time control system:

- **Speed Up Time**: Asteroid moves faster along its path
- **Slow Down Time**: Asteroid moves slower along its path
- **Reverse Time**: Asteroid moves backwards along its path
- **Pause Time**: Asteroid stops moving

The asteroid will **always** hit Earth at the exact simulation date you specify, regardless of time manipulation.

## 🎮 Interactive Features

### Time to Impact Display

- Shows real-time countdown to impact
- Updates as you manipulate time speed
- Displays in days or hours depending on proximity

### Visual Effects

- Asteroid appears as a brown sphere
- Rotates as it travels
- Creates particle explosion on impact
- Simple but effective visual feedback

## 🔧 Technical Details

### Coordinate System

- **X, Y, Z**: Standard 3D coordinates in scene units
- **Earth Radius**: ~6.4 scene units
- **Earth Orbit**: ~90 scene units from Sun
- **Recommended Start Distance**: 100-500 scene units from origin

### Earth Position Calculation

The system uses the same orbital mechanics as the main solar system:

- Earth orbits the Sun in a perfect circle
- Orbital period: 365.25 days (matches real Earth)
- Starting position: October 1, 2025 (synchronized with time control)

### Impact Detection

- Impact occurs when asteroid gets within 1 scene unit of Earth
- Triggers explosion particle effect
- Stops asteroid simulation
- Console logs impact event

## 🚀 Future Enhancements

This simple system provides the foundation for:

- Multiple asteroids
- Gravity effects
- Orbital mechanics
- Impact damage visualization
- Deflection missions
- Real asteroid data integration

## 📝 Console Commands

Open browser console and try:

```javascript
// Quick test
solarSystemApp.setupAsteroidImpact({
  startXYZ: { x: 150, y: 30, z: 100 },
  impactDate: new Date("2025-10-10"),
});

// Check Earth position in 30 days
const future = new Date();
future.setDate(future.getDate() + 30);
const earthPos =
  solarSystemApp.asteroidTrajectory.calculateEarthPosition(future);
console.log("Earth in 30 days:", earthPos);
```

The system is now ready to simulate asteroid impacts with precise timing and Earth position calculations!
