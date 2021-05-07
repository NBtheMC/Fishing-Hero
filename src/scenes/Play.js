class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }
    preload(){

    }
    create(){
        this.mouseDownX;
        this.mouseDownY;

        this.input.on('pointerdown', function (pointer) {
            console.log('down');
        }, this);

        this.input.on('pointerup', function (pointer) {
            console.log('up');
            //calculate vector and spit it out
        }, this);
    }
    update(){
        
    }
}