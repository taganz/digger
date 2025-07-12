import { blocksW, blocksH, getBlock } from './world.js';
import { isoX, isoY } from './render.js';
import { tileH, tileW } from './world.js';
export const MAX_BLOCK_TYPE = 10;

export const DOOR    = 0;
export const WINDOW  = 1;
export const WALL    = 2;
export const CORRIDOR = 3;

let x0, y0, x1, y1, x2, y2, x3, y3;
let xx, yy, zz;
let xw1, yw1, xw2, yw2, xw3, yw3;  // para ventanas y puertas
let xw4, yw4;  // para puertas	


const colorRightWall = "#aaaf";
const strokeRightWall = "#cccf";
const colorLeftWall = "#777f";
const strokeLeftWall ="#888f";

const colorWindowLeft = "#444f";
const strokeWindowLeft = "#555f";
const colorDoorLeft = "#444f";
const strokeDoorLeft = "#555f";

const colorWindowRight = "#777f";
const strokeWindowRight = "#666f";
const colorDoorRight = "#777f";
const strokeDoorRight = "#666f";

const colorCorridorLeft = "#bbbf";
const strokeCorridorLeft = "#555f";
const colorCorridorRight = "#bbbf";
const strokeCorridorRight = "#555f";

const corridorW = 0.10;  // margin from sides
const corridorHTop = 0.10;  // as a percentage of tileH

// window margins 
const windowW = 0.40;
const windowHtop = 0.20;  // as a percentage of tileH
const windowHbottom = 0.60;	// as a percentage of tileH
// door margins 
const doorW = 0.40;
const doorHTop = 0.50;  // as a percentage of tileH


export function drawBlock(b) {
  
	// Cálculo de las cuatro esquinas superiores en pantalla
  x0 = isoX(b.x, b.y);         y0 = isoY(b.x, b.y, b.z);
  x1 = isoX(b.x + 1, b.y);      y1 = isoY(b.x + 1, b.y, b.z);
  x2 = isoX(b.x + 1, b.y + 1);  y2 = isoY(b.x + 1, b.y + 1, b.z);
  x3 = isoX(b.x, b.y + 1);      y3 = isoY(b.x, b.y + 1, b.z);
  xx = b.x; yy = b.y; zz = b.z;
	
	
	drawLeftWall();
	drawRightWall();
	
  switch (b.walls.north) {
		case DOOR:
			drawDoorLeft();
			break;
		case WINDOW:
			drawWindowLeft();
			break;
		case CORRIDOR:
			drawCorridorLeft();
			break;
		case WALL:
			break;
		default: console.log("error drawing block ", b); return;
	}
	  switch (b.walls.east) {
		case DOOR:
			drawDoorRight();
			break;
		case WINDOW:
			drawWindowRight();
			break;
		case CORRIDOR:
			drawCorridorRight();
			break;
		case WALL:
			break;
		default: console.log("error drawing block ", b); return;
	}
	switch (b.walls.up) {
		case DOOR:
			drawTopWall();
			break;
		case WINDOW:
			drawTopWall();
			break;
		case WALL:
			drawTopWall();
			break;
		default: console.log("error drawing block ", b); return;
	}
	
	
	/*
		
    case 0: // Bloque normal
			drawLeftWall();
			drawRightWall();
			drawTopWall();
      break;

    case 1: // Bloque con ventanas izquierda
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawWindowLeft();
			break;

		case 2:// Bloque con ventanas derecha
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawWindowRight();
			break;
			
		case 3:// Bloque con puerta izquierda
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawDoorLeft();
			break;
			
		case 4:// Bloque con puerta derecha
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawDoorRight();
			break;
			
		case 5:// Bloque con puerta derecha y ventana izquierda
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawDoorRight();
			drawWindowLeft();
			break;
			
		case 6:// Bloque con puerta izquierda y ventana derecha
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawDoorLeft();
			drawWindowRight();
			break;
			
		case 7:// Bloque con dos ventanas
			drawLeftWall();
			drawRightWall();
			drawTopWall();
			drawWindowLeft();
			drawWindowRight();
			break;
			
		case 8:// Bloque rampa a derecha
			drawStairsToRight();
			break;
			
		case 9:// Bloque rampa a izquierda
			drawStairsToLeft();
			break;
  }
	
	*/
}

function drawLeftWall() {
	// Cara izquierda (Y-Z)??? ---> jo diria que es XZ
  //fill("#777f");  // tono gris con posible transparencia (verificar soporte)
	// mapea z ∈ [0, size-1] a brillo ∈ [200, 50]
	//let brillo = map(z, 0, blocksH - 1, 50, 150);
	push();

	stroke(strokeLeftWall);
	strokeWeight(1);
	fill(colorLeftWall);        // escala R=G=B según brillo
  quad(
    x3, y3,
    x2, y2,
    x2, y2 + tileH,
    x3, y3 + tileH
  );
	pop();
}

