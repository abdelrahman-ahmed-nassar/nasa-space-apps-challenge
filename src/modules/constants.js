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
    // Reverse time modes (negative multipliers)
    {
      label: "-1 YEAR/S",
      multiplier: -365,
      unit: "days",
      direction: "reverse",
    },
    {
      label: "-6 MTHS/S",
      multiplier: -180,
      unit: "days",
      direction: "reverse",
    },
    { label: "-2 MTHS/S", multiplier: -60, unit: "days", direction: "reverse" },
    { label: "-1 MTH/S", multiplier: -30, unit: "days", direction: "reverse" },
    {
      label: "-2 WEEKS/S",
      multiplier: -14,
      unit: "days",
      direction: "reverse",
    },
    { label: "-1 WEEK/S", multiplier: -7, unit: "days", direction: "reverse" },
    { label: "-5 DAYS/S", multiplier: -5, unit: "days", direction: "reverse" },
    { label: "-1 DAY/S", multiplier: -1, unit: "days", direction: "reverse" },

    // Real rate (center position)
    { label: "REAL RATE", multiplier: 0.1, unit: "days", direction: "real" },

    // Forward time modes (positive multipliers)
    { label: "+1 DAY/S", multiplier: 1, unit: "days", direction: "forward" },
    { label: "+5 DAYS/S", multiplier: 5, unit: "days", direction: "forward" },
    { label: "+1 WEEK/S", multiplier: 7, unit: "days", direction: "forward" },
    { label: "+2 WEEKS/S", multiplier: 14, unit: "days", direction: "forward" },
    { label: "+1 MTH/S", multiplier: 30, unit: "days", direction: "forward" },
    { label: "+2 MTHS/S", multiplier: 60, unit: "days", direction: "forward" },
    { label: "+6 MTHS/S", multiplier: 180, unit: "days", direction: "forward" },
    { label: "+1 YEAR/S", multiplier: 365, unit: "days", direction: "forward" },
  ],
  defaultSpeedIndex: 8, // REAL RATE is at index 8 (center position)
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
    atmosphere:
      "The Sun has no solid surface or traditional atmosphere. Its 'atmosphere' consists of the photosphere, chromosphere, and corona - layers of superheated plasma reaching millions of degrees.",
    surface:
      "The Sun has no solid surface. Its visible surface is the photosphere, a layer of hot plasma at about 5,500°C. Solar flares and sunspots are visible features of this dynamic stellar surface.",
    facts: [
      { icon: "⚡", text: "Generates energy through nuclear fusion" },
      { icon: "🌡️", text: "Core temperature: 15 million°C" },
      { icon: "💫", text: "Contains 99.86% of solar system's mass" },
    ],
  },
  Mercury: {
    radius: "2,439.7 km",
    tilt: "0.034°",
    rotation: "58.6 Earth days",
    orbit: "88 Earth days",
    distance: "57.9 million km",
    moons: "0",
    info: "Mercury is the smallest planet in our solar system and nearest to the Sun. Despite being closest to the Sun, it's not the hottest planet due to its lack of atmosphere. It experiences extreme temperature variations, from 427°C during the day to -173°C at night.",
    atmosphere:
      "Mercury has an extremely thin exosphere composed of oxygen, sodium, hydrogen, helium, and potassium. This minimal atmosphere cannot retain heat, causing extreme temperature swings.",
    surface:
      "Mercury's surface is heavily cratered, similar to Earth's Moon. It has large plains, steep cliffs called scarps, and the Caloris Basin - one of the largest impact craters in the solar system.",
    facts: [
      { icon: "🌡️", text: "Extreme temperature swings: -173°C to 427°C" },
      { icon: "⚡", text: "Fastest orbital speed: 47.87 km/s" },
      { icon: "🌙", text: "No moons or ring system" },
    ],
  },
  Venus: {
    radius: "6,051.8 km",
    tilt: "177.4°",
    rotation: "243 Earth days",
    orbit: "225 Earth days",
    distance: "108.2 million km",
    moons: "0",
    info: "Venus is the second planet from the Sun and the hottest in our solar system due to its thick, toxic atmosphere that traps heat. Often called Earth's twin due to similar size, Venus rotates backwards and has surface temperatures hot enough to melt lead.",
    atmosphere:
      "Venus has a thick atmosphere of 96% carbon dioxide with clouds of sulfuric acid. The extreme greenhouse effect creates surface temperatures of 462°C - hot enough to melt lead.",
    surface:
      "Venus has a volcanic surface with over 1,000 volcanoes, vast lava plains, and impact craters. The surface is hidden beneath thick clouds and shaped by intense volcanic activity.",
    facts: [
      { icon: "🔄", text: "Rotates backwards (retrograde)" },
      { icon: "🌋", text: "Over 1,000 volcanoes on surface" },
      { icon: "💨", text: "Winds up to 360 km/h in upper atmosphere" },
    ],
  },
  Earth: {
    radius: "6,371 km",
    tilt: "23.5°",
    rotation: "24 hours",
    orbit: "365 days",
    distance: "150 million km",
    moons: "1 (Moon)",
    info: "Earth—our home planet—is the only place we know of so far that's inhabited by living things. It's also the only planet in our solar system with liquid water on the surface. Earth's atmosphere protects us from meteoroids and harmful solar radiation.",
    atmosphere:
      "Earth's atmosphere is composed of 78% nitrogen, 21% oxygen, and 1% other gases including argon and carbon dioxide. This unique composition supports life and protects us from harmful solar radiation.",
    surface:
      "Earth's surface is 71% water and 29% land. It features diverse landscapes including mountains, valleys, deserts, polar ice caps, and vast oceans that support an incredible variety of life.",
    facts: [
      { icon: "💫", text: "Only known planet with life" },
      { icon: "🌊", text: "71% of surface covered by water" },
      { icon: "🛡️", text: "Protected by magnetic field" },
    ],
  },
  Mars: {
    radius: "3,389.5 km",
    tilt: "25.19°",
    rotation: "1.03 Earth days",
    orbit: "687 Earth days",
    distance: "227.9 million km",
    moons: "2 (Phobos and Deimos)",
    info: "Known as the Red Planet due to iron oxide on its surface, Mars has the largest volcano and canyon in the solar system. Evidence suggests it once had liquid water, making it a prime target for searching for past or present life and future human exploration.",
    atmosphere:
      "Mars has a thin atmosphere composed of 95% carbon dioxide, 3% nitrogen, and traces of other gases. The low atmospheric pressure means liquid water cannot exist on the surface.",
    surface:
      "Mars features the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system. Polar ice caps, ancient riverbeds, and seasonal dust storms shape its landscape.",
    facts: [
      { icon: "🔴", text: "Red color from iron oxide (rust)" },
      { icon: "🏔️", text: "Home to largest volcano in solar system" },
      { icon: "🌊", text: "Evidence of ancient water flows" },
    ],
  },
  Jupiter: {
    radius: "69,911 km",
    tilt: "3.13°",
    rotation: "9.9 hours",
    orbit: "12 Earth years",
    distance: "778.5 million km",
    moons: "95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)",
    info: "The largest planet in our solar system, Jupiter is a gas giant with a mass greater than all other planets combined. Famous for its Great Red Spot storm and extensive moon system, Jupiter acts as a cosmic vacuum cleaner, protecting inner planets from asteroids and comets.",
    atmosphere:
      "Jupiter's atmosphere is 89% hydrogen and 10% helium with traces of methane, water vapor, and ammonia. The Great Red Spot is a massive storm larger than Earth that has raged for centuries.",
    surface:
      "Jupiter has no solid surface - it's a gas giant with a possible small rocky core. The visible 'surface' is actually the top of its thick atmosphere with colorful bands and swirling storms.",
    facts: [
      { icon: "🌪️", text: "Great Red Spot storm larger than Earth" },
      { icon: "🛡️", text: "Protects inner planets from asteroids" },
      { icon: "🌙", text: "95 known moons including 4 major ones" },
    ],
  },
  Saturn: {
    radius: "58,232 km",
    tilt: "26.73°",
    rotation: "10.7 hours",
    orbit: "29.5 Earth years",
    distance: "1.4 billion km",
    moons: "146 known moons",
    info: "Distinguished by its spectacular ring system, Saturn is the second-largest planet and less dense than water. Its moon Titan has a thick atmosphere and liquid methane lakes, while Enceladus shows signs of a subsurface ocean beneath its icy crust.",
    atmosphere:
      "Saturn's atmosphere is similar to Jupiter's - mostly hydrogen and helium with traces of methane and ammonia. Strong winds create distinct bands and occasional large storms.",
    surface:
      "Like Jupiter, Saturn has no solid surface but likely has a small rocky core. Its low density means it would float in water if there were an ocean large enough.",
    facts: [
      { icon: "💍", text: "Spectacular ring system made of ice and rock" },
      { icon: "🪶", text: "Less dense than water" },
      { icon: "🌙", text: "146 known moons including Titan" },
    ],
  },
  Uranus: {
    radius: "25,362 km",
    tilt: "97.77°",
    rotation: "17.2 hours",
    orbit: "84 Earth years",
    distance: "2.9 billion km",
    moons: "27 known moons",
    info: "Uranus is unique for rotating on its side, likely due to an ancient collision. This ice giant has a faint ring system and appears blue-green due to methane in its atmosphere. Its extreme axial tilt causes each pole to experience 42 years of continuous sunlight followed by 42 years of darkness.",
    atmosphere:
      "Uranus has an atmosphere of 83% hydrogen, 15% helium, and 2% methane. The methane gives it a blue-green color and the planet has the coldest atmospheric temperatures in the solar system.",
    surface:
      "Uranus is an ice giant with no solid surface. It likely has a small rocky core surrounded by a mantle of water, methane, and ammonia ices, all enclosed in an atmosphere of hydrogen and helium.",
    facts: [
      { icon: "🔄", text: "Rotates on its side (97.77° tilt)" },
      { icon: "❄️", text: "Coldest atmospheric temperatures" },
      { icon: "💍", text: "Faint ring system discovered in 1977" },
    ],
  },
  Neptune: {
    radius: "24,622 km",
    tilt: "28.32°",
    rotation: "16.1 hours",
    orbit: "165 Earth years",
    distance: "4.5 billion km",
    moons: "14 known moons",
    info: "The most distant planet in our solar system, Neptune is known for having the strongest winds, reaching speeds of up to 2,100 km/h. Its deep blue color comes from methane in its atmosphere, and it was the first planet discovered through mathematical prediction rather than observation.",
    atmosphere:
      "Neptune's atmosphere is 80% hydrogen, 19% helium, and 1% methane. The methane creates its deep blue color, and the planet generates more heat than it receives from the Sun.",
    surface:
      "Neptune is an ice giant with no solid surface. It has a small rocky core about the size of Earth, surrounded by a mantle of water, methane, and ammonia ices.",
    facts: [
      { icon: "💨", text: "Strongest winds: up to 2,100 km/h" },
      { icon: "🔵", text: "Deep blue color from methane" },
      { icon: "📐", text: "Discovered through mathematics" },
    ],
  },
  Pluto: {
    radius: "1,188.3 km",
    tilt: "122.53°",
    rotation: "6.4 Earth days",
    orbit: "248 Earth years",
    distance: "5.9 billion km",
    moons: "5 (Charon, Styx, Nix, Kerberos, Hydra)",
    info: "Once classified as the ninth planet, Pluto is now considered a dwarf planet in the Kuiper Belt. It has a complex relationship with its largest moon Charon, forming a binary system. New Horizons revealed a surprisingly diverse and geologically active world with nitrogen plains and methane dunes.",
    atmosphere:
      "Pluto has a thin atmosphere composed mainly of nitrogen with traces of methane and carbon monoxide. The atmosphere changes dramatically as Pluto's distance from the Sun varies during its orbit.",
    surface:
      "Pluto's surface features nitrogen plains, methane dunes, and water-ice mountains. The heart-shaped Tombaugh Regio contains smooth plains of nitrogen ice, while other areas show complex geological activity.",
    facts: [
      { icon: "💫", text: "Dwarf planet in the Kuiper Belt" },
      { icon: "👯", text: "Binary system with moon Charon" },
      { icon: "🏔️", text: "Water-ice mountains and nitrogen plains" },
    ],
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
