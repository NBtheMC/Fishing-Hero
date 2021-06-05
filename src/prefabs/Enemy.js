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
        this.body.bounce.x = 1;
        this.setBodySize(90, 90);
        this.setOffset(0,0);
        this.setVelocityX(-50)

        scene.physics.add.collider(this, scene.platformLayer);
        scene.physics.add.collider(this, scene.wallLayer);
        /*
        scene.physics.add.collider(this, scene.enemyWallLayer, (e, w) => {
            this.body.setVelocityX(this.body.velocity.x * -1);
        });*/
    }

    update() {
        console.log("hello");
    }
    setPeaceful(scene, isPeaceful){
        this.setVelocityX(0);
        this.isPeaceful = isPeaceful;
        this.setBodySize(75, 40);
        this.body.setAllowGravity(false);
        scene.physics.add.overlap(this, scene.player, function(e,p){
            e.eat(scene);
            scene.playerFSM.transition('freefall');
        });
    }

    getPeaceful(){
        return this.isPeaceful;
    }

    moveToPlayer(player){
        this.body.setVelocity(player.x - this.x, player.y - this.y);
    }

    eat(scene){
        //destroy  hook
        //play sound
        //destroy fish
        scene.fishCaught++;
        this.destroy();
    }
}