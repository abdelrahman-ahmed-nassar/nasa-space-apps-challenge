# Solar System 3D - NASA Space Apps Challenge

## Project Overview

This is an interactive 3D solar system visualization built for the NASA Space Apps Challenge (Meteor Madness theme). The application provides a realistic, explorable representation of our solar system using WebGL technology through Three.js.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Technical Architecture

### Core Technologies

- **Framework**: Vanilla JavaScript with ES6 modules
- **Build Tool**: Vite 4.5.0
- **3D Engine**: Three.js 0.160.0
- **UI Controls**: dat.GUI 0.7.9
- **Post-processing**: Custom shader pipeline with bloom and outline effects

### Project Structure

```
src/
├── script.js          # Main application logic and Three.js setup
├── style.css          # UI styling and responsive design
├── index.html         # Entry point with GUI container
├── dashboard.html     # Dashboard page for project information
├── navigation.js      # Client-side routing handler
├── images/           # Planet textures and astronomical imagery
│   ├── mars/         # Mars moon 3D models (Phobos, Deimos)
│   └── [planet textures, bump maps, atmospheres]
├── asteroids/        # 3D asteroid models
├── modules/          # Modular components
│   ├── router.js     # Routing utilities (unused in current implementation)
│   └── [other modules]
└── static/           # Additional static assets
```

## 🔗 Dashboard Routing System

### Overview

A custom routing system has been implemented to serve clean URLs without file extensions. The dashboard is accessible at `/dashboard` instead of `/dashboard.html`.

### Implementation Details

#### 1. Vite Configuration (`vite.config.js`)

**Custom Plugin**: A Vite plugin handles URL rewriting to serve clean routes

```javascript
plugins: [
  {
    name: "dashboard-route",
    configureServer(server) {
      server.middlewares.use("/dashboard", (req, res, next) => {
        // Serve dashboard.html content at /dashboard route
        const dashboardPath = path.join(process.cwd(), 'src', 'dashboard.html');

        try {
          const content = fs.readFileSync(dashboardPath, 'utf8');
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
          });
          res.end(content);
        } catch (err) {
          next();
        }
      });
    },
  },
],
```

**Key Features**:

- Intercepts requests to `/dashboard`
- Reads `dashboard.html` content synchronously
- Serves HTML with proper content type headers
- Falls back to default behavior on errors

#### 2. Client-Side Navigation (`navigation.js`)

**Purpose**: Handles browser navigation events and routing logic

```javascript
export class Navigation {
  constructor() {
    this.init();
  }

  init() {
    // Handle navigation clicks for internal links
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href === "/dashboard") {
          window.location.href = "/dashboard";
        } else {
          this.navigate(href);
        }
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });
  }
}
```

**Navigation Features**:

- Prevents default link behavior for internal routes
- Handles browser history (back/forward buttons)
- Automatically initializes on DOM content loaded
- Supports future route expansion

#### 3. Dashboard Page (`dashboard.html`)

**Content**: Information hub with project details and quick facts

**Features**:

- **Responsive Design**: CSS Grid layout for dashboard cards
- **Back Navigation**: Link to return to main solar system view
- **Interactive Cards**: Hover effects and animations
- **Project Information**: Overview, mission status, astronomical events
- **Quick Facts**: Educational content about the solar system

**Styling Highlights**:

```css
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  margin-top: 50px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```

### Usage

#### Accessing the Dashboard

1. **Direct URL**: Navigate to `http://localhost:5173/dashboard`
2. **Programmatic**: Use `window.location.href = '/dashboard'`
3. **Back Navigation**: Use the "← Back to Solar System" button

#### URL Behavior

- ✅ **Clean URLs**: `/dashboard` (not `/dashboard.html`)
- ✅ **Browser History**: Back/forward buttons work correctly
- ✅ **Bookmarkable**: Direct links to `/dashboard` work
- ✅ **Development**: Works in Vite dev server
- ✅ **Production**: Build process includes both HTML files

### Adding New Routes

To add additional routes to the system:

#### 1. Create HTML File

```bash
# Create new page in src/
touch src/newpage.html
```

#### 2. Update Vite Configuration

```javascript
// Add to vite.config.js plugins array
server.middlewares.use("/newpage", (req, res, next) => {
  const pagePath = path.join(process.cwd(), "src", "newpage.html");
  // ... same serving logic as dashboard
});
```

