class Hook extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this);     
        scene.physics.add.existing(this);
        scene.physics.add.collider(this, scene.worldLayer, function(h,g){
            h.body.setImmovable(true);
            h.body.setVelocity(0,0);
            h.body.setAllowGravity(false);
            scene.playerFSM.transition('reel');
        });
        // scene.physics.add.collider(this, scene.bouncyLayer, function(h,g){
            
        //     h.body.setVelocity(0,0);
        //     h.body.setAllowGravity(false);
        //     scene.playerFSM.transition('reel');
        // });
        this.allowGravity = false;
    }

    launch(xPower, yPower){
        this.setVelocity(4*xPower, 4*yPower);
    }
}