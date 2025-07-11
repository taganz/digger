import { blocksH, blocksW, getBlock, tileH, tileW, worldAsArray } from './world.js';
import { collectLemmings } from './lemmings.js';
import { tooltipInfo } from './ui.js';
import { heightOffset } from './main.js';

// Ángulos de rotación para vista isométrica 3D
let rotAngle = Math.PI / 21;               // Ángulo de yaw (rotación alrededor de Z)
let pitchAngle = - Math.PI / 11;  // Ángulo de pitch (inclinación alrededor de X)
let shouldRecalculateDepth = false;

export function getBlocksOrderedByDepth() {
  if (shouldRecalculateDepth) { 
      // Obtiene todos los bloques como un array plano y los ordena por profundidad
      recalculateDepth();
      shouldRecalculateDepth = false;
  }
    let blocks = worldAsArray();           // bloques presentes con depth
    let lems   = collectLemmings();        // vacíos con lemmings + depth
    blocks.sort((a, b) => a.depth - b.depth);
  
    let items = [
      ...blocks.map(b => ({ ...b, type: 'block' })),
      ...lems  .map(l => ({ ...l, type: 'lemming' }))
    ];
    items.sort((a,b) => a.depth - b.depth);

    return items;
}

function recalculateDepth() {
  for (let x = 0; x < blocksW; x++) {
    for (let y = 0; y < blocksW; y++) {
      for (let z = 0; z < blocksH; z++) {
        let block = getBlock(x, y, z);
        if (!block.present) continue;  // solo bloques presentes
        // Proyecta en 3D para obtener profundidad
        const proj = rotate3D(x, y, z);
        const depth = proj.xr + proj.yrp + proj.zp;  
        block.depth = depth;  // Añade la profundidad al bloque
      }
    }
  }
}

export function incRotAngle(angle) {
    rotAngle  += angle;
    rotAngle = constrain(rotAngle, -PI/11, PI/8);
		shouldRecalculateDepth = true;
}

export function incPitchAngle(angle) {
    pitchAngle += angle;
    // opcional: limitar pitchAngle entre [-PI/4, PI/4]
		pitchAngle = constrain(pitchAngle, -PI/8, -PI/20);
		shouldRecalculateDepth = true;
}


// Aplica yaw (rotAngle) y pitch (pitchAngle) a la coordenada (x,y,z)
// Devuelve un objeto con {xr, yr, zp}
export function rotate3D(x, y, z) {
  // 1) rotación yaw alrededor de Z
  let ca = cos(rotAngle), sa = sin(rotAngle);
  let xr = x * ca - y * sa;
  let yr = x * sa + y * ca;

  // 2) rotación pitch alrededor de X (inclinación)
  let cb = cos(pitchAngle), sb = sin(pitchAngle);
  let yrp = yr * cb - z * sb;
  let zp  = yrp * sb + z * cb;

  return { xr: xr, yrp: yrp, zp: zp };
}


// Coordenada de pantalla X para un vértice isométrico (plano X-Y)
export function isoX(x, y) {
  const r = rotate3D(x, y, 0);
  return (r.xr - r.yrp) * tileW / 2;
}


// Coordenada de pantalla Y para un vértice isométrico, considerando altura z
export function isoY(x, y, z) {
  const r = rotate3D(x, y, z);
 //return (r.xr + r.yrp) * tileH / 2 - r.zp * tileH;
 return (r.xr + r.yrp) * tileH / 2 - z * tileH;     // no variar l'alçada segons projeccio?
}



// Dibuja un cuadro de información (tooltip) en pantalla
export function drawTooltip() {
  let info = tooltipInfo;
  let t1 = `Screen: (${info.screenX.toFixed()}, ${info.screenY.toFixed()})`;
  let t2 = info.worldX !== null ?
    `World: (${info.worldX}, ${info.worldY}, ${info.worldZ})` :
    `World: (none)`;

  push();
    translate(-width / 2, -heightOffset);  
    fill(255, 200);
    stroke(0);
    let w = max(textWidth(t1), textWidth(t2)) + 10;
    let h = 36;
    rect(info.screenX + 10, info.screenY + 10, w, h);
    noStroke();
    fill(0);
    textSize(12);
    text(t1, info.screenX + 15, info.screenY + 25);
    text(t2, info.screenX + 15, info.screenY + 40);
  pop();
}