#### 3. Update Build Configuration

```javascript
// Add to rollupOptions.input
rollupOptions: {
  input: {
    main: "src/index.html",
    dashboard: "src/dashboard.html",
    newpage: "src/newpage.html", // Add new entry
  },
}
```

#### 4. Add Navigation Links

```javascript
// Update navigation.js handleRoute method
switch (path) {
  case "/dashboard":
    // Dashboard route handling
    break;
  case "/newpage":
    // New page route handling
    break;
  // ...
}
```

### Troubleshooting

#### Common Issues

**404 Errors**:

- Ensure Vite dev server is running
- Check middleware registration in `vite.config.js`
- Verify HTML file exists in `src/` directory

**Styling Issues**:

- Dashboard uses the main `style.css` file
- Additional styles are embedded in the HTML
- Ensure CSS paths are relative to the `src/` directory

**Navigation Problems**:

- Check `navigation.js` is loaded in the main page
- Verify event listeners are properly attached
- Test browser console for JavaScript errors

### Performance Considerations

- **Synchronous File Reading**: Dashboard content is read synchronously for simplicity
- **Memory Usage**: HTML content is read on each request (not cached)
- **Future Optimization**: Consider implementing file caching for production builds

## 🌌 Core System Components

### 1. Scene Setup (`script.js` lines 1-100)

- **Scene**: Three.js scene container
- **Camera**: Perspective camera with orbit controls
- **Renderer**: WebGL renderer with shadow mapping
- **Lighting**: Point light positioned at Sun + ambient light
- **Post-processing**: EffectComposer with bloom and outline passes

### 2. Planet Creation System (`createPlanet` function)

**Location**: Lines 300-450
**Purpose**: Factory function for generating planet objects

**Parameters**:

- `planetName`: String identifier
- `size`: Radius in scene units
- `position`: Distance from Sun
- `tilt`: Axial rotation in degrees
- `texture`: Surface texture path
- `bump`: Optional bump map for surface detail
- `ring`: Optional ring system configuration
- `atmosphere`: Optional atmospheric layer
- `moons`: Array of moon configurations

**Returns**: Object containing planet mesh, 3D container, atmosphere, moons, and ring system

### 3. Planet Configurations

Each planet is instantiated with specific parameters:

```javascript
const earth = new createPlanet(
  "Earth",
  6.4,
  90,
  23,
  earthMaterial,
  null,
  null,
  earthAtmosphere,
  earthMoon
);
```

**Key Planet Features**:

- **Earth**: Custom day/night shader with atmospheric effects
- **Saturn/Uranus**: Ring systems with transparency
- **Venus/Earth**: Atmospheric layers with opacity
- **Mars**: 3D model moons (Phobos, Deimos)
- **Jupiter**: Four major moons with orbital mechanics

### 4. Animation System (`animate` function)

**Location**: Lines 800-950
**Responsibilities**:

- Planet rotation (self-spin)
- Orbital motion around Sun
- Moon orbital mechanics
- Asteroid belt rotation
- Year calculation based on Earth's orbit
- Camera transitions for planet focus

### 5. Interaction System

**Mouse Events**: Lines 150-250

- **Hover**: Outline highlighting via raycasting
- **Click**: Planet selection and camera zoom
- **Planet Info**: Display detailed astronomical data

**Raycast Targets**: Array of clickable planet meshes including atmospheres

### 6. Shader System

**Earth Day/Night Shader**: Lines 550-600

- Custom vertex/fragment shaders
- Dynamic lighting based on Sun position
- Blends day and night textures based on illumination

## 📊 Data Structures

### Planet Data Object

```javascript
const planetData = {
  [PlanetName]: {
    radius: "Physical radius in km",
    tilt: "Axial tilt in degrees",
    rotation: "Rotation period",
    orbit: "Orbital period",
    distance: "Distance from Sun",
    moons: "Number/names of moons",
    info: "Educational description",
  },
};
```

### Moon Configuration

```javascript
const moonConfig = {
  size: Number, // Radius in scene units
  texture: String, // Texture file path
  bump: String, // Optional bump map
  orbitSpeed: Number, // Orbital velocity
  orbitRadius: Number, // Distance from planet
  modelPath: String, // For 3D models (Mars moons)
};
```

