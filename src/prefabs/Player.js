class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
        scene.physics.add.existing(this);
        //this.enableBody();
        this.moveSpeed = 10;
    }
}

class IdleState extends State{
    // enter(scene, player){
    //     //play appropriate animation

    // }
    execute(scene, player){
        //go into move state or cast
        if(keyA.isDown || keyD.isDown) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

class MoveState extends State{
    enter(scene, player){
        //play appropriate animation

    }
    execute(scene, player){
        player.body.setVelocityX(0);
        //tight movement
        if(keyA.isDown) {
            player.body.setVelocityX(-this.moveSpeed);
            console.log("zooming");
            return;
        }
        if(keyD.isDown) {
            player.body.setVelocityX(this.moveSpeed);
            console.log("zooming");
            return;
        }
    }
}

class CastState extends State{
    enter(scene, player){
        //setup arrow

    }
    execute(scene, player){
        //tight movement
    }
}

class ReelState extends State{
    enter(scene, player){
        //play appropriate animation

    }
    execute(scene, player){
        //fly towards hook
    }
}

class FreefallState extends State{
    enter(scene, player){
        //play appropriate animation

        //apply gravity
    }
    execute(scene, player){
        //tight movement
    }
}