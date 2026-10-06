import * as THREE from "three";

import {GLTFLoader}
from "three/addons/loaders/GLTFLoader.js";


export class ObjectManager {

    constructor(scene) {
        this.scene = scene;


        // общая группа
        this.objectGroup = new THREE.Group();
        this.objectGroup.visible = false;
        this.scene.add(this.objectGroup);

        this.color = "#8b5cf6";


        this.loader = new GLTFLoader();
        // куб по умолчанию
        this.createCube();
    }


    // удаление пред объекта
    clearObject() {

        while (this.objectGroup.children.length > 0) {

            const object =
                this.objectGroup.children[0];

            this.objectGroup.remove(object);

        }

    }


    // создание куба
    createCube() {

        this.clearObject();

        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

        // PBR материал
        const material =
            new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.4,
                metalness: 0.2
            });

        // объединяем форму и материал
        const cube = new THREE.Mesh( geometry, material);
        cube.position.y = 0.075;

        this.objectGroup.add(cube);
    }


    // загрузка модели
    async loadModel() {
        this.clearObject();

        // model.glb из assets
        const gltf = await this.loader.loadAsync("./assets/model.glb");

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

         // самое большое изт ширина/высота/глубина
        const maxSize = Math.max(size.x, size.y, size.z);

        const wantedSize = 0.20;

        if (maxSize > 0) {
            const scale = wantedSize / maxSize;
            model.scale.setScalar(scale);
        }


        // повторно границы после изм масштаба
        const newBox = new THREE.Box3().setFromObject(model);


        // центр модели
        const center = newBox.getCenter(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.z -= center.z;

        model.position.y -= newBox.min.y;




        model.traverse((child) => {
            if(
                child.isMesh && child.material) {
                // копия материала
                    child.material = child.material.clone();

                    // если PBR
                    if(child.material.isMeshStandardMaterial){
                        child.material.roughness = 0.4;
                        child.material.metalness = 0.1;
                    }
                }
            });

        this.objectGroup.add(model);


        console.log("3D-модель");
        }


    

    // переключение между кубом и моделью
    async changeObject(type) {

        if (type === "cube"){this.createCube();
        }
        if (type === "model") { await this.loadModel();
        }
    }


    // изменение цвета
    setColor(newColor){
        this.color = newColor;
        this.objectGroup.traverse(
            (child) => {
                if (child.isMesh && child.material && child.material.color
                ) { //  новый цвет
                    child.material.color.set(newColor);
                }
            }
        );
    }


    // вращение 
    rotate(angle){
        this.objectGroup.rotation.y +=angle;
    }

}
