// The state of the game
let state = {};
// ...

// The canvas element and its drawing context 
const canvas = document.getElementById("game"); 
canvas.width = window.innerWidth; 
canvas.height = window.innerHeight; 
const ctx = canvas.getContext("2d"); 


newGame();

function newGame() {
  // Initialize game state
  state = {
    phase: "aiming",  // aiming | in flight | celebrating
    currentPlayer: 1, 
    book: {
        x: undefined,
        y:undefined,
        velocity: { x:0, y: 0 }, 
    }, 
    buildings: generateBuildings(),
  };

  initializeBookPosition();

	draw();
}

  function generateBuildings() {
		const buildings = [];
		for (let index = 0; index < 8; index++) {
			const previousBuilding = buildings[index - 1];
			
			const x = previousBuilding
				? previousBuilding.x + previousBuilding.width + 4
				: 0;
	
			const minWidth = 80;
			const maxWidth = 130;
			const width = minWidth + Math.random() * (maxWidth - minWidth);
	
			const platformWithGorilla = index === 1 || index === 6;
	
			const minHeight = 100;
			const maxHeight = 350;
			const minHeightGorilla = 30;
			const maxHeightGorilla = 150;
	
			const height = platformWithGorilla
				? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
				: minHeight + Math.random() * (maxHeight - minHeight);
	
			buildings.push({ x, width, height });
		}
		return buildings;
	}
  
  function initializeBookPosition() {
		const building =
    state.currentPlayer === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;

  const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
  const gorillaHandOffsetY = 107;
  
  state.book.x = gorillaX + gorillaHandOffsetX;
  state.book.y = gorillaY + gorillaHandOffsetY;
  state.book.velocity.x = 0;
  state.book.velocity.y = 0;
  }

function draw() {
	ctx.save(); 
  // Flip coordinate system upside down 
  ctx.translate(0, window.innerHeight); 
  ctx.scale(1, -1); 

	// Draw scene 
	drawBackground(); 
	drawBuildings();
	drawGorilla(1);
	drawGorilla(2);
	drawBook();

	// Restore transformation 
ctx.restore(); 
}



function drawBackground() {
  ctx.fillStyle = "#58A8D8";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawBuildings() {
  state.buildings.forEach((building) => {
    ctx.fillStyle = "#152A47";
    ctx.fillRect(building.x, 0, building.width, building.height);
	});

}

function drawGorilla(player) {
	ctx.save();
  const building =
    player === 1
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
  ctx.moveTo(-13, 50);

  if (
    (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
  ) {
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
  ctx.moveTo(+13, 50);

  if (
    (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
  ) {
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
	ctx.fillStyle = "white";
  ctx.beginPath();
	ctx.fillRect(state.book.x, state.book.y, 22, 32)
	ctx.fillStyle = "#7b4818";
	ctx.fillRect(state.book.x, state.book.y, 18, 32)
  // ctx.arc(state.book.x, state.book.y, 10, 0, 2 * Math.PI);
  ctx.fill();
}



// Event handlers
// ...

function throwBook() {
  // ...
}

function animate(timestamp) {
  // ...
}