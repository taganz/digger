import { rotate3D, isoX, isoY } from './render.js';
import { MAX_BLOCK_TYPE } from './blocks.js';
import { DOOR, WINDOW, WALL, CORRIDOR } from './blocks.js';
import { LEMMINGS_IN_BLOCK } from './lemmings.js';
//import { pointInPoly } from './poly.js';

// ——— Constantes ———
const DIR_X   = 0;
const DIR_Y   = 1;
const DIR_Z   = 2;



// Matriz tridimensional que almacena la presencia de bloques en cada coordenada (x,y,z)
let world = [];
export const blocksW = 20;   // 20     // Tamaño de la cuadrícula en cada eje 
export const blocksH = 7;    // 7    // Tamaño de la cuadrícula en cada eje 
export const tileW = 100;       // Anchura base de un bloque en píxeles (eje X-Y)
export const tileH = 50;       // Altura base de un bloque en píxeles (eje X-Y)
const LEVEL_MIN_GALLERIES = 4;
const LEVEL_MAX_GALLERIES = 10;
const GALLERY_MIN_LEN = 3;  // Longitud minima de una galeria
const GALLERY_MAX_LEN = 10;

export function getBlock(x, y, z){
	return world[x][y][z];
}


export function initWorld() {
  // 1) Crea todos los bloques “normales”
  for (let x = 0; x < blocksW; x++) {
    world[x] = [];
    for (let y = 0; y < blocksW; y++) {
      world[x][y] = [];
      for (let z = 0; z < blocksH; z++) {
        world[x][y][z] = {  
          x: x, y: y, z: z,  // coordenadas del bloque
          present: true,           // hay bloque
          // type queda reservado para tu lógica previa
          type: int(random(0, MAX_BLOCK_TYPE)),
          // inicializamos caras por defecto como muros
          walls: {
            north: WALL,
            south: WALL,
            east:  WALL,
            west:  WALL,
            up:    WALL,
            down:  WALL
          },
				lemmings: 0    // <— inicialmente vacío
        };
      }
    }
  }

  // 2) Por cada planta z, genera 1–3 galerías aleatorias
  for (let z = 0; z < blocksH; z++) {
    let nGalleries = int(random(LEVEL_MIN_GALLERIES, LEVEL_MAX_GALLERIES));
    for (let i = 0; i < nGalleries; i++) {
      // elige dirección y longitud
      let dir = random([DIR_X, DIR_Y]);
      // longitud mínima 3, máxima que quepa en ese eje
      let maxLen = min((dir === DIR_Z ? blocksH : blocksW), GALLERY_MAX_LEN);
      let length = int(random(GALLERY_MIN_LEN, maxLen + 1));

      // punto de inicio aleatorio, garantizando que no se salga
      let sx = (dir === DIR_X)
               ? int(random(0, blocksW - length + 1))
               : int(random(0, blocksW));
      let sy = (dir === DIR_Y)
               ? int(random(0, blocksW - length + 1))
               : int(random(0, blocksW));
      let sz = (dir === DIR_Z)
               ? int(random(0, blocksH - length + 1))
               : z;

      // tallamos la galería
      generateGallery(sx, sy, sz, dir, length);
    }
  }
}

/**
 * Añade una galería en línea:
 * - Puertas en los dos extremos (según dir)
 * - Ventanas en los lados laterales
 * - Muros en suelo y techo
 * Direccion puede ser DIR_X o DIR_Y
 */
function generateGallery(x, y, z, dir, length) {
  for (let i = 0; i < length; i++) {
    let xi = x + (dir === DIR_X ? i : 0);
    let yi = y + (dir === DIR_Y ? i : 0);
    //let zi = z + (dir === DIR_Z ? i : 0);

    //let block = world[xi][yi][zi];
    let block = world[xi][yi][z];
    block.present = true;    // aseguramos que exista
    // restablecemos las caras a ventanas o muros
    block.walls.north = WINDOW;
    block.walls.south = WINDOW;
    block.walls.east  = WINDOW;
    block.walls.west  = WINDOW;
    block.walls.up    = WALL;
    block.walls.down  = WALL;

    // extremos → puertas
    if (i === 0) {
      if (dir === DIR_X) block.walls.west  = DOOR; 
      if (dir === DIR_Y) block.walls.south = DOOR;
     // if (dir === DIR_Z) block.walls.down  = DOOR;
    }
    else if (i === length - 1) {
      if (dir === DIR_X) block.walls.east = DOOR;
      if (dir === DIR_Y) block.walls.north = DOOR;
     // if (dir === DIR_Z) block.walls.up = DOOR;
    }
		else {
			if (dir === DIR_X) {
					block.walls.east = CORRIDOR;
				  block.walls.west = CORRIDOR;
			}
      if (dir === DIR_Y) {
				block.walls.north = CORRIDOR;
				block.walls.south = CORRIDOR;
			}
		}
		block.lemmings = LEMMINGS_IN_BLOCK;
  }
}

// Convierte la matriz 3D `world` en un array de bloques con profundidad calculada
export function worldAsArray() {
  let blocks = [];
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        const block = getBlock(x, y, z);
        if (!block || !block.present) continue;  // solo bloques presentes
        // Proyecta en 3D para obtener profundidad
        //const proj = rotate3D(x, y, z);
        //const depth = proj.xr + proj.yr + proj.zp;  
        blocks.push(block);
      }
    }
  }
  return blocks;
}




/**
 * Crea un cráter continuo en `world`:
 * - En la superficie (z = blocksH-1) tiene radio `maxRadius`.
 * - Va estrechándose linealmente hasta nivel 0.
 *
 * @param {number} cx         Centro X del cráter (0..blocksW-1)
 * @param {number} cy         Centro Y del cráter (0..blocksW-1)
 * @param {number} maxRadius  Radio máximo en superficie (en celdas)
 * @param {number} depthLevels  Nº de niveles de profundidad (≤ blocksH)
 */
export function carveCrater(cx, cy, maxRadius, depthLevels) {
  // Limitar que no sobrepase el número de capas disponibles
  depthLevels = constrain(depthLevels, 1, blocksH);

  // Desde la superficie hacia abajo
  for (let level = 0; level < depthLevels; level++) {
    // Nivel z correspondiente (superficie en blocksH-1)
    let z = blocksH - 1 - level;

    // Radio que decrece linealmente: map(level=0→maxRadius, level=depthLevels-1→0)
    let radius = map(level, 0, depthLevels - 1, maxRadius, 0);

    // Recorremos toda la capa z
    for (let x = 0; x < blocksW; x++) {
      for (let y = 0; y < blocksW; y++) {
        // Distancia al centro del cráter
        let d = dist(x + 0.5, y + 0.5, cx, cy);
        // Si está dentro del radio, vaciamos (¡sin excepciones!)
        if (d <= radius) {
          getBlock(x,y,z).present = false;
        }
      }
    }
  }
}



