class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        //add to scene
        scene.add.existing(this); 
        scene.physics.add.existing(this);
        //this.enableBody();
        this.moveSpeed = 100;
    }
    update(){
        // if(keyA.isDown) {
        //     this.body.setVelocityX(-this.moveSpeed);
        //     console.log("zooming");
        //     return;
        // }
        // if(keyD.isDown) {
        //     this.body.setVelocityX(this.moveSpeed);
        //     console.log("zooming");
        //     return;
        // }
        //console.log(this.velocityX);
    }
    getMoveSpeed(){
        return this.moveSpeed;
    }
}

class IdleState extends State{
    // enter(scene, player){
    //     //play appropriate animation

    // }
    execute(scene, player){
        console.log("idling");
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
        console.log("moving");
        player.body.setVelocityX(0);
        //tight movement
        if(keyA.isDown) {
            player.body.setVelocityX(-player.getMoveSpeed());
            console.log(player.getMoveSpeed());
            this.stateMachine.transition('idle');
            return;
        }
        if(keyD.isDown) {
            player.body.setVelocityX(player.getMoveSpeed());
            console.log(player.getMoveSpeed());
            this.stateMachine.transition('idle');
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