function drawRightWall() {
	push();
  // Cara derecha (X-Z)???? ---> jo diria que es YZ
	fill(colorRightWall);
	stroke(strokeRightWall);
  quad(
    x1, y1,
    x2, y2,
    x2, y2 + tileH,
    x1, y1 + tileH
  );
	pop();
}

function drawTopWall(){
  // Cara superior (X-Y)
	push();
	let brillo = map(zz, 0, blocksH - 1, 100, 230);
	fill(brillo);
	noStroke();
  	quad(x0, y0, x1, y1, x2, y2, x3, y3);
	pop();
}

function drawWindowLeft() {

  xw3 = isoX(xx + windowW, yy+1),			yw3 = isoY(xx+windowW, yy+1, zz);
  xw2 = isoX(xx+1-windowW, yy+1),			yw2 = isoY(xx+1-windowW, yy+1, zz);
  
	push();
	stroke(strokeWindowLeft);
	fill(colorWindowLeft);        
	quad(
    xw3, yw3 + windowHtop * tileH,
    xw2, yw2 + windowHtop * tileH,
    xw2, yw2 + tileH - windowHbottom * tileH, 
    xw3, yw3 + tileH - windowHbottom * tileH
  );
	pop();
	
}
	
function drawWindowRight() {
	
  xw2 = isoX(xx+1, yy+1-windowW),			yw2 = isoY(xx+1, yy+1-windowW, zz);
  xw1 = isoX(xx+1, yy+windowW);      	yw1 = isoY(xx+1, yy+windowW, zz);

	push();
	stroke(strokeWindowRight);
	fill(colorWindowRight);        
	quad(
    xw1, yw1 + windowHtop * tileH,
    xw2, yw2 + windowHtop * tileH,
    xw2, yw2 + tileH - windowHbottom * tileH, 
    xw1, yw1 + tileH - windowHbottom * tileH
  );
	pop();
	
}

function drawDoorLeft() {

  xw3 = isoX(xx + doorW, yy+1),			yw3 = isoY(xx+doorW, yy+1, zz);
  xw2 = isoX(xx+1-doorW, yy+1),			yw2 = isoY(xx+1-doorW, yy+1, zz);
  
	push();
	stroke(strokeDoorLeft);
	fill(colorDoorLeft);      
	quad(
    xw3, yw3 + doorHTop * tileH,
    xw2, yw2 + doorHTop * tileH,
    xw2, yw2 + tileH, 
    xw3, yw3 + tileH
  );
	pop();
	
}
	
function drawDoorRight() {
	
  xw2 = isoX(xx+1, yy+1-doorW),			yw2 = isoY(xx+1, yy+1-doorW, zz);
  xw1 = isoX(xx+1, yy+doorW);      	yw1 = isoY(xx+1, yy+doorW, zz);

	push();
	stroke(strokeDoorRight);
	fill(colorDoorRight);        
	quad(
    xw1, yw1 + doorHTop * tileH,
    xw2, yw2 + doorHTop * tileH,
    xw2, yw2 + tileH, 
    xw1, yw1 + tileH
  );
	pop();
	
}

function drawStairsToRight() {
 	// cara top inclinada
	push();
	noStroke();
	brillo = map(zz, 0, blocksH - 1, 100, 230);
	fill(brillo);
  quad(x0, y0, x1, y1, x2, y2+tileH, x3, y3+tileH);
		
	// cara derecha por debajo
	fill(colorRightWall);
	triangle(x1, y1, x1, y1+tileH, x2, y2+tileH);
	pop();
}

function drawStairsToLeft() {
	push();
	noStroke();
 	// cara top inclinada
	brillo = map(zz, 0, blocksH - 1, 100, 230);
	fill(brillo);
  quad(x0, y0, x1, y1+tileH, x2, y2+tileH, x3, y3);
		
	// cara derecha por debajo
	fill(colorLeftWall);
	triangle(x3, y3, x2, y2+tileH, x3, y3+tileH);
	pop();
}

function drawCorridorLeft() {

  xw3 = isoX(xx + corridorW, yy+1),			yw3 = isoY(xx+corridorW, yy+1, zz);
  xw2 = isoX(xx+1-corridorW, yy+1),			yw2 = isoY(xx+1-corridorW, yy+1, zz);
  
	push();
	stroke(strokeCorridorLeft);
	fill(colorCorridorLeft);      
	quad(
    xw3, yw3 + corridorHTop * tileH,
    xw2, yw2 + corridorHTop * tileH,
    xw2, yw2 + tileH, 
    xw3, yw3 + tileH
  );
	pop();
	
}
	
function drawCorridorRight() {
	
  xw2 = isoX(xx+1, yy+1-corridorW),			yw2 = isoY(xx+1, yy+1-corridorW, zz);
  xw1 = isoX(xx+1, yy+corridorW);      	yw1 = isoY(xx+1, yy+corridorW, zz);

	push();
	stroke(strokeCorridorRight);
	fill(colorCorridorRight);        
	quad(
    xw1, yw1 + corridorHTop * tileH,
    xw2, yw2 + corridorHTop * tileH,
    xw2, yw2 + tileH, 
    xw1, yw1 + tileH
  );
	pop();
	
}


