class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
        scene.physics.add.existing(this);
        //this.enableBody();
        this.moveSpeed = 10;
    }

    update() {
        // Left and Right movement
        if(keyA.isDown) {
            this.x -= this.moveSpeed;
        }
        if(keyD.isDown) {
            this.x += this.moveSpeed;
        }
    }
}
