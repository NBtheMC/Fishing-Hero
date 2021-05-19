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
            scene.click.play();
            scene.playerFSM.transition('reel');
        });
        scene.physics.add.overlap(this, scene.player, function(h,p){
            if(scene.playerFSM.state == 'reel'){
                h.destroy();
                scene.playerFSM.transition('freefall');
            }
        });
        this.setScale(.25);

        // scene.physics.add.collider(this, scene.bouncyLayer, function(h,g){
            
        //     h.body.setVelocity(0,0);
        //     h.body.setAllowGravity(false);
        //     scene.playerFSM.transition('reel');
        // });
        this.allowGravity = false;
    }

    launch(xPower, yPower){
        xPower = Phaser.Math.Clamp(xPower, -250, 250);
        yPower = Phaser.Math.Clamp(yPower, -250, 250);
        this.setVelocity(4*xPower, 4*yPower);
    }
}