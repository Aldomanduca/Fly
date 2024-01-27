import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { initPlane } from './main.js';
import { planeParams } from './globals.js';

console.log("GUI");

export function LoadGUI() {

    let gui = new GUI();

    gui
        .add(planeParams, 'planeWidth', 0, 5000)
        .name('Plane width')
        .onChange((value) => {
            initPlane();
        });

    gui
        .add(planeParams, 'planeLength', 0, 5000)
        .name('Plane length')
        .onChange((value) => {
            initPlane();
        });

    gui
        .add(planeParams, 'xSegments', 0, 64)
        .name('X segments')
        .onChange((value) => {
            initPlane();
        });

    gui
        .add(planeParams, 'zSegments', 0, 64)
        .name('Z segments')
        .onChange((value) => {
            initPlane();
        });

    gui
        .add(planeParams, 'wireframe')
        .name('Wireframe')
        .onChange((value) => {
            initPlane();
        });

    gui
        .add(planeParams, 'debugBalls')
        .name('Debug Balls')
        .onChange((value) => {
            initPlane();
        });


}

