// Asset imports
import bgTexture1 from "/images/1.jpg";
import bgTexture2 from "/images/2.jpg";
import bgTexture3 from "/images/3.jpg";
import bgTexture4 from "/images/4.jpg";
import sunTexture from "/images/sun.jpg";
import mercuryTexture from "/images/mercurymap.jpg";
import mercuryBump from "/images/mercurybump.jpg";
import venusTexture from "/images/venusmap.jpg";
import venusBump from "/images/venusmap.jpg";
import venusAtmosphere from "/images/venus_atmosphere.jpg";
import earthTexture from "/images/earth_daymap.jpg";
import earthNightTexture from "/images/earth_nightmap.jpg";
import earthAtmosphere from "/images/earth_atmosphere.jpg";
import earthMoonTexture from "/images/moonmap.jpg";
import earthMoonBump from "/images/moonbump.jpg";
import marsTexture from "/images/marsmap.jpg";
import marsBump from "/images/marsbump.jpg";
import jupiterTexture from "/images/jupiter.jpg";
import ioTexture from "/images/jupiterIo.jpg";
import europaTexture from "/images/jupiterEuropa.jpg";
import ganymedeTexture from "/images/jupiterGanymede.jpg";
import callistoTexture from "/images/jupiterCallisto.jpg";
import saturnTexture from "/images/saturnmap.jpg";
import satRingTexture from "/images/saturn_ring.png";
import uranusTexture from "/images/uranus.jpg";
import uraRingTexture from "/images/uranus_ring.png";
import neptuneTexture from "/images/neptune.jpg";
import plutoTexture from "/images/plutomap.jpg";

// Export all textures
export const TEXTURES = {
  backgrounds: [bgTexture1, bgTexture2, bgTexture3, bgTexture4],
  backgroundCube: [
    bgTexture3,
    bgTexture1,
    bgTexture2,
    bgTexture2,
    bgTexture4,
    bgTexture2,
  ],
  sun: sunTexture,
  mercury: { map: mercuryTexture, bump: mercuryBump },
  venus: { map: venusTexture, bump: venusBump, atmosphere: venusAtmosphere },
  earth: {
    day: earthTexture,
    night: earthNightTexture,
    atmosphere: earthAtmosphere,
    moon: { map: earthMoonTexture, bump: earthMoonBump },
  },
  mars: { map: marsTexture, bump: marsBump },
  jupiter: {
    map: jupiterTexture,
    moons: {
      io: ioTexture,
      europa: europaTexture,
      ganymede: ganymedeTexture,
      callisto: callistoTexture,
    },
  },
  saturn: { map: saturnTexture, ring: satRingTexture },
  uranus: { map: uranusTexture, ring: uraRingTexture },
  neptune: { map: neptuneTexture },
  pluto: { map: plutoTexture },
};

// Application settings
export const SETTINGS = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9,
};

// Time control configuration
export const TIME_CONTROL_CONFIG = {
  speedModes: [
    { label: "1 DAY/S", multiplier: 1, unit: "days" },
    { label: "5 DAYS/S", multiplier: 5, unit: "days" },
    { label: "1 WEEK/S", multiplier: 7, unit: "days" },
    { label: "2 WEEKS/S", multiplier: 14, unit: "days" },
    { label: "1 MTH/S", multiplier: 30, unit: "days" },
    { label: "2 MTHS/S", multiplier: 60, unit: "days" },
    { label: "6 MTHS/S", multiplier: 180, unit: "days" },
    { label: "1 YEAR/S", multiplier: 365, unit: "days" },
  ],
};

