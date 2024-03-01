import {quotesArray} from './quotesArray.js'
import {victoryArray} from './victoryArray.js'

console.log(quotesArray)
// The state of the game

let state = {};

let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;

let previousAnimationTimestamp = undefined;

const blastHoleRadius = 18;

// The canvas element and its drawing context 
const canvas = document.getElementById("game"); 
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
const ctx = canvas.getContext("2d"); 


// Left info panel
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");

// Right info panel
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");

// The book's grab area
const bookGrabAreaDOM = document.getElementById("book-grab-area");

// Congratulations panel
const congratulationsDOM = document.getElementById("congratulations");
const winnerDOM = document.getElementById("winner");
const newGameButtonDOM = document.getElementById("new-game");

newGame();

function newGame() {
  // Initialize game state
  state = {
    phase: "aiming",  // aiming | in flight | celebrating
    currentPlayer: "Ms Bennet", 
    book: {
        x: undefined,
        y:undefined,
        velocity: { x: 0, y: 0 }, 
    }, 
    //Buildings
		backgroundBuildings: [],
		buildings: [],
		blastHoles: [],

		scale: 1,
   
  };

  // Display initial greeting
  initialGreeting()

	 // Generate background buildings
	 for (let i = 0; i < 11; i++) {
    generateBackgroundBuilding(i);
  }

  // Generate buildings
  for (let i = 0; i < 8; i++) {
    generateBuilding(i);
  }
	calculateScale();

  initializeBookPosition();

  // Reset HTML elements
  congratulationsDOM.style.visibility = "hidden";
  angle1DOM.innerText = 0;
  velocity1DOM.innerText = 0;
  angle2DOM.innerText = 0;
  velocity2DOM.innerText = 0;

	draw();
}

function generateBackgroundBuilding(index) {
  const previousBuilding = state.backgroundBuildings[index - 1];

  const x = previousBuilding
    ? previousBuilding.x + previousBuilding.width + 4
    : -30;

  const minWidth = 60;
  const maxWidth = 110;
  const width = minWidth + Math.random() * (maxWidth - minWidth);

  const minHeight = 80;
  const maxHeight = 350;
  const height = minHeight + Math.random() * (maxHeight - minHeight);

  state.backgroundBuildings.push({ x, width, height });
}

function generateBuilding(index) {
  const previousBuilding = state.buildings[index - 1];

  const x = previousBuilding
    ? previousBuilding.x + previousBuilding.width + 4
    : 0;

  const minWidth = 80;
  const maxWidth = 130;
  const width = minWidth + Math.random() * (maxWidth - minWidth);

  const platformWithGorilla = index === 1 || index === 6;

  const minHeight = 100;
  const maxHeight = 500;
  const minHeightGorilla = 150;
  const maxHeightGorilla = 300;

  const height = platformWithGorilla
    ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
    : minHeight + Math.random() * (maxHeight - minHeight);

  // Generate an array of booleans to show if the light is on or off in a room
  const lightsOn = [];
  for (let i = 0; i < 50; i++) {
    const light = Math.random() <= 0.33 ? true : false;
    lightsOn.push(light);
  }

  state.buildings.push({ x, width, height, lightsOn });
}

	function calculateScale() {
		const lastBuilding = state.buildings.at(-1);
		const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;
		
		state.scale = window.innerWidth / totalWidthOfTheCity;
	}

	window.addEventListener("resize", () => {
		location.reload()
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		calculateScale();
		initializeBookPosition();
		draw();
	});
  
  function initializeBookPosition() {
		const building =
    state.currentPlayer === "Ms Bennet"
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;

  const gorillaHandOffsetX = state.currentPlayer === "Ms Bennet" ? -28 : 28;
  const gorillaHandOffsetY = 107;
  
  state.book.x = gorillaX + gorillaHandOffsetX;
  state.book.y = gorillaY + gorillaHandOffsetY;
  state.book.velocity.x = 0;
  state.book.velocity.y = 0;
	state.book.rotation = 0;

	  // Initialize the position of the grab area in HTML
		const grabAreaRadius = 5;
		const grabAreaRadius2 = 10
		const left = state.book.x * state.scale - grabAreaRadius2;
		const bottom = state.book.y * state.scale - grabAreaRadius;
		bookGrabAreaDOM.style.left = `${left}px`;
		bookGrabAreaDOM.style.bottom = `${bottom}px`;
  }

