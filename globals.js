import { 
    
    initPlane

} from './main.js';

export let planeParams = {
    planeWidth: 1000,
    planeLength: 1000,
    xSegments: 10,
    zSegments: 10,
    wireframe: false,
    debugBalls: false,
};

export let planeLength = 1000;
export let height = 100;

export let offset;

const riverWidth = 40; // Larghezza fiume centrale in percentuale

export function refreshUI()    {

    // Per la gui fatta in html

    initPlane();
    console.log(offset);
}


export function normalize(val, min, max) {
    return (val - min) / (max - min)
}

export function deNormalize(val, min, max) {
    return ((val * (max - min)) + min)
}

export function isMountain(zIdx, zTotSize) {
  // Calcola se a è nel range min max specificato di b, es se 20 è nel primo 30% di 100
  let limits = getRange();
  let position = (zIdx/zTotSize)*100
  if(position <= limits.min || position >= limits.max)  return true
  return false
}


function getRange(){

    return {
        min : 50 - ( riverWidth / 2 ), 
        max : 50 + ( riverWidth / 2 )
    }

}