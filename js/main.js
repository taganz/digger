
import { initWorld, carveCrater, worldAsArray } from './world.js';
import { drawBlock } from './blocks.js';
import { drawLemmingPoint, collectLemmings, applyGravity, stepLemmings } from './lemmings.js'; 
import { drawTooltip, getBlocksOrderedByDepth } from './render.js';
import { mousePressed, mouseDragged} from './ui.js';
import { keyPressed, keyReleased, tooltipActive, tooltipInfo } from './ui.js';
import { blocksH, blocksW } from './world.js';

export let cnv; // p5.js canvas element

const LEMMINGS_ACTIVE = false;
// Variables para la interacción y HUD

//export let shouldRecalculateDepth = true;



// draw
export let heightOffset;

function setup() {
  createCanvasAdaptedToWindow();
  initWorld();                // Inicializa la matriz `world` con bloques aleatorios
	carveCrater(int(blocksW/2), int(blocksW/2), int(random(blocksW/6, blocksW/3)), int(random(blocksH/2, blocksH)));
	
	// Prevent right-click menu
  let cnv2 = document.querySelector('canvas');   // cnv es un p5.Element
  cnv2.addEventListener('contextmenu', e => e.preventDefault());
}


function draw() {
	
  background(220);           // Fondo gris claro
	//noStroke();
	stroke(215);

  // Centra el sistema de coordenadas en la pantalla
	heightOffset = 100;
  translate(width / 2, heightOffset);

	
	if (frameCount % 30 === 0) {
		// 0) Gravedad: que todos los lemmings caigan a huecos debajo
		applyGravity();
		// 1) Redistribución a través de puertas
		stepLemmings();
	}
	

	
  let items = getBlocksOrderedByDepth();

  // 3) Pinta todo en orden
  for (let it of items) {
    if (it.type === 'block') {
      drawBlock(it.x, it.y, it.z, it.blockType);
    } else {
			if (LEMMINGS_ACTIVE) {
      	drawLemmingPoint(it);
			}
    }
  }
	
  // Si hay tooltip activo, se dibuja por encima de todo
  if (tooltipActive && tooltipInfo) {
    drawTooltip();
  }
}

function createCanvasAdaptedToWindow() {
  let canvasWidth = min(800, windowWidth);
  let canvasHeight = min(600, windowHeight);
  console.log(`canvas created: ${canvasWidth}x${canvasHeight}`);
  cnv = createCanvas(canvasWidth, canvasHeight);
  //resetCamera();
}

function windowResized() {
  let canvasWidth = min(800, windowWidth);
  let canvasHeight = min(600, windowHeight);
  console.log(`canvas resized: ${canvasWidth}x${canvasHeight}`);
  resizeCanvas(canvasWidth, canvasHeight);
}


window.setup        = setup;
window.draw         = draw;
window.windowResized  = windowResized;
window.mousePressed = mousePressed;
//window.mouseReleased = mouseReleased;
window.mouseDragged = mouseDragged;
//window.mouseWheel   = mouseWheel;
window.keyPressed   = keyPressed;
window.keyReleased  = keyReleased;
//window.touchStarted = touchStarted;
//window.touchMoved = touchMoved;
//window.touchEnded = touchEnded;


