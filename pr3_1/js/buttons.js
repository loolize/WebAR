export class ButtonsManager {

    constructor(objectManager) {

        //объект из .js
        this.objectManager = objectManager;


        //эл-ты интерфейса. .html
        this.colorPicker = document.getElementById("colorPicker");

        this.objectSelect = document.getElementById("objectSelect");

        this.rotateLeft = document.getElementById("rotateLeft");

        this.rotateRight = document.getElementById("rotateRight");

        this.controls = document.getElementById("controls");



        this.addEvents();
    }


    addEvents(){

        // изменение цвета
        this.colorPicker.addEventListener(
            "input",
            (event) => {this.objectManager.setColor(event.target.value);}
        );


        // смена объекта
        this.objectSelect.addEventListener(
            "change",
            async (event) => {
                await this.objectManager.changeObject(event.target.value);
            }
        );




        // влево
        this.rotateLeft.addEventListener(
            "click",
            () => {this.objectManager.rotate(-0.3);}
        );
        // вправо
        this.rotateRight.addEventListener(
            "click",
            () => {this.objectManager.rotate(0.3);}
        );


    //    нажатие на панель != нажатие на сцену
        this.controls.addEventListener(
            "beforexrselect",
            (event) => {
                event.preventDefault();
            }
        );

    }

}

