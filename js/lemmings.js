import { DOOR, WINDOW, WALL, CORRIDOR } from './blocks.js';
import { blocksH, blocksW, getBlock, tileH, tileW} from './world.js';
import { isoX, isoY, rotate3D } from './render.js';


export const LEMMINGS_IN_BLOCK  = 20;
const LEMMINGS_MAX_MOVE  = 5;



// ——— 3) Función de paso: redistribuir lemmings ———
export function stepLemmings() {
  // Creamos una matriz temporal
  let newCounts = Array(blocksW).fill().map(() =>
    Array(blocksW).fill().map(() =>
      Array(blocksH).fill(0)
    )
  );

  // Primero copiamos todos los lemmings
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        newCounts[x][y][z] = getBlock(x, y, z).lemmings;
      }
    }
  }

  // Para cada bloque con lemmings, miramos puertas hacia bloques vacíos
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        let b = getBlock(x, y, z);
        let have = b.lemmings;
        if (have === 0) continue;

        // para cada cara con puerta
        let dirs = [
          { face: 'north', dx:  0, dy:  1, dz: 0 },
          { face: 'south', dx:  0, dy: -1, dz: 0 },
          { face: 'east',  dx:  1, dy:  0, dz: 0 },
          { face: 'west',  dx: -1, dy:  0, dz: 0 },
          { face: 'up',    dx:  0, dy:  0, dz: 1 },
          { face: 'down',  dx:  0, dy:  0, dz: -1 }
        ];
        for (let {face,dx,dy,dz} of dirs) {
          if (b.walls[face] !== DOOR) continue;
          let nx = x + dx, ny = y + dy, nz = z + dz;
          // chequeo límites y bloque vacío (present == false)
          if (
            nx < 0 || nx >= blocksW ||
            ny < 0 || ny >= blocksW ||
            nz < 0 || nz >= blocksH
          ) continue;
          let nb = getBlock(nx, ny, nz);
          if (nb.present) continue;                    // solo vacíos
          let canAccept = LEMMINGS_IN_BLOCK - newCounts[nx][ny][nz];
          if (canAccept <= 0) continue;
          // cuántos movemos
          let move = min(LEMMINGS_MAX_MOVE, have, canAccept);
          newCounts[x][y][z]   -= move;
          newCounts[nx][ny][nz] += move;
          have -= move;
          if (have <= 0) break;
        }
      }
    }
  }

  // Asignamos de vuelta al world
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        getBlock(x,y,z).lemmings = newCounts[x][y][z];
      }
    }
  }
}

export function collectLemmings() {
	  // 2) Crea la lista de lemmings
  let lems = [];
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        let b = getBlock(x, y, z);
        if (!b.present && b.lemmings > 0) {
          // depth igual al del bloque vacío
          let proj = rotate3D(x, y, z);
          let depth = proj.xr + proj.yr + proj.zp;
          lems.push({ x, y, z, depth, count: b.lemmings });
        }
      }
    }
  }
	return lems;
}
export function drawLemmingPoint(lems) {

	push();
	strokeWeight(3);
	let px = isoX(lems.x, lems.y);
	let py = isoY(lems.x, lems.y+1, lems.z) + tileH*random(0.5, 0.8); 
	let pxShadow = isoX(lems.x, lems.y);
	let pyShadow = isoY(lems.x, lems.y+1, lems.z) + tileH; 

	// Dibuja un punto por cada lemming, con desplazamiento aleatorio
	for (let i = 0; i < lems.count; i++) {
		let dx = random(-tileW * 0.3, tileW * 0.3);
		let dy = random(-tileH * 0.3, 0);
		stroke('brown');
		point(px + dx, py + dy);
		stroke('grey');
		point(pxShadow + dx, pyShadow + dy);
	}
	pop();
}

/**
 * Hace que todos los lemmings caigan todo lo posible:
 * si hay un bloque con lemmings y justo debajo está vacío,
 * todos caen a ese bloque vacío. Se repite hasta
 * que ningún lemming pueda caer más.
 */
export function applyGravity() {
  let moved;
  do {
    moved = false;
    for (let x = 0; x < blocksW; x++) {
      for (let y = 0; y < blocksW; y++) {
        for (let z = 1; z < blocksH; z++) {    // z=0 es el suelo
          let b = getBlock(x, y, z);
          let below = getBlock(x, y, z - 1);
          if (b.lemmings > 0 && !below.present) {
            // caen todos los lemmings al bloque de abajo
            below.lemmings += b.lemmings;
            b.lemmings = 0;
            moved = true;
          }
        }
      }
    }
  } while (moved); // repetir hasta que nada se mueva
}