import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

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

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  0.4,
  0.85
);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([
  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2,
]);

// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9,
};

// ****** TIME CONTROL SYSTEM ******
const timeControl = {
  isPaused: false,
  currentSpeedIndex: 0,
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

  getCurrentSpeed() {
    if (this.isPaused) return 0;
    return this.speedModes[this.currentSpeedIndex].multiplier;
  },

  getSpeedLabel() {
    if (this.isPaused) return "PAUSED";
    return this.speedModes[this.currentSpeedIndex].label;
  },
};

// Current simulation time
let simulationDate = new Date(2025, 9, 1, 6, 39, 36); // Oct 1, 2025, 06:39:36
let lastFrameTime = performance.now();
let earthOrbitAngle = 0; // Track Earth's orbital angle in radians
let startingDate = new Date(2025, 9, 1); // Starting date for synchronization
let startingOrbitAngle = 0; // Earth's orbital position at the starting date
let currentDateElement; // Global reference to date display element

// Global references to time control elements
let speedLabel, playPauseBtn, speedIndicator, progressArc, timeControlContainer;

// Global function to update time control UI
function updateTimeControlUI() {
  if (
    !speedLabel ||
    !playPauseBtn ||
    !speedIndicator ||
    !progressArc ||
    !timeControlContainer
  ) {
    return; // Exit if elements aren't initialized yet
  }

  speedLabel.textContent = timeControl.getSpeedLabel();

  // Update progress curve position
  const progress =
    timeControl.currentSpeedIndex / (timeControl.speedModes.length - 1);

  // Calculate position along the curved line using quadratic Bezier curve
  // Control points: Start(50, 20), Control(200, 60), End(350, 20)
  const t = progress; // parameter along curve (0 to 1)
  const startX = 50,
    startY = 20;
  const controlX = 200,
    controlY = 60;
  const endX = 350,
    endY = 20;

  // Quadratic Bezier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
  const cx =
    Math.pow(1 - t, 2) * startX +
    2 * (1 - t) * t * controlX +
    Math.pow(t, 2) * endX;
  const cy =
    Math.pow(1 - t, 2) * startY +
    2 * (1 - t) * t * controlY +
    Math.pow(t, 2) * endY;

  speedIndicator.setAttribute("cx", cx);
  speedIndicator.setAttribute("cy", cy);

  // Update progress curve path - from start to current position
  progressArc.setAttribute(
    "d",
    `M 50 20 Q ${50 + (controlX - 50) * t} ${
      20 + (controlY - 20) * t
    } ${cx} ${cy}`
  );

  // Update paused state
  if (timeControl.isPaused) {
    timeControlContainer.classList.add("paused");
    playPauseBtn.innerHTML = "&#9654;"; // Play symbol
  } else {
    timeControlContainer.classList.remove("paused");
    playPauseBtn.innerHTML = "&#9208;"; // Pause symbol
  }
}

