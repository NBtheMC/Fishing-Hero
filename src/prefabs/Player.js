class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
        scene.physics.add.existing(this);
        //this.enableBody();
        this.moveSpeed = 100;
    }
    getMoveSpeed(){
        return this.moveSpeed;
    }
}

class IdleState extends State{
    enter(scene){
        //play appropriate animation
        let p = scene.player;
        p.body.setVelocityX(0);
    }
    execute(scene){
        //go into move state or cast
        if(keyA.isDown || keyD.isDown) {
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
            return;
        }
        else if(keyD.isDown) {
            p.body.setVelocityX(p.getMoveSpeed());
            return;
        }
        else{
            this.stateMachine.transition('idle');
            return;
        }
    }
}

class CastState extends State{
    enter(scene){
        //setup arrow
        scene.hook = new Hook(scene, scene.player.x, scene.player.y, 'hook');
    }
    execute(scene){
        //tight movement
    }
}

class ReelState extends State{
    enter(scene){
        //play appropriate animation

    }
    execute(scene){
        //fly towards hook
    }
}

class FreefallState extends State{
    enter(scene){
        //play appropriate animation
        scene.hook.destroy();
        //apply gravity
    }
    execute(scene){
        //temp move into idle
        this.stateMachine.transition('idle');
    }
}