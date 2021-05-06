class Hook extends Phaser.Physics.Matter.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
    }
}