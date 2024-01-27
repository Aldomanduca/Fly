
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import { 
    
    planeParams ,
    normalize ,
    deNormalize,
    offset
    
} from './globals.js';

console.log("PERLIN");


export function generateHeight(width, length, pointList, entity) {

    const perlin = new ImprovedNoise();
    var p5_ = new p5();

    let minX = Infinity
    let maxX = - Infinity
    let minZ = Infinity
    let maxZ = -Infinity

    // Cerco massimi e minimi per la normalizzazione

    for( let x = 0; x <= planeParams.xSegments; x++){
        for( let y = 0; y <= planeParams.zSegments; y++){
            
            if(pointList[x][y].xPos > maxX){
                maxX = pointList[x][y].xPos
            }
                
            if(pointList[x][y].xPos < minX){
                minX = pointList[x][y].xPos
            }
                
            if(pointList[x][y].zPos > maxZ){
                maxZ = pointList[x][y].zPos
            }
                
            if(pointList[x][y].zPos < minZ){
                minZ = pointList[x][y].zPos
            }

        }        
    }

    //console.log(minX)
    //console.log(maxX)
    //console.log(minZ)
    //console.log(maxZ)

    for (let x = 0; x <= planeParams.xSegments; x++) {

        for (let y = 0; y <= planeParams.zSegments; y++) {

            //console.log('x = ' + x + ' y = ' + y + ' pointList[x][y].xPos = ' + pointList[x][y].xPos)
            /*
            let xNorm = normalize(pointList[x][y].xPos, minX, maxX)
            let zNorm = normalize(pointList[x][y].zPos, minZ, maxZ)

            let yNorm = (Math.abs(perlin.noise(xNorm, 0, zNorm)))
            
            pointList[x][y].xPos = deNormalize(xNorm, minX, maxX)
            pointList[x][y].yPos = deNormalize(yNorm, 0, entity)
            pointList[x][y].zPos = deNormalize(zNorm, minZ, maxZ)
            */
            p5_.noiseDetail(0.01, 0.01)
            let yNorm = (Math.abs(p5_.noise(pointList[x][y].xPos, pointList[x][y].zPos)))
            //console.log(yNorm);
            pointList[x][y].yPos = deNormalize(yNorm, 0, entity)
            //console.log(pointList[x][y].yPos);
        }

    }
    


    //return pointList

}