function draw() {
	ctx.save(); 

  // Flip coordinate system upside down 
  ctx.translate(0, window.innerHeight); 
  ctx.scale(1, -1); 
	ctx.scale(state.scale, state.scale);

	// Draw scene 
	drawBackground(); 
	drawBackgroundBuildings();
  drawBuildingsWithBlastHoles();
	drawGorilla("Ms Bennet");
	drawGorilla("Mr. Darcy");
	drawBook();

	// Restore transformation 
	ctx.restore(); 
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    window.innerHeight / state.scale
  );
  gradient.addColorStop(1, "#311b92");
  gradient.addColorStop(0, "#FFC28E");

  // Draw sky
  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    0,
    window.innerWidth / state.scale,
    window.innerHeight / state.scale
  );

  // Draw moon
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(300, 350, 60, 0, 2 * Math.PI);
  ctx.fill();
}

function drawBackgroundBuildings() {
  state.backgroundBuildings.forEach((building) => {
    ctx.fillStyle = "#947285";
    ctx.fillRect(building.x, 0, building.width, building.height);
  });
}

function drawBuildingsWithBlastHoles() {
  ctx.save();

  state.blastHoles.forEach((blastHole) => {
    ctx.beginPath();

    // Outer shape clockwise
    ctx.rect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    );

    // Inner shape counterclockwise
    ctx.arc(blastHole.x, blastHole.y, blastHoleRadius, 0, 2 * Math.PI, true);

    ctx.clip();
  });

  drawBuildings();

  ctx.restore();
}

function drawBuildings() {
  state.buildings.forEach((building) => {
    // Draw building
    ctx.fillStyle = "#4A3C68";
    ctx.fillRect(building.x, 0, building.width, building.height);

    // Draw windows
    const windowWidth = 10;
    const windowHeight = 12;
    const gap = 15;

    const numberOfFloors = Math.ceil(
      (building.height - gap) / (windowHeight + gap)
    );
    const numberOfRoomsPerFloor = Math.floor(
      (building.width - gap) / (windowWidth + gap)
    );

    for (let floor = 0; floor < numberOfFloors; floor++) {
      for (let room = 0; room < numberOfRoomsPerFloor; room++) {
        if (building.lightsOn[floor * numberOfRoomsPerFloor + room]) {
          ctx.save();

          ctx.translate(building.x + gap, building.height - gap);
          ctx.scale(1, -1);

          const x = room * (windowWidth + gap);
          const y = floor * (windowHeight + gap);

          ctx.fillStyle = "#EBB6A2";
          ctx.fillRect(x, y, windowWidth, windowHeight);

          ctx.restore();
        }
      }
    }
  });
}

function drawGorilla(player) {
	ctx.save();
  const building =
    player === "Ms Bennet"
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  ctx.translate(building.x + building.width / 2, building.height);

  drawGorillaBody();
  drawGorillaLeftArm(player);
  drawGorillaRightArm(player);
  drawGorillaFace();
  
  ctx.restore();
}

function drawGorillaBody() {
	ctx.fillStyle = "black";
    
  ctx.beginPath(); 
  
  // Starting Position
  ctx.moveTo(0, 15); 
    
  // Left Leg
  ctx.lineTo(-7, 0);
  ctx.lineTo(-20, 0); 
    
  // Main Body
  ctx.lineTo(-13, 77);
  ctx.lineTo(0, 84);
  ctx.lineTo(13, 77); 
  
  // Right Leg
  ctx.lineTo(20, 0);
  ctx.lineTo(7, 0);
  
  ctx.fill();
}