## 🎮 Interactive Features

### GUI Controls (`dat.GUI`)

- **accelerationOrbit**: Controls orbital speed (0-10)
- **acceleration**: Controls rotation speed (0-10)
- **sunIntensity**: Controls Sun brightness (1-10)

### Camera System

- **Orbit Controls**: Pan, zoom, rotate around scene
- **Auto-Focus**: Smooth transitions to selected planets
- **Zoom States**: Overview mode and planet-focused mode

### Information Display

- **Planet Info Panel**: Detailed astronomical data
- **Year Counter**: Real-time simulation year based on Earth orbit
- **Hover Effects**: Visual feedback via outline highlighting

## 🌠 Asset Management

### Texture Categories

- **Surface Maps**: Primary planet appearance
- **Bump Maps**: Surface detail and topology
- **Atmosphere Maps**: Gaseous layer effects
- **Normal Maps**: Advanced surface lighting
- **Ring Textures**: Semi-transparent ring systems

### 3D Models (GLB Format)

- **Asteroid Pack**: Procedurally distributed in belts
- **Mars Moons**: Phobos and Deimos with realistic geometry

## 🔧 Implementation Guidelines for New Features

### Adding New Planets/Objects

1. **Create texture assets** in `/src/images/`
2. **Import textures** at top of `script.js`
3. **Instantiate object** using `createPlanet()` or custom geometry
4. **Add to raycast targets** for interaction
5. **Update planet data object** for information display
6. **Configure shadow casting/receiving**

### Modifying Animation

1. **Locate animate() function** (line ~800)
2. **Add rotation/orbital logic** following existing patterns
3. **Update year calculation** if affecting Earth's orbit
4. **Test performance impact** with multiple objects

### Adding UI Features

1. **Extend GUI controls** in dat.GUI setup section
2. **Create HTML elements** in `index.html`
3. **Add CSS styling** in `style.css`
4. **Implement event handlers** in `script.js`

### Shader Modifications

1. **Study existing Earth shader** implementation
2. **Create uniform variables** for dynamic data
3. **Test fragment/vertex shader** changes incrementally
4. **Consider performance impact** on mobile devices

## 🐛 Common Development Pitfalls

### Performance Considerations

- **Texture Resolution**: Balance quality vs. memory usage
- **Polygon Count**: Monitor mesh complexity for mobile
- **Shadow Mapping**: Expensive operation, use selectively
- **Animation Loops**: Avoid creating objects in animate()

### Three.js Gotchas

- **Scene Graph**: Understand parent-child relationships
- **Material Updates**: Call `material.needsUpdate = true` after changes
- **Geometry Disposal**: Manually dispose of geometries to prevent memory leaks
- **Camera Controls**: Update controls in animation loop

### Asset Loading

- **Async Loading**: Handle loading states for 3D models
- **Path Resolution**: Vite handles asset bundling automatically
- **CORS Issues**: Serve from development server, not file://

## 🧪 Testing New Features

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Open browser console**: Monitor for Three.js warnings
3. **Test interactions**: Verify mouse events and GUI controls
4. **Check performance**: Use browser performance tools
5. **Validate on mobile**: Test touch interactions and performance

### Debug Tools

- **Three.js Inspector**: Browser extension for scene debugging
- **Stats.js**: Add FPS monitoring during development
- **Console Logging**: Extensive logging already implemented
- **dat.GUI**: Real-time parameter adjustment

## 🌍 Educational Context

This project serves as both a technical demonstration and educational tool. When implementing new features, consider:

- **Scientific Accuracy**: Verify astronomical data and scales
- **User Experience**: Maintain intuitive navigation and interaction
- **Performance**: Ensure smooth experience across devices
- **Educational Value**: Enhance learning through visual representation

## 📚 Key Dependencies Documentation

- **Three.js**: [threejs.org/docs](https://threejs.org/docs/)
- **dat.GUI**: [github.com/dataarts/dat.gui](https://github.com/dataarts/dat.gui)
- **Vite**: [vitejs.dev/guide](https://vitejs.dev/guide/)

---

_This README provides the foundational knowledge needed to understand, modify, and extend the Solar System 3D visualization. Always test changes thoroughly and consider the educational impact of new features._
