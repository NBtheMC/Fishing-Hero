class Hook extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this);     
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, scene.worldLayer);
    }
    launch(xPower, yPower){
        this.setVelocity(4*xPower, 4*yPower);
        this.setGravity(0, 800);
    }
    reset(){

    }
}