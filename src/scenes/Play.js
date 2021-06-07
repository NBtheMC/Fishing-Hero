class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('player', 'assets/knight_idle_in.png');
        this.load.image('player_reel', 'assets/knight_reel_in.png');
        this.load.image('background', 'assets/skyWide.png');
        this.load.image('viola', 'assets/viola_idle_in.png');

        this.load.image('base_tiles', 'assets/tilemap/tilemap.png');
        this.load.tilemapTiledJSON('tilemap_full', 'assets/tilemap/FishingHero_TileMap_FullLevel.json');
    }   

    create(){
        // This stopped the player from moving through collisions
        this.physics.world.TILE_BIAS = 64;

        // Background Image
        this.background = this.add.image(625, -2500, 'background');
        this.background.setScale(3, 5);

        // Sounds
        this.click = this.sound.add('click');
        this.click.setLoop(true);
        this.throw = this.sound.add('throw');
        
        // Create the Tilemap
        this.mapConfig = {
            key: 'tilemap_full',
            tileWidth: 64,
            tileHeight: 64
        }
        this.map = this.make.tilemap(this.mapConfig);
        
        // Add the tileset image we are using
        this.tileset = this.map.addTilesetImage('Tower_new', 'base_tiles', 64, 64);

        // Create the layers we want, and add collision by property as indicated in the tilemap
        this.backgroundLayer = this.map.createLayer('Background', this.tileset);
        this.backgroundLayer.setCollisionByProperty({ collides: true });
        this.platformLayer = this.map.createLayer('Platforms', this.tileset);
        this.platformLayer.setCollisionByProperty({ collides: true });
        this.wallLayer = this.map.createLayer('Wall', this.tileset);
        this.wallLayer.setCollisionByProperty({ collides: true });
        this.enemyWallLayer = this.map.createLayer('EnemyWall', this.tileset);
        this.enemyWallLayer.setCollisionByProperty({ collides: true });
        
        // Setup player with state machine
        const playerSpawn = this.map.findObject("Points", obj => obj.name === "spawnPoint");
        this.player = new Player(this, playerSpawn.x, playerSpawn.y, 'player').setOrigin(0, 0);

        this.player.body.collideWorldBounds=true;
        this.canMove = true;
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            aim: new AimState(),
            cast: new CastState(),
            reel: new ReelState(),
            freefall: new FreefallState(),
            hurt: new HurtState(),
        }, [this]);
        this.player.body.collideWorldBounds=false;
        this.bounces = 0;
        this.anims.create({
            key: 'idle',
            frames: [{
                key: 'player',
                frame: 'idle'
            }],
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'aim',
            frames: [{
                key: 'player',
                frame: 'cast1'
            },{
                key: 'player',
                frame: 'cast2'
            }],
            frameRate: 1,
            yoyo: true,
            repeat: -1
        });
        this.anims.create({
            key: 'cast',
            frames: [{
                key: 'player',
                frame: 'cast1'
            },{
                key: 'player',
                frame: 'cast2'
            },{
                key: 'player',
                frame: 'cast3'
            },{
                key: 'player',
                frame: 'cast4'
            }],
            frameRate: 5,
        });
        this.anims.create({
            key: 'reel',
            frames: [{
                key: 'player',
                frame: 'cast3'
            }],
            frameRate: 5,
        });

        // Set up reset position
        this.resetX = playerSpawn.x
        this.resetY = playerSpawn.y

        // Add Viola sprite & colliders
        this.viola = this.add.image(1250, 1371, 'viola');
        this.physics.add.existing(this.viola);
        this.physics.add.collider(this.viola, this.platformLayer);
        this.physics.add.collider(this.viola, this.wallLayer);

        // Set up the hook
        this.hook;
        this.arrow;
        this.throwPosition = new Phaser.Math.Vector2();

        // Set up the enemies (slimes)
        this.enemiesGroup = this.add.group(
            this.map.createFromObjects("Enemies", {
                classType: Enemy,
                key: 'enemy'
            })
        );

        // Enemy colliders
        this.physics.add.collider(this.enemiesGroup, this.player, (e, p)=>{
            this.playerFSM.transition('hurt');
        });
        this.physics.add.collider(this.enemiesGroup, this.enemyWallLayer)

        // INPUTS:
        // Mouse stuff
        this.mouseDownX;
        this.mouseDownY;
        this.mouseDownPosition = new Phaser.Math.Vector2();
        this.mouseUpX;
        this.mouseUpY;
        this.mouseUpPosition = new Phaser.Math.Vector2();
        // Keyboard keys
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // Hook mechanics
        this.input.on('pointerdown', function (pointer) {
            if(this.playerFSM.state == 'idle'){
                if(!this.player.flipX){
                    this.throwPosition.set(this.player.x, this.player.y);
                }
                else{
                    this.throwPosition.set(this.player.x + this.player.width/2, this.player.y);
                }
                this.playerFSM.transition('aim');
                console.log('down');
                this.mouseDownX = pointer.x;
                this.mouseDownY = pointer.y;
                this.mouseDownPosition.set(this.mouseDownX,this.mouseDownY);
            }
            else if(this.playerFSM.state == 'cast'){
                this.playerFSM.transition('idle');
                this.hook.destroy();
            }
            else if(this.playerFSM.state == 'reel'){
                this.playerFSM.transition('freefall');
                this.hook.destroy();
            }
        }, this); 

        this.input.on('pointermove', function (pointer) {
            if(this.playerFSM.state == 'aim'){
                this.mouseUpX = pointer.x;
                if(this.mouseUpX < this.player.x && this.player.flipX){
                    this.player.setFlipX(true);
                }
                else if(this.mouseUpX >= this.player.x && !this.player.flipX){
                    this.player.setFlipX(false);
                }
                this.mouseUpY = pointer.y;
                this.mouseUpPosition.set(this.mouseUpX,this.mouseUpY);
                this.arrowAngle = Phaser.Math.Angle.BetweenPoints(this.mouseDownPosition, this.mouseUpPosition);
            }
        }, this);

        this.input.on('pointerup', function (pointer) {
            if(this.playerFSM.state == 'aim'){
                console.log('up');
                //calculate vector
                let diffX = pointer.x - this.mouseDownX;
                let diffY = pointer.y - this.mouseDownY;
                console.log('diffX: '+ diffX + '\ndiffY: ' + diffY);
                this.throw.play();
                this.hook = new Hook(this, this.throwPosition.x, this.throwPosition.y, 'hook');
                this.hook.body.setAllowGravity(false);
                this.hook.launch(-diffX,-diffY);
                this.playerFSM.transition('cast');
                this.arrow.destroy();
            }
        }, this);

        // Set up the rope
        graphics = this.add.graphics();
        this.outerRope;
        this.innerRope;
        this.startPoint;
        this.controlPoint;
        this.endPoint;

        this.physics.add.collider(this.player, this.wallLayer, (p,g)=>{
            if(this.playerFSM.state == 'hurt'){
                this.bounces++;
                // this.dust = this.add.particles('dustParticle').createEmitter({
                //     speed: 100,
                //     gravityY: 200,
                //     x: this.player.x,
                //     y: this.player.y + this.player.height/2,
                //     lifespan: 150
                // });
            } 
            else if (this.playerFSM.state == 'idle'){
                // Trigger Dialogue 1
                if(this.player.x > 600 && this.player.x < 830 && this.player.y == 1568 && convoCounter == -1) {
                    playerX = this.player.x;
                    playerY = this.player.y;
                    this.scene.pause();
                    this.scene.launch('dialogueScene');
                }
                // Trigger Dialogue 2
                if(this.player.x > 1290 && this.player.x < 1481 && this.player.y == -3232 && convoCounter == 0) {
                    playerX = this.player.x - 200;
                    playerY = this.player.y
                    this.scene.pause();
                    this.scene.launch('dialogueScene');
                }
                // Trigger Dialogue 3
                if(this.player.x > 655 && this.player.x < 850 && this.player.y == -5984 && convoCounter == 1) {
                    playerX = this.player.x;
                    playerY = this.player.y
                    this.scene.pause();
                    this.scene.launch('dialogueScene');
                }
            } 
        });

        // Collider between player and platforms
        this.physics.add.collider(this.player, this.platformLayer, (p,g)=>{
            if(this.playerFSM.state == 'reel'){
                this.playerFSM.transition('freefall');
            }
            else if(this.playerFSM.state == 'hurt'){
                this.bounces++;
            }
        });

        this.cameras.main.setBounds(275, -10000, 1280, 20000, true);
        this.cameras.main.setZoom(.9,.9);
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.player.body.setMaxSpeed(2000);
        this.titleScreen();
    }

    update(){
        // Move Viola at the end of every conversation
        if(convoCounter == 0 && violaFlag == 1) {
            this.viola.x = 530;
            this.viola.y = -3563;
            violaFlag = 2;
        } else if (convoCounter == 1 && violaFlag == 2) {
            this.viola.x = 1281;
            this.viola.y = -5953
            violaFlag = 3;
        }

        // Redraw the rope
        graphics.clear();
        if(this.playerFSM.state == 'cast' || this.playerFSM.state == 'reel'){
            this.drawRope();
        }
        this.playerFSM.step();
        
        // Cheat for graders/debugging
        if(keySpace.isDown){
            this.player.body.setVelocityY(-2000);
        }

        // Prevent player's falling velocity from becoming too high
        if(this.player.body.velocity.y > 1000) {
            this.player.body.setVelocityY(1000);
        }
        // If player falls out of map, reset the player back to the start
        if(this.player.y > 1950) {
            this.player.body.setVelocityY(0);
            this.player.x = this.resetX;
            this.player.y = this.resetY;
        }
    }

    drawRope(){
        // Curved rope when throwing
        if(this.playerFSM.state == 'cast'){
            graphics.lineStyle(5, 0xffffff, 1);
            if(!this.player.flipX){
                this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
                this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.hook.y);
            }
            else{
                this.startPoint = new Phaser.Math.Vector2(this.player.x + this.player.width, this.player.y);
                this.controlPoint = new Phaser.Math.Vector2(this.player.x + this.player.width, this.hook.y);
            }
            this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
            this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
            this.outerRope.draw(graphics);
            graphics.lineStyle(3, 0x808080, 1);
            this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
            this.innerRope.draw(graphics);
        }
        else if(this.playerFSM.state == 'reel'){
            graphics.lineStyle(5, 0xffffff, 1);
            if(!this.player.flipX){
                this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
            }
            else{
                this.startPoint = new Phaser.Math.Vector2(this.player.x + this.player.width, this.player.y);
            }
            this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
            this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.outerRope.draw(graphics);
            graphics.lineStyle(3, 0x808080, 1);
            this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.innerRope.draw(graphics);
        }
    }

    titleScreen(){
        keyA.enabled = false;
        keyD.enabled = false;
        this.cameras.main.stopFollow(this.player);
        //this.cameras.main.pan(1390, 1033, 2000);
        this.backgroundImage = this.add.image(1050,0,'titleBackground').setScale(1/.75,1/.75);
        this.image = this.add.image(1050,0,'title').setScale(1/.75,1/.75);
        this.timer2 = this.time.addEvent({
            delay: 2000,
            callback: this.transition,
            callbackScope: this
        });
        this.timer3 = this.time.addEvent({
            delay: 4000,
            callback: this.startMove,
            callbackScope: this
        });
    }

    transition(){
        this.cameras.main.pan(1390, 1800, 2000)
    }

    startMove(){
        this.image.destroy();
        this.backgroundImage.destroy();
        keyA.enabled = true;
        keyD.enabled = true;
        this.cameras.main.startFollow(this.player);
        this.cameras.main.startFollow(this.player, false, .5, .5, 0, 50);
        this.cameras.main.setBounds(275, -10000, 1280, 20000, true);
    }
}