// Initialize time control UI
function initTimeControl() {
  speedLabel = document.getElementById("speedLabel");
  const prevBtn = document.getElementById("prevSpeed");
  playPauseBtn = document.getElementById("playPause");
  const nextBtn = document.getElementById("nextSpeed");
  speedIndicator = document.getElementById("speedIndicator");
  progressArc = document.getElementById("progressArc");
  timeControlContainer = document.getElementById("timeControlContainer");
  currentDateElement = document.getElementById("currentDate"); // Assign to global variable

  // Event listeners
  prevBtn.addEventListener("click", () => {
    if (timeControl.currentSpeedIndex > 0) {
      timeControl.currentSpeedIndex--;
      updateTimeControlUI();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (timeControl.currentSpeedIndex < timeControl.speedModes.length - 1) {
      timeControl.currentSpeedIndex++;
      updateTimeControlUI();
    }
  });

  playPauseBtn.addEventListener("click", () => {
    timeControl.isPaused = !timeControl.isPaused;
    playPauseBtn.textContent = timeControl.isPaused ? "▶" : "⏸";
    updateTimeControlUI();
  });

  // Dragging functionality for speed indicator
  let isDragging = false;

  speedIndicator.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const svg = document.querySelector(".curved-progress-svg");
    const rect = svg.getBoundingClientRect();

    // Get mouse position relative to SVG
    const mouseX = e.clientX - rect.left;

    // Clamp mouseX to the curve bounds (50 to 350)
    const clampedX = Math.max(50, Math.min(350, mouseX));

    // Calculate progress based on X position (0 to 1)
    const progress = (clampedX - 50) / (350 - 50);

    timeControl.currentSpeedIndex = Math.round(
      progress * (timeControl.speedModes.length - 1)
    );

    updateTimeControlUI();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Initial UI update
  updateTimeControlUI();
}

// Update time display
function updateTimeDisplay() {
  if (!currentDateElement) return;

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const month = months[simulationDate.getMonth()];
  const day = simulationDate.getDate().toString().padStart(2, "0");
  const year = simulationDate.getFullYear();

  const newText = `${month} ${day}, ${year}`;

  currentDateElement.textContent = newText;
}

// Update simulation time
function updateSimulationTime() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;

  if (!timeControl.isPaused) {
    const speedMultiplier = timeControl.getCurrentSpeed();

    // Calculate orbital progression based on simulation time
    // speedMultiplier is days per second, Earth takes 365.25 days for one orbit (2π radians)
    const radiansPerDay = (Math.PI * 2) / 365.25; // How many radians Earth moves per day
    const radiansPerSecond = radiansPerDay * speedMultiplier; // Scale by current speed

    // Update Earth's orbital angle based on real time elapsed
    earthOrbitAngle += radiansPerSecond * deltaTime;

    // Calculate how many complete orbits Earth has made since the starting point
    const totalOrbitAngle = earthOrbitAngle - startingOrbitAngle;

    // Convert total orbital angle to years (2π radians = 1 year)
    const yearsElapsed = totalOrbitAngle / (Math.PI * 2);

    // Convert years to days
    const daysElapsed = yearsElapsed * 365.25; // Using 365.25 for leap years

    // Calculate the new simulation date
    const millisecondsElapsed = daysElapsed * 24 * 60 * 60 * 1000;
    simulationDate = new Date(startingDate.getTime() + millisecondsElapsed);

    // Calculate the required accelerationOrbit so that Earth completes one orbit in exactly 365.25 simulation days
    // Earth rotates 0.001 * settings.accelerationOrbit radians per frame
    // At 60 fps, Earth should complete 2π radians in (365.25 / speedMultiplier) real seconds
    const targetSecondsForOneOrbit = 365.25 / speedMultiplier;
    const targetFramesForOneOrbit = targetSecondsForOneOrbit * 60; // Assuming 60 fps
    const requiredAcceleration =
      (Math.PI * 2) / (0.001 * targetFramesForOneOrbit);

    // Update settings for planets based on time speed
    settings.accelerationOrbit = requiredAcceleration;
    settings.acceleration = speedMultiplier;
  } else {
    settings.accelerationOrbit = 0;
    settings.acceleration = 0;
  }

  // Always update the time display
  updateTimeDisplay();
}

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;
let isPlanetInfoVisible = false; // Track if planet info card is currently displayed

function onDocumentMouseDown(event) {
  event.preventDefault();

  // Don't process planet clicks if planet info is currently visible
  if (isPlanetInfoVisible) {
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();

      // Automatically pause time control immediately when planet is clicked
      if (!timeControl.isPaused) {
        timeControl.isPaused = true;
        if (playPauseBtn) {
          playPauseBtn.textContent = "▶"; // Update button to show play symbol
        }
        updateTimeControlUI();
      }

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      targetCameraPosition
        .copy(planetPosition)
        .add(
          camera.position
            .clone()
            .sub(planetPosition)
            .normalize()
            .multiplyScalar(offset)
        );
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
  if (clickedObject.material === mercury.planet.material) {
    offset = 10;
    return mercury;
  } else if (clickedObject.material === venus.Atmosphere.material) {
    offset = 25;
    return venus;
  } else if (clickedObject.material === earth.Atmosphere.material) {
    offset = 25;
    return earth;
  } else if (clickedObject.material === mars.planet.material) {
    offset = 15;
    return mars;
  } else if (clickedObject.material === jupiter.planet.material) {
    offset = 50;
    return jupiter;
  } else if (clickedObject.material === saturn.planet.material) {
    offset = 50;
    return saturn;
  } else if (clickedObject.material === uranus.planet.material) {
    offset = 25;
    return uranus;
  } else if (clickedObject.material === neptune.planet.material) {
    offset = 20;
    return neptune;
  } else if (clickedObject.material === pluto.planet.material) {
    offset = 10;
    return pluto;
  }

  return null;
}

// ******  SHOW PLANET INFO AFTER SELECTION  ******
function showPlanetInfo(planet) {
  var info = document.getElementById("planetInfo");
  var name = document.getElementById("planetName");
  var details = document.getElementById("planetDetails");

  name.innerText = planet;
  details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;

  info.style.display = "block";
  isPlanetInfoVisible = true; // Set flag to prevent planet clicks while info is visible
}
let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
// close 'x' button function
function closeInfo() {
  var info = document.getElementById("planetInfo");
  info.style.display = "none";
  isPlanetInfoVisible = false; // Reset flag to allow planet clicks again
  isZoomingOut = true;
  controls.target.set(0, 0, 0);

  // Resume time control when closing planet details
  if (timeControl.isPaused) {
    timeControl.isPaused = false;
    const playPauseBtn = document.getElementById("playPause");
    if (playPauseBtn) {
      playPauseBtn.textContent = "⏸"; // Update button to show pause symbol
    }
    updateTimeControlUI();
  }
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById("planetInfo");
  info.style.display = "none";
  isPlanetInfoVisible = false; // Reset flag to allow planet clicks again

  // Resume time control when closing planet details to view another planet
  if (timeControl.isPaused) {
    timeControl.isPaused = false;
    const playPauseBtn = document.getElementById("playPause");
    if (playPauseBtn) {
      playPauseBtn.textContent = "⏸"; // Update button to show pause symbol
    }
    updateTimeControlUI();
  }
}

// ******  SUN  ******
let sunMat;

const sunSize = 697 / 40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xfff88f,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity,
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xfdffd3, 1200, 400, 1.4);
scene.add(pointLight);