function drawGorillaLeftArm(player) {
	ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(-14, 50);

	if (state.phase === "aiming" && state.currentPlayer === "Ms Bennet" && player === "Ms Bennet") {
    ctx.quadraticCurveTo(
      -44,
      63,
      -28 - state.book.velocity.x / 6.25,
      107 - state.book.velocity.y / 6.25
    );
  } else if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.quadraticCurveTo(-44, 63, -28, 107);
  } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12);
  }

  ctx.stroke();
}

function drawGorillaRightArm(player) {
	ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(+14, 50);

	if (state.phase === "aiming" && state.currentPlayer === "Mr. Darcy" && player === "Mr. Darcy") {
    ctx.quadraticCurveTo(
      +44,
      63,
      +28 - state.book.velocity.x / 6.25,
      107 - state.book.velocity.y / 6.25
    );
  } else if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.quadraticCurveTo(+44, 63, +28, 107);
  } else {
    ctx.quadraticCurveTo(+44, 45, +28, 12);
  }
  
  ctx.stroke();
}

function drawGorillaFace() {
	ctx.strokeStyle = "lightgray";
  ctx.lineWidth = 3;
  
  ctx.beginPath();

  // Left Eye
  ctx.moveTo(-5, 70);
  ctx.lineTo(-2, 70);

  // Right Eye
  ctx.moveTo(2, 70);
  ctx.lineTo(5, 70);

  // Mouth
  ctx.moveTo(-5, 62);
  ctx.lineTo(5, 62);

  ctx.stroke();
}

function drawBook() {
	ctx.save();
	ctx.translate(state.book.x, state.book.y)

	if (state.phase === "aiming") {

		//Move the book with the mouse while aiming
		ctx.translate(-state.book.velocity.x / 6.25, -state.book.velocity.y / 6.25);
	
	 	// Draw throwing trajectory
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      state.book.velocity.x,
			state.book.velocity.y
    );
    ctx.stroke();
  

		//Draw book graphic
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.fillRect(0, 0, 22, 32)
		ctx.fillStyle = "#7b4818";
		ctx.fillRect(0, 0, 18, 32)
  	// ctx.arc(state.book.x, state.book.y, 10, 0, 2 * Math.PI);
  	ctx.fill();
		}
		else if (state.phase === "in flight") {
			//draw rotating book in flight
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.rotate(state.book.rotation);
			ctx.fillRect(0, 0, 22, 32)
			ctx.fillStyle = "#7b4818";
			ctx.fillRect(0, 0, 18, 32)
			ctx.fill();
		} 
		else {
			//Draw book graphic
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.fillRect(0, 0, 22, 32)
			ctx.fillStyle = "#7b4818";
			ctx.fillRect(0, 0, 18, 32)
			ctx.fill();
		}

	// Restore transformation
	ctx.restore();
}

// Event handlers
bookGrabAreaDOM.addEventListener("mousedown", function (e) {
  if (state.phase === "aiming") {
    isDragging = true;

    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    document.body.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", function (e) {
  if (isDragging) {
    let deltaX = e.clientX - dragStartX;
    let deltaY = e.clientY - dragStartY;

    state.book.velocity.x = -deltaX;
    state.book.velocity.y = +deltaY;
    setInfo(deltaX, deltaY);

    draw();
  }
});

function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angleInRadians = Math.asin(deltaY / hypotenuse);
  const angleInDegrees = (angleInRadians / Math.PI) * 180;
  
  if (state.currentPlayer === "Ms Bennet") {
    angle1DOM.innerText = Math.round(angleInDegrees);
    velocity1DOM.innerText = Math.round(hypotenuse);
  } else {
    angle2DOM.innerText = Math.round(angleInDegrees);
    velocity2DOM.innerText = Math.round(hypotenuse);
  }
}

window.addEventListener("mouseup", function () {
  if (isDragging) {
    isDragging = false;

    document.body.style.cursor = "default";
    
    throwBook();
  }
});

