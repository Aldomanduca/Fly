
import { generateHeight } from './perlin.js'
import { LoadGUI } from './gui.js'
import { planeParams } from './globals.js';

import * as THREEJS from 'three';
import * as THREE_ADDONS from 'three-addons';
const THREE = { ...THREEJS, ...THREE_ADDONS }; // you can also use Object.assign() or lodash's _.assign()

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {

    CSS2DRenderer,
    CSS2DObject

} from 'three/addons/renderers/CSS2DRenderer.js'

let camera, 
    controls, 
    helper,
    labelRenderer, 
    renderer,
    vertices, 
    point,
    labelscene, 
    scene,
    container, 
    stats,
    texture;


const mousePos = new THREE.Vector2();

export let geometry;
export let geometryLoaded;
export let planeMesh = new THREE.Mesh();


let debugBallgroup = new THREE.Group();
let p = document.createElement('div');
let debugTooltip = new CSS2DObject(p);

console.log("MAIN");

init();

LoadGUI();

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize);

animate();




export function init() {

    const canvas = document.getElementById("webgl");

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth - 20, window.innerHeight - 10);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const overlay = document.getElementById("scene");

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth - 20, window.innerHeight - 10);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    overlay.appendChild(labelRenderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 10, 20000);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 100;
    controls.maxDistance = 10000;
    controls.maxPolarAngle = Math.PI / 2;

    controls.target.y = 0;

    camera.position.x = 116;
    camera.position.y = 675;
    camera.position.z = 882;

    controls.update();

    const axesHelper = new THREE.AxesHelper(50);
    axesHelper.position.set(0, 100, 0);
    scene.add(axesHelper);

    let light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1000, 1000, 0);
    light.target.position.set(0, 0, 0);
    light.shadow.mapSize.width = 64
    light.shadow.mapSize.height = 64
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 10000
    light.shadow.camera.left = 600
    light.shadow.camera.right = -600
    light.shadow.camera.top = 600
    light.shadow.camera.bottom = -600
    light.shadow.bias = -0.005; // TODO: Da parametrizzare
    light.castShadow = true;

    const helper = new THREE.CameraHelper(light.shadow.camera)
    scene.add(helper);

    initPlane();

    scene.add(light);
    scene.add(light.target);

    /*
    const geometryHelper = new THREE.ConeGeometry( 20, 100, 3 );
    geometryHelper.translate( 0, 50, 0 );
    geometryHelper.rotateX( Math.PI / 2 );
    helper = new THREE.Mesh( geometryHelper, new THREE.MeshNormalMaterial() );
    scene.add( helper );
    */
}

export function initPlane() {

    scene.remove(planeMesh);
    debugBallgroup.clear();

    console.log("in initplane");

    geometry = new THREE.PlaneGeometry(
        planeParams.planeWidth, 
        planeParams.planeLength, 
        planeParams.xSegments, 
        planeParams.zSegments
        );

    geometry.rotateX(- Math.PI / 2);
    vertices = geometry.attributes.position.array;

    // i vertici funzionano cosi [0] x, [1] y, [2] z, [3] x p2 etc

    point = [];
    let i = 0;

    // Porto tutte le y del piano a 0 e popolo point
    for (let x = 0; x <= planeParams.xSegments; x++) {
        let row = [];
        for (let z = 0; z <= planeParams.zSegments; z++) {
            row.push({
                xPos: vertices[i],
                yPos: 0,                   // Quando genero il piano l'y non è perfettamente 0
                zPos: vertices[i + 2]
            })
            i += 3
        }
        point.push(row);
    }

    // Genero il noise sul piano appiattito
    generateHeight(planeParams.planeWidth, planeParams.planeLength, point, 400);

    // Creo canyon centrale
    for (let x = 0; x <= planeParams.xSegments; x++) {
        for (let z = 0; z <= planeParams.zSegments; z++) {
            if (z == planeParams.zSegments / 2){
                console.log('Azzero il punto ' + x + ' ' + z);
                point[x][z].yPos = 0;
            }
                
        }
    }

    // Inizializzo gruppo di sfere di debug
    if (planeParams.debugBalls) {
        for (let x = 0; x <= planeParams.xSegments; x++) {
            for (let z = 0; z <= planeParams.zSegments; z++) {
                console.log(z);
                let sphereName = 'P[' + x + '][' + z + ']';
                let debugBallMesh = createDebugBall(sphereName, point[x][z].xPos, point[x][z].yPos, point[x][z].zPos);
                debugBallgroup.add(debugBallMesh);
            }
        }
    }

    // Riassegno i punti alla mesh
    i = 0;
    for (let x = 0; x <= planeParams.xSegments; x++) {
        for (let y = 0; y <= planeParams.zSegments; y++) {
            vertices[i] = point[x][y].xPos;
            vertices[i + 1] = point[x][y].yPos;
            vertices[i + 2] = point[x][y].zPos;
            i += 3
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    let material = new THREE.MeshLambertMaterial({
        color: 0x784F20,
        wireframe: planeParams.wireframe
    });

    /*
    texture = new THREE.CanvasTexture( generateTexture( vertices, planeWidth, 200 ) );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    */

    planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.castShadow = true;
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);
    p.textContent = 'INIT';
    p.className = "tooltip";
    scene.add(debugTooltip);
    scene.add(debugBallgroup);

}

function createDebugBall(name, x, y, z) {
    const geo = new THREE.SphereGeometry(5);
    const mat = new THREE.MeshBasicMaterial({ color: 0x3137fd });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.name = name;
    return mesh;
}

function onWindowResize() {

    console.log('onWindowResize');

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(this.window.innerWidth, window.innerHeight);

}

function onMouseMove(e) {

    const mousePosRayCaster = new THREE.Raycaster();
    mousePos.x = (e.offsetX / (renderer.domElement.width / 2)) - 1;
    mousePos.y = ((e.offsetY / (renderer.domElement.height / 2)) - 1) * -1;
    mousePosRayCaster.setFromCamera(mousePos, camera);
    let intersects = mousePosRayCaster.intersectObjects(debugBallgroup.getObjectsByProperty());
    if (intersects.length > 0) {
        let i = Number(intersects[0].object.name.charAt(2));
        let j = Number(intersects[0].object.name.charAt(5));
        p.textContent = 'P [' + i + ' , ' + j + '] \r\n';
        p.textContent += 'xPos: ' + point[i][j].xPos.toFixed(1) + ' \r\n';
        p.textContent += 'yPos: ' + point[i][j].yPos.toFixed(1) + ' \r\n';
        p.textContent += 'zPos: ' + point[i][j].zPos.toFixed(1) + ' \r\n';
        p.className = "tooltip show";
        debugTooltip.position.set(point[i][j].xPos, point[i][j].yPos, point[i][j].zPos);
    } else {
        p.className = "tooltip hide";
    }

}

function generateTexture(data, width, height) {

    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3(0, 0, 0);

    const sun = new THREE.Vector3(100, 1, 1);
    sun.normalize();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

        vector3.x = data[j - 2] - data[j + 2];
        vector3.y = 2;
        vector3.z = data[j - width * 2] - data[j + width * 2];
        vector3.normalize();

        shade = vector3.dot(sun);

        imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
        imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
        imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);

    }

    context.putImageData(image, 0, 0);

    // Scaled 4x

    const canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (let i = 0, l = imageData.length; i < l; i += 4) {

        const v = ~ ~(Math.random() * 5);

        imageData[i] += v;
        imageData[i + 1] += v;
        imageData[i + 2] += v;

    }

    context.putImageData(image, 0, 0);

    return canvasScaled;

}



function animate() {

    requestAnimationFrame(animate);
    render();

}


function render() {

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

}

function onPointerMove(event) {

    pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObject(planeMesh);

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {

        helper.position.set(0, 0, 0);
        helper.lookAt(intersects[0].face.normal);

        helper.position.copy(intersects[0].point);

    }

}