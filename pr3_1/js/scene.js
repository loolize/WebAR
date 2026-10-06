import * as THREE from "three";

import {RGBELoader} from "three/addons/loaders/RGBELoader.js";

import {ObjectManager} from "./object.js";

import {ButtonsManager} from "./buttons.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    70, window.innerWidth/window.innerHeight, 0.01, 20
);
const renderer = new THREE.WebGLRenderer({
        alpha: true, antialias: true
    });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local-floor");
document.body.appendChild(renderer.domElement);



// HDRI
const hdrLoader = new RGBELoader();

const hdrTexture =
    await hdrLoader.loadAsync("./assets/interior.hdr");


// панорамная карта окружения
hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

// HDRI для света и отражений
scene.environment = hdrTexture;



// объект
const objectManager = new ObjectManager(scene);


// кнопки управления
new ButtonsManager(objectManager);



// маркер найденной поверхности
const reticle =
    new THREE.Mesh(

        new THREE.SphereGeometry(0.02, 16,  16),

        new THREE.MeshBasicMaterial({color: 0xffffff
        })

    );


// положение задается hit-test
reticle.matrixAutoUpdate = false;

// изначально скрыт
reticle.visible = false;

scene.add(reticle);



// контроллер для нажатия
const controller = renderer.xr.getController(0);

controller.addEventListener(
    "select",
    placeObject
);

scene.add(controller);



// переменные hit-test
let hitTestSource = null;
let viewerSpace = null;
let referenceSpace = null;



// запуск AR
async function startAR() {

    const session = await navigator.xr.requestSession(
            "immersive-ar",
            {
                requiredFeatures: [
                    "hit-test", "local-floor"
                ],

                // HTML интерфейс поверх AR
                optionalFeatures: [
                    "dom-overlay"
                ],

                domOverlay: {
                    root: document.body
                }
            }

        );


    // подключаем сессию к Three.js
    await renderer.xr.setSession(session);


    // координаты относительно камеры
    viewerSpace = await session.requestReferenceSpace(
            "viewer"
        );


    // координаты относительно пола
    referenceSpace = await session.requestReferenceSpace(
            "local-floor"
        );


    // источник hit-test
    hitTestSource = await session.requestHitTestSource({
            space: viewerSpace
        });


    // скрываем кнопку запуска
    document
        .getElementById("arButton")
        .style.display = "none";


    // запускаем отрисовку
    renderer.setAnimationLoop(render);
}



// кнопка запуска AR
document
    .getElementById("arButton")
    .addEventListener(
        "click",
        startAR
    );



// отрисовка каждого кадра
function render(time, frame) {

    if (
        frame && hitTestSource && referenceSpace
    ) {

        // результаты поиска поверхности
        const hitTestResults = frame.getHitTestResults(hitTestSource);


        // если поверхность найдена
        if (hitTestResults.length > 0){

            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);

            if (pose){
                // показываем маркер
                reticle.visible = true;

                reticle.matrix.fromArray(
                    pose.transform.matrix
                );
            }
        }

        else{reticle.visible = false;}
    }


    renderer.render(
        scene, camera
    );
}



// размещение объекта
function placeObject() {

    // если поверхность не найдена
    if (!reticle.visible) {
        return;
    }


    // положение
    const position = new THREE.Vector3();
    // поворот
    const quaternion = new THREE.Quaternion();
    // масштаб
    const scale = new THREE.Vector3();


    // матрицf маркера
    reticle.matrix.decompose(
        position, quaternion, scale
    );


    // объект в точку маркера
    objectManager.objectGroup.position.copy(position);


    objectManager.objectGroup.quaternion.copy(quaternion);

    // показаь
    objectManager.objectGroup.visible = true;
}