function throwBook() {
  state.phase = "in flight";
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (previousAnimationTimestamp === undefined) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }

  const elapsedTime = timestamp - previousAnimationTimestamp;

	moveBook(elapsedTime); 

  // const hitDetectionPrecision = 10;
  // for (let i = 0; i < hitDetectionPrecision; i++) {
  //   moveBook(elapsedTime / hitDetectionPrecision);

    // Hit detection
    const miss = checkFrameHit() || checkBuildingHit();
    const hit = checkGorillaHit(); //Book hit the enemy 

    // Handle the case when we hit a building or the book got off-screen
    if (miss) {
      generateQuote()
      state.currentPlayer = state.currentPlayer === "Ms Bennet" ? "Mr. Darcy" : "Ms Bennet"; // Switch players
      state.phase = "aiming";
      initializeBookPosition();

      draw();
      return;
    }

    // Handle the case when we hit the enemy
    if (hit) {
      state.phase = "celebrating";
      finalMessage()
      announceWinner();

      draw();
      return;
    }

  draw();

  // Continue the animation loop
  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(animate);
}

function moveBook(elapsedTime) {
  const multiplier = elapsedTime / 200;

  // Adjust trajectory by gravity
  state.book.velocity.y -= 20 * multiplier;

  // Calculate new position
  state.book.x += state.book.velocity.x * multiplier;
  state.book.y += state.book.velocity.y * multiplier;

	//Rotate according to the direction
	const direction = state.currentPlayer === "Ms Bennet" ? -1 : +1;
	state.book.rotation += direction * multiplier;
}

function checkFrameHit() {
  if (
    state.book.y < 0 ||
    state.book.x < 0 ||
    state.book.x > window.innerWidth / state.scale
  ) {
    return true; // The book is off-screen
  }
}

function checkBuildingHit() {
  for (let i = 0; i < state.buildings.length; i++) {
    const building = state.buildings[i];
    if (
      state.book.x + 4 > building.x &&
      state.book.x - 4 < building.x + building.width &&
      state.book.y - 4 < 0 + building.height
    ) {
			state.blastHoles.push({ x: state.book.x, y: state.book.y });
      return true; // Building hit
    }
  }
}

function checkGorillaHit() {
  const enemyPlayer = state.currentPlayer === "Ms Bennet" ? "Mr. Darcy" : "Ms Bennet";
  const enemyBuilding =
    enemyPlayer === "Ms Bennet"
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  ctx.save();

  ctx.translate(
    enemyBuilding.x + enemyBuilding.width / 2,
    enemyBuilding.height
  );

  drawGorillaBody();
  let hit = ctx.isPointInPath(state.book.x, state.book.y);

  drawGorillaLeftArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.book, state.book.y);

  drawGorillaRightArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.book.x, state.book.y);

  ctx.restore();

  return hit;
}

function announceWinner() {
  winnerDOM.innerText = `${state.currentPlayer}`;
  congratulationsDOM.style.visibility = "visible";
}

function initialGreeting() {
  document.getElementById("quotes").innerHTML = "Welcome to the Gorilla War of Words!"
  document.getElementById("author").innerHTML = "Ms Bennet and Mr. Darcy are two literary gorillas in a battle of the books! Click and drag on the book with your mouse to aim. Release click to throw the book. First gorilla to hit the other wins!";
}
function generateQuote() {
	
  const quotes = quotesArray

let arrayIndex = Math.floor(Math.random() * quotes.length);
document.getElementById("quotes").innerHTML = quotes[arrayIndex].quote;
document.getElementById("author").innerHTML = quotes[arrayIndex].author;
}

function finalMessage() {

  const victoryQuotes = victoryArray

  let arrayIndex = Math.floor(Math.random() * victoryQuotes.length);
  document.getElementById("quotes").innerHTML = victoryQuotes[arrayIndex].quote;
  document.getElementById("author").innerHTML = victoryQuotes[arrayIndex].author
}



newGameButtonDOM.addEventListener("click", newGame);