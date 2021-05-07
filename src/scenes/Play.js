class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }
    preload(){

    }
    create(){
        this.pointer = scene.input.activePointer;
        scene.input.on('pointerdown', function(pointer){
            let touchX = pointer.x;
            let touchY = pointer.y;
            // ...
         });

        scene.input.on('pointerup', function(pointer){
            let touchX = pointer.x;
            let touchY = pointer.y;
            // ...
        });
    }
    update(){
        
    }
}