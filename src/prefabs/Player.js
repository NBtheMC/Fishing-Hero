class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
        scene.physics.add.existing(this);
        //this.enableBody();
        this.moveSpeed = 500;
        this.setBodySize(80, 160);
        this.isFlying = false;
    }
    getMoveSpeed(){
        return this.moveSpeed;
    }
}

class IdleState extends State{
    enter(scene){
        //play appropriate animation
        let p = scene.player;
        p.body.setAcceleration(0,0);
        p.setVelocityX(0);
    }
    execute(scene){
        //go into move state or cast
        if((keyA.isDown || keyD.isDown) && scene.canMove) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends State{
    enter(scene){
        //play appropriate animation

    }
    execute(scene){
        let p = scene.player;
        //tight movement
        if(keyA.isDown) {
            p.body.setVelocityX(-p.getMoveSpeed());
            p.setFlipX(true);
            return;
        }
        else if(keyD.isDown) {
            p.body.setVelocityX(p.getMoveSpeed());
            p.setFlipX(false);
            return;
        }
        else{
            this.stateMachine.transition('idle');
            return;
        }
    }
}

class AimState extends State{
    enter(scene){
        //setup hook and arrow
        scene.hook = new Hook(scene, scene.throwPosition.x, scene.throwPosition.y, 'hook');
        scene.arrow = scene.add.image(scene.throwPosition.x, scene.throwPosition.y, 'arrow').setOrigin(.5,1);
        scene.hook.body.setAllowGravity(false);
        //scene.arrow.scaleY = 0;
    }
    execute(scene){
        //move arrow towards mouse
        scene.arrow.rotation = scene.arrowAngle - Math.PI/2;
        //scale arrow base on original mouse down
        scene.arrow.scaleY = Phaser.Math.Distance.BetweenPoints(scene.mouseDownPosition, scene.mouseUpPosition)/200;
        scene.arrow.scaleY = Phaser.Math.Clamp(scene.arrow.scaleY, 0, 1);
    }
}

class CastState extends State{
    enter(scene){
        scene.hook.body.setAllowGravity(true);
        //setup arrow
    }
    execute(scene){
        //clamp hook velocity

    }
}

class ReelState extends State{
    enter(scene){
        //play appropriate animation
        scene.player.body.setAllowGravity(false);
        scene.player.isFlying = false;
    }
    execute(scene){
        //fly towards hook
        if(scene.player.body.onCeiling()){
            scene.playerFSM.transition('freefall');
        }
        scene.player.body.setAcceleration(2*(scene.hook.x - scene.player.x), 2*(scene.hook.y - scene.player.y));
    }
}

class FreefallState extends State{
    enter(scene){
        //play appropriate animation
        scene.hook.destroy();
        activeHook = 0;
        scene.player.body.setAllowGravity(true);
        scene.click.pause();
    }
    execute(scene){
        if(scene.player.body.velocity.y == 0){
            scene.playerFSM.transition('idle');
        }
    }
}

class HurtState extends State{
    enter(scene){
        if(activeHook == 1) {
            scene.hook.destroy();
            activeHook = 0;
            scene.player.body.setAllowGravity(true);
            scene.click.pause();
        }
        //knockback
        let knockbackX = 350;
        let knockbackY = 350;
        if(scene.player.body.touching.left){
            knockbackX = 500;
        }
        else if(scene.player.body.touching.right){
            knockbackX = -500;
        }
        else if(scene.player.body.touching.up){
            knockbackY = 450;
        }
        if(scene.player.body.touching.down){
            knockbackY = -450;
        }
        scene.player.body.setVelocity(knockbackX, knockbackY);
        scene.cameras.main.shake(100, .05);
        scene.player.body.setBounce(.75,.75);
    }
    execute(scene){
        //record bounces
        if(scene.bounces == 6){
            scene.player.body.setBounce(0, 0);
            scene.bounces = 0;
            scene.playerFSM.transition('idle');
        }
    }
}