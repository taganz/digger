import { initWorld, carveCrater, blocksH, blocksW } from './world.js';
import {getBlockUnderMouse} from './render.js';
import { heightOffset } from './main.js';
import { incPitchAngle, incRotAngle, isoX, isoY, rotate3D } from './render.js';
import { MAX_BLOCK_TYPE}  from './blocks.js'; 
export let tooltipActive = false;
export let tooltipInfo = null;  

// Manejo de clics: elimina el bloque bajo el cursor si existe
export function mousePressed() {
  const mx = mouseX - width / 2;  // DESPLAZAMIENTO: restar translate() en X
  const my = mouseY - heightOffset;        
  const block = getBlockUnderMouse(mx, my);
	if (!block) {
  	return;
	}
	
  
	if (mouseButton === LEFT) {
    block.present = false;
  }
  else if (mouseButton === RIGHT) {
    // cicla tipo: 0 → 1 → 2 → 0 …
    block.type = (block.type + 1) % MAX_BLOCK_TYPE;    // <----- posar escales
  }
  loop();
}


// Arrastrar para rotar vista
export function mouseDragged() {
  if (mouseButton === LEFT) {
    incRotAngle((mouseX - pmouseX) * 0.0005);   // yaw
    incPitchAngle((mouseY - pmouseY) * 0.0005);  // pitch
  }
}


// Tecla Q muestra información del bloque bajo el cursor
export function keyPressed() {
  if (key === 'q' || key === 'Q') {
    const sx = mouseX, sy = mouseY;
    const mx = sx - width / 2, my = sy - heightOffset;  
    const block = getBlockUnderMouse(mx, my);
    tooltipInfo = block
      ? { screenX: sx, screenY: sy, worldX: block.x, worldY: block.y, worldZ: block.z }
      : { screenX: sx, screenY: sy, worldX: null, worldY: null, worldZ: null };
    tooltipActive = true;
  }
	if (key === "1") {
		initWorld();
	}
	if (key === "2") {
		initWorld();
		carveCrater(int(blocksW/2), int(blocksW/2), 3, 3);
	}
	if (key === "3") {
		initWorld();
		carveCrater(int(blocksW/2), int(blocksW/2), 5, 5);
	}
	if (key === "4") {
		initWorld();
		carveCrater(int(blocksW/2), int(blocksW/2), 7, 7);
	}
}


// Desactiva tooltip al soltar Q
export function keyReleased() {
  if (key === 'q' || key === 'Q') {
    tooltipActive = false;
  }
}