// Planet data for information display
export const PLANET_DATA = {
  Sun: {
    radius: "696,340 km",
    tilt: "7.25°",
    rotation: "25-35 days (varies by latitude)",
    orbit: "N/A (center of solar system)",
    distance: "0 km (center)",
    moons: "0 (but has 8 planets orbiting)",
    info: "The Sun is a G-type main-sequence star that formed approximately 4.6 billion years ago. It contains 99.86% of the mass in the Solar System and provides the energy that drives Earth's climate and weather. Nuclear fusion in its core converts hydrogen into helium, releasing tremendous amounts of energy as light and heat.",
  },
  Mercury: {
    radius: "2,439.7 km",
    tilt: "0.034°",
    rotation: "58.6 Earth days",
    orbit: "88 Earth days",
    distance: "57.9 million km",
    moons: "0",
    info: "The smallest planet in our solar system and nearest to the Sun.",
  },
  Venus: {
    radius: "6,051.8 km",
    tilt: "177.4°",
    rotation: "243 Earth days",
    orbit: "225 Earth days",
    distance: "108.2 million km",
    moons: "0",
    info: "Second planet from the Sun, known for its extreme temperatures and thick atmosphere.",
  },
  Earth: {
    radius: "6,371 km",
    tilt: "23.5°",
    rotation: "24 hours",
    orbit: "365 days",
    distance: "150 million km",
    moons: "1 (Moon)",
    info: "Third planet from the Sun and the only known planet to harbor life.",
  },
  Mars: {
    radius: "3,389.5 km",
    tilt: "25.19°",
    rotation: "1.03 Earth days",
    orbit: "687 Earth days",
    distance: "227.9 million km",
    moons: "2 (Phobos and Deimos)",
    info: "Known as the Red Planet, famous for its reddish appearance and potential for human colonization.",
  },
  Jupiter: {
    radius: "69,911 km",
    tilt: "3.13°",
    rotation: "9.9 hours",
    orbit: "12 Earth years",
    distance: "778.5 million km",
    moons: "95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)",
    info: "The largest planet in our solar system, known for its Great Red Spot.",
  },
  Saturn: {
    radius: "58,232 km",
    tilt: "26.73°",
    rotation: "10.7 hours",
    orbit: "29.5 Earth years",
    distance: "1.4 billion km",
    moons: "146 known moons",
    info: "Distinguished by its extensive ring system, the second-largest planet in our solar system.",
  },
  Uranus: {
    radius: "25,362 km",
    tilt: "97.77°",
    rotation: "17.2 hours",
    orbit: "84 Earth years",
    distance: "2.9 billion km",
    moons: "27 known moons",
    info: "Known for its unique sideways rotation and pale blue color.",
  },
  Neptune: {
    radius: "24,622 km",
    tilt: "28.32°",
    rotation: "16.1 hours",
    orbit: "165 Earth years",
    distance: "4.5 billion km",
    moons: "14 known moons",
    info: "The most distant planet from the Sun in our solar system, known for its deep blue color.",
  },
  Pluto: {
    radius: "1,188.3 km",
    tilt: "122.53°",
    rotation: "6.4 Earth days",
    orbit: "248 Earth years",
    distance: "5.9 billion km",
    moons: "5 (Charon, Styx, Nix, Kerberos, Hydra)",
    info: "Originally classified as the ninth planet, Pluto is now considered a dwarf planet.",
  },
};

// Moon configurations
export const MOON_CONFIGS = {
  earth: [
    {
      size: 1.6,
      texture: earthMoonTexture,
      bump: earthMoonBump,
      orbitSpeed: 0.001,
      orbitRadius: 10,
    },
  ],

  mars: [
    {
      modelPath: "/images/mars/phobos.glb",
      scale: 0.1,
      orbitRadius: 5,
      orbitSpeed: 0.002,
      position: 100,
      mesh: null,
    },
    {
      modelPath: "/images/mars/deimos.glb",
      scale: 0.1,
      orbitRadius: 9,
      orbitSpeed: 0.0005,
      position: 120,
      mesh: null,
    },
  ],

  jupiter: [
    {
      size: 1.6,
      texture: ioTexture,
      orbitRadius: 20,
      orbitSpeed: 0.0005,
    },
    {
      size: 1.4,
      texture: europaTexture,
      orbitRadius: 24,
      orbitSpeed: 0.00025,
    },
    {
      size: 2,
      texture: ganymedeTexture,
      orbitRadius: 28,
      orbitSpeed: 0.000125,
    },
    {
      size: 1.7,
      texture: callistoTexture,
      orbitRadius: 32,
      orbitSpeed: 0.00006,
    },
  ],
};

// Camera and scene constants
export const CAMERA_CONFIG = {
  fov: 45,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  initialPosition: { x: -175, y: 115, z: 5 },
  zoomOutPosition: { x: -175, y: 115, z: 5 },
};

// Sun configuration
export const SUN_CONFIG = {
  size: 697 / 40, // 40 times smaller scale than earth
  emissiveIntensity: 1.9,
};

// Orbital path colors for each planet (inspired by their characteristics)
export const ORBITAL_COLORS = {
  mercury: 0x8c7853, // Brownish-gray (rocky, closest to sun)
  venus: 0xffb649, // Golden yellow (thick atmosphere, hottest planet)
  earth: 0x6b93d6, // Blue (water world)
  mars: 0xcd5c5c, // Red (iron oxide surface)
  jupiter: 0xffa500, // Orange (Great Red Spot, gas giant)
  saturn: 0xfad5a5, // Pale gold (beautiful rings)
  uranus: 0x4fd0e3, // Cyan (methane atmosphere)
  neptune: 0x4169e1, // Deep blue (windy, distant)
  pluto: 0x8b7d6b, // Brownish (dwarf planet, distant)
};

// Real astronomical positions for October 1, 2025 (ephemeris data)
// Using AU coordinates to calculate angles on circular orbits
export const REAL_PLANET_POSITIONS = {
  mercury: { x_au: 0.32284137074692437, y_au: -0.21358443514977146 },
  venus: { x_au: 0.18764013712218895, y_au: 0.6931125380968133 },
  earth: { x_au: -0.9814999658155844, y_au: -0.1927112850970309 },
  mars: { x_au: 0.7849788940952534, y_au: -1.3335357111713996 },
  jupiter: { x_au: -3.8872389466283987, y_au: 3.8666972079784557 },
  saturn: { x_au: -9.161957927297915, y_au: -0.873633622344086 },
  uranus: { x_au: -6.535682793390827, y_au: -17.524269187750815 },
  neptune: { x_au: 16.728709733160688, y_au: 25.035222600641173 },
  pluto: { x_au: 20.07382363463439, y_au: -34.72977161464132 },
};