// ******  PLANET CREATION FUNCTION  ******
function createPlanet(
  planetName,
  size,
  position,
  tilt,
  texture,
  bump,
  ring,
  atmosphere,
  moons
) {
  let material;
  if (texture instanceof THREE.Material) {
    material = texture;
  } else if (bump) {
    material = new THREE.MeshPhongMaterial({
      map: loadTexture.load(texture),
      bumpMap: loadTexture.load(bump),
      bumpScale: 0.7,
    });
  } else {
    material = new THREE.MeshPhongMaterial({
      map: loadTexture.load(texture),
    });
  }

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D();
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = (tilt * Math.PI) / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0,
    0, // ax, aY
    position,
    position, // xRadius, yRadius
    0,
    2 * Math.PI, // aStartAngle, aEndAngle
    false, // aClockwise
    0 // aRotation
  );

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.03,
  });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);

  //add ring
  if (ring) {
    const RingGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      30
    );
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide,
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 * Math.PI;
    Ring.rotation.y = (-tilt * Math.PI) / 180;
  }

  //add atmosphere
  if (atmosphere) {
    const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map: loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false,
    });
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial);

    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if (moons) {
    moons.forEach((moon) => {
      let moonMaterial;

      if (moon.bump) {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5,
        });
      } else {
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return { name, planet, planet3d, Atmosphere, moons, planetSystem, Ring };
}

// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(
    path,
    function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
    },
    undefined,
    function (error) {
      console.error("An error happened", error);
    }
  );
}

// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(
  path,
  numberOfAsteroids,
  minOrbitRadius,
  maxOrbitRadius
) {
  const loader = new GLTFLoader();
  loader.load(
    path,
    function (gltf) {
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          for (let i = 0; i < numberOfAsteroids / 12; i++) {
            // Divide by 12 because there are 12 asteroids in the pack
            const asteroid = child.clone();
            const orbitRadius = THREE.MathUtils.randFloat(
              minOrbitRadius,
              maxOrbitRadius
            );
            const angle = Math.random() * Math.PI * 2;
            const x = orbitRadius * Math.cos(angle);
            const y = 0;
            const z = orbitRadius * Math.sin(angle);
            child.receiveShadow = true;
            asteroid.position.set(x, y, z);
            asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
            scene.add(asteroid);
            asteroids.push(asteroid);
          }
        }
      });
    },
    undefined,
    function (error) {
      console.error("An error happened", error);
    }
  );
}

// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `,
});

// ******  MOONS  ******
// Earth
const earthMoon = [
  {
    size: 1.6,
    texture: earthMoonTexture,
    bump: earthMoonBump,
    orbitSpeed: 0.001,
    orbitRadius: 10,
  },
];

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
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
];

