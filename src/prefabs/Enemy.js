class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this);     
        scene.physics.add.existing(this);
        this.isPeaceful = false; //is it the fish at the beginning of game
        this.isThrown = false; //true when enemy has been reeled
        //hits player
        this.body.setImmovable(true);
        this.setBodySize(90, 90);
        this.setOffset(0,0);
    }

    setPeaceful(isPeaceful){
        this.isPeaceful = isPeaceful;
        this.body.setAllowGravity(false);
    }
}