// Game data
const runners = {
  1: { id: 'runner-1', lane: 'top-lane', baseSpeed: 1.5, speed: 1.5, currentPosition: 0, isFrozen: false },
  2: { id: 'runner-2', lane: 'center-lane', baseSpeed: 1.5, speed: 1.5, currentPosition: 0, isFrozen: false },
  3: { id: 'runner-3', lane: 'bottom-lane', baseSpeed: 1.5, speed: 1.5, currentPosition: 0, isFrozen: false },
};

const powerUpTypes = ['speed-boost', 'slow-down', 'freeze'];
let isRaceActive = false;
let finishLine = 750;  // Finish line position
const trackTerrain = shuffle(['grass', 'sand', 'asphalt', 'grass', 'sand', 'asphalt', 'grass', 'sand', 'asphalt']); // Randomized terrain layout
const trackWidth = trackTerrain.length * 80; // The track length based on terrain strips

const startButton = document.getElementById("start-btn");
const winnerDiv = document.getElementById("winner");
const track = document.getElementById("track");
const powerUpNotification = document.getElementById("powerup-notification");
const powerUpMessage = document.getElementById("powerup-message");

// Shuffle function for randomizing the terrain
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Generate the track with a randomized terrain layout
function generateTrack() {
  let currentPosition = 0;

  // Create terrain strips based on the randomized terrain layout
  trackTerrain.forEach(terrainType => {
    const terrain = document.createElement('div');
    terrain.classList.add('terrain', terrainType);
    terrain.style.left = `${currentPosition}px`;
    track.appendChild(terrain);
    currentPosition += 80;  // Each terrain strip is 80px wide
  });
}

// Initialize the lanes for runners
function createLanes() {
  const topLane = document.createElement('div');
  topLane.classList.add('lane', 'top-lane');
  track.appendChild(topLane);

  const centerLane = document.createElement('div');
  centerLane.classList.add('lane', 'center-lane');
  track.appendChild(centerLane);

  const bottomLane = document.createElement('div');
  bottomLane.classList.add('lane', 'bottom-lane');
  track.appendChild(bottomLane);
}

// Create runners and place them in their starting positions
function createRunners() {
  Object.values(runners).forEach((runner, index) => {
    const runnerElement = document.createElement('div');
    runnerElement.classList.add('runner');

    // Assign each runner a class for their avatar
    switch (index + 1) {
      case 1:
        runnerElement.classList.add('runner-1'); // Custom avatar for Runner 1
        break;
      case 2:
        runnerElement.classList.add('runner-2'); // Custom avatar for Runner 2
        break;
      case 3:
        runnerElement.classList.add('runner-3'); // Custom avatar for Runner 3
        break;
      default:
        runnerElement.style.backgroundColor = 'red';
    }

    const lane = document.querySelector(`.${runner.lane}`);
    lane.appendChild(runnerElement);

    // Initial placement and styling
    runnerElement.style.left = `${runner.currentPosition}px`;
    runnerElement.style.bottom = (runner.lane === 'bottom-lane') ? '-20px' : 'auto';
    runnerElement.style.top = (runner.lane === 'top-lane') ? '20px' : 'auto';
    runnerElement.style.transform = `translateY(-50%)`;
  });
}

// Start the race when the button is clicked
startButton.addEventListener('click', () => {
  if (isRaceActive) return;
  isRaceActive = true;
  startRace();
  generatePowerUps();  // Start generating power-ups once the race starts
});

// Start race function
function startRace() {
  const raceInterval = setInterval(() => {
    let allFinished = false;

    // Move each runner and check for finish
    Object.values(runners).forEach(runner => {
      if (runner.isFrozen) return; // Skip if the runner is frozen

      // Check if the runner is on their designated terrain
      const runnerElement = document.getElementById(runner.id);
      const currentTerrain = getTerrainAtPosition(runner.currentPosition);

      if (currentTerrain === runner.terrain) {
        runner.speed = runner.baseSpeed * 2;  // Double speed on their terrain
      } else {
        runner.speed = runner.baseSpeed;  // Reset speed if not on their terrain
      }

      runner.currentPosition += runner.speed;
      runnerElement.style.left = `${runner.currentPosition}px`;

      // Check if the runner reached the finish line
      if (runner.currentPosition >= finishLine) {
        winner(runner.id);
        allFinished = true;
      }
    });

    if (allFinished) {
      clearInterval(raceInterval);
    }
  }, 100);
}

// Declare the winner
function winner(runnerId) {
  const runnerNumber = runnerId.split('-')[1];
  winnerDiv.textContent = `Winner: Runner ${runnerNumber}`;
  isRaceActive = false;
}

// Generate random power-ups along the track (in each lane)
function generatePowerUps() {
  const numPowerUps = 5;  // Number of power-ups to create
  for (let i = 0; i < numPowerUps; i++) {
    const powerUp = document.createElement('div');
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const randomLane = ['top-lane', 'center-lane', 'bottom-lane'][Math.floor(Math.random() * 3)]; // Random lane
    const randomPosition = Math.floor(Math.random() * (finishLine - 50)); // Power-ups are positioned before the finish line

    powerUp.classList.add('power-up', randomType);
    powerUp.style.left = `${randomPosition}px`;

    // Set power-up to appear in the correct lane
    const lane = document.querySelector(`.${randomLane}`);
    lane.appendChild(powerUp);

    // Handle power-up collection (triggered when a runner touches the power-up)
    powerUp.addEventListener('click', () => {
      applyPowerUp(randomType, randomPosition, randomLane, powerUp);
    });
  }
}

// Apply power-up effects
function applyPowerUp(type, position, lane, powerUp) {
  Object.values(runners).forEach(runner => {
    if (runner.lane === lane && runner.currentPosition >= position - 20 && runner.currentPosition <= position + 20) {
      switch (type) {
        case 'speed-boost':
          runner.speed += 1;  // Increase speed temporarily
          showPowerUpNotification(`${runner.id} used Speed Boost!`);
          break;
        case 'slow-down':
          runner.speed -= 0.5;  // Decrease speed temporarily
          showPowerUpNotification(`${runner.id} used Slow Down!`);
          break;
        case 'freeze':
          // Freeze all other runners for 2 seconds
          Object.values(runners).forEach(otherRunner => {
            if (otherRunner.id !== runner.id) {
              otherRunner.isFrozen = true;
              setTimeout(() => {
                otherRunner.isFrozen = false;  // Unfreeze after 2 seconds
              }, 2000);
            }
          });
          showPowerUpNotification(`${runner.id} used Freeze Opponents!`);
          break;
      }

      powerUp.remove(); // Remove power-up from the track once collected
    }
  });
}

// Show the power-up notification on the screen
function showPowerUpNotification(message) {
  powerUpMessage.textContent = message;
  powerUpNotification.style.display = 'block';

  // Hide the notification after 3 seconds
  setTimeout(() => {
    powerUpNotification.style.display = 'none';
  }, 3000);
}

// Get terrain at a given position
function getTerrainAtPosition(position) {
  const terrainWidth = 80;  // Each terrain strip width
  const terrainIndex = Math.floor(position / terrainWidth);
  return trackTerrain[terrainIndex % trackTerrain.length];  // Terrain type based on position
}

// Initialize the game
function initializeGame() {
  generateTrack();  // Create the terrain strips on the track
  createLanes();    // Create the lanes
  createRunners();  // Place the runners in their respective lanes
}

initializeGame();