// Jupiter
const jupiterMoons = [
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
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet(
  "Mercury",
  2.4,
  40,
  0,
  mercuryTexture,
  mercuryBump
);
const venus = new createPlanet(
  "Venus",
  6.1,
  65,
  3,
  venusTexture,
  venusBump,
  null,
  venusAtmosphere
);
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
const mars = new createPlanet("Mars", 3.4, 115, 25, marsTexture, marsBump);
// Load Mars moons
marsMoons.forEach((moon) => {
  loadObject(moon.modelPath, moon.position, moon.scale, function (loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet(
  "Jupiter",
  69 / 4,
  200,
  3,
  jupiterTexture,
  null,
  null,
  null,
  jupiterMoons
);
const saturn = new createPlanet(
  "Saturn",
  58 / 4,
  270,
  26,
  saturnTexture,
  null,
  {
    innerRadius: 18,
    outerRadius: 29,
    texture: satRingTexture,
  }
);
const uranus = new createPlanet(
  "Uranus",
  25 / 4,
  320,
  82,
  uranusTexture,
  null,
  {
    innerRadius: 6,
    outerRadius: 8,
    texture: uraRingTexture,
  }
);
const neptune = new createPlanet("Neptune", 24 / 4, 340, 28, neptuneTexture);
const pluto = new createPlanet("Pluto", 1, 350, 57, plutoTexture);

// ******  PLANETS DATA  ******
const planetData = {
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

// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet,
  venus.planet,
  venus.Atmosphere,
  earth.planet,
  earth.Atmosphere,
  mars.planet,
  jupiter.planet,
  saturn.planet,
  uranus.planet,
  neptune.planet,
  pluto.planet,
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach((moon) => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach((moon) => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;

function animate() {
  // Update simulation time and time control
  updateSimulationTime();

  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration);
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);

  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration);
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit);

  // Animate Earth's moon
  if (earth.moons) {
    earth.moons.forEach((moon) => {
      const time = performance.now();
      const tiltAngle = (5 * Math.PI) / 180;

      const moonX =
        earth.planet.position.x +
        moon.orbitRadius *
          Math.cos(time * moon.orbitSpeed * settings.accelerationOrbit);
      const moonY =
        moon.orbitRadius *
        Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit) *
        Math.sin(tiltAngle);
      const moonZ =
        earth.planet.position.z +
        moon.orbitRadius *
          Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit) *
          Math.cos(tiltAngle);

      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01 * settings.acceleration);
    });
  }
  // Animate Mars' moons
  if (marsMoons) {
    marsMoons.forEach((moon) => {
      if (moon.mesh) {
        const time = performance.now();

        const moonX =
          mars.planet.position.x +
          moon.orbitRadius *
            Math.cos(time * moon.orbitSpeed * settings.accelerationOrbit);
        const moonY =
          moon.orbitRadius *
          Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit);
        const moonZ =
          mars.planet.position.z +
          moon.orbitRadius *
            Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit);

        moon.mesh.position.set(moonX, moonY, moonZ);
        moon.mesh.rotateY(0.001 * settings.acceleration);
      }
    });
  }

  // Animate Jupiter's moons
  if (jupiter.moons) {
    jupiter.moons.forEach((moon) => {
      const time = performance.now();
      const moonX =
        jupiter.planet.position.x +
        moon.orbitRadius *
          Math.cos(time * moon.orbitSpeed * settings.accelerationOrbit);
      const moonY =
        moon.orbitRadius *
        Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit);
      const moonZ =
        jupiter.planet.position.z +
        moon.orbitRadius *
          Math.sin(time * moon.orbitSpeed * settings.accelerationOrbit);

      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01 * settings.acceleration);
    });
  }

  // Rotate asteroids
  asteroids.forEach((asteroid) => {
    asteroid.rotation.y += 0.0001;
    asteroid.position.x =
      asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) +
      asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
    asteroid.position.z =
      asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) -
      asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
  });

  // ****** OUTLINES ON PLANETS ******
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections
  var intersects = raycaster.intersectObjects(raycastTargets);

  // Reset all outlines
  outlinePass.selectedObjects = [];

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    // If the intersected object is an atmosphere, find the corresponding planet
    if (intersectedObject === earth.Atmosphere) {
      outlinePass.selectedObjects = [earth.planet];
    } else if (intersectedObject === venus.Atmosphere) {
      outlinePass.selectedObjects = [venus.planet];
    } else {
      // For other planets, outline the intersected object itself
      outlinePass.selectedObjects = [intersectedObject];
    }
  }
  // ******  ZOOM IN/OUT  ******
  if (isMovingTowardsPlanet) {
    // Smoothly move the camera towards the target position
    camera.position.lerp(targetCameraPosition, 0.03);

    // Check if the camera is close to the target position
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);
    }
  } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.05);

    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
    }
  }

  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}
loadAsteroids("/asteroids/asteroidPack.glb", 1000, 130, 160);
loadAsteroids("/asteroids/asteroidPack.glb", 3000, 352, 370);

// Initialize the time control system
initTimeControl();

// Initial time display update
updateTimeDisplay();

animate();

window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mousedown", onDocumentMouseDown, false);
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
