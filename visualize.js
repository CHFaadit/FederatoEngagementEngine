// script.js
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

// script.js

let scene, camera, renderer, nodeMeshes, nodes, edges;
let controls; // OrbitControls for 3D interaction
let mouse = new THREE.Vector2(); // Track mouse position

// Load JSON data
fetch('path_data.json')
  .then(response => response.json())
  .then(data => {
    nodes = [];
    edges = [];

    // Extract unique nodes and edges from the JSON data
    for (let i = 0; i < data.source.length; i++) {
      const source = data.source[i];
      const target = data.target[i];

      if (!nodes.includes(source)) nodes.push(source);
      if (!nodes.includes(target)) nodes.push(target);
      edges.push({ source, target });
    }

    // Enable the Visualize button
    document.getElementById('visualizeBtn').disabled = false;
  })
  .catch(error => console.error('Error loading JSON data:', error));

// Visualize button click handler
document.getElementById('visualizeBtn').addEventListener('click', () => {
  visualizeNetwork(nodes, edges);
  document.getElementById('interactBtn').disabled = false;
  document.getElementById('analyzeBtn').disabled = false;
});

// Function to calculate node degrees
function calculateNodeDegrees(edges) {
  const degrees = {};
  edges.forEach(edge => {
    degrees[edge.source] = (degrees[edge.source] || 0) + 1;
    degrees[edge.target] = (degrees[edge.target] || 0) + 1;
  });
  return degrees;
}

// Function to map degree to a blue color (darker for higher degrees)
function getColorForDegree(degree, maxDegree) {
  // Normalize the degree to a range of 0 to 1
  const normalizedDegree = degree / maxDegree;
  // Map to a blue color range (light blue to dark blue)
  const hue = 0.6; // Blue hue
  const saturation = 1; // Full saturation
  const lightness = 1 - (normalizedDegree * 0.8); // Darker for higher degrees

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
  const m = lightness - c / 2;

  let r, g, b;
  if (hue < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hue < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hue < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hue < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hue < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return new THREE.Color(r / 255, g / 255, b / 255);
}

// Function to create the 3D network visualization
function visualizeNetwork(nodes, edges) {
  // Set up the scene, camera, and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x808080); // Set background to black
  document.getElementById('3d-graph').appendChild(renderer.domElement);

  // Add OrbitControls for 3D interaction
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Add smooth damping
  controls.dampingFactor = 0.05; // Adjust damping strength
  controls.screenSpacePanning = true; // Allow panning
  controls.minDistance = 5; // Minimum zoom distance
  controls.maxDistance = 50; // Maximum zoom distance

  // Create nodes (spheres)
  nodeMeshes = [];
  const nodeDegrees = calculateNodeDegrees(edges); // Calculate node degrees
  const maxDegree = Math.max(...Object.values(nodeDegrees)); // Find the maximum degree

  nodes.forEach((node, index) => {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const degree = nodeDegrees[node] || 0;
    const color = getColorForDegree(degree, maxDegree); // Get color based on degree
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
    sphere.userData = { name: node, degree }; // Store node info
    scene.add(sphere);
    nodeMeshes.push(sphere);
  });

  // Create edges (lines)
  edges.forEach(edge => {
    const sourceNode = nodeMeshes[nodes.indexOf(edge.source)];
    const targetNode = nodeMeshes[nodes.indexOf(edge.target)];
    const geometry = new THREE.BufferGeometry().setFromPoints([sourceNode.position, targetNode.position]);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // White lines for visibility
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  });

  // Position the camera
  camera.position.z = 15;

  // Add lighting to the scene
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Track mouse position
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Click event to show node information
  window.addEventListener('click', () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeMeshes);

    if (intersects.length > 0) {
      const node = intersects[0].object;
      // Update the info-box with node details
      document.getElementById('node-name').textContent = node.userData.name;
      document.getElementById('node-degree').textContent = node.userData.degree;
    } else {
      // Clear the info-box if no node is clicked
      document.getElementById('node-name').textContent = '-';
      document.getElementById('node-degree').textContent = '-';
    }
  });

  // Animation loop
  const animate = function () {
    requestAnimationFrame(animate);

    // Update OrbitControls
    controls.update();

    renderer.render(scene, camera);
  };

  animate();
}

// Function to analyze the network (placeholder for ML integration)
function analyzeNetwork() {
  document.getElementById('output').textContent = 'Analysis: Placeholder for ML model integration.';
}


