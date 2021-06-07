class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    preload(){
        this.load.atlas('player', 'assets/outsideCassianSprites.png','assets/outsideCassianSprites.json');
        this.load.image('hook', 'assets/tempHook.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('enemy', 'assets/slime_enemy.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('menuBackground', 'assets/menuBackground.png');
        this.load.image('title', 'assets/titlescreen.png');
        this.load.image('titleBackground', 'assets/titlescreenBackground.png');
        this.load.image('gear', 'assets/gear_pile.png');
        this.load.image('fish1', 'assets/fish_1.png');
        this.load.image('fish2', 'assets/fish_2.png');
        this.load.image('fish3', 'assets/fish_3.png');
        this.load.image('dustParticle', 'assets/dust.png');

        this.load.audio('click', 'assets/click2.wav');
        this.load.audio('throw', 'assets/throw.wav');

        this.load.image('base_tiles', 'assets/tilemap/tilemap.png');
        this.load.tilemapTiledJSON('tilemap_menu', 'assets/tilemap/FishingHero_TileMap_OpeningScene.json');

        // Preload Dialogue stuff
        // load assets
        this.load.path = "./assets/";

        // load JSON (dialog)
        this.load.json('dialog', 'json/dialog.json');

        // load images
        this.load.image('dialogbox', 'dialogue/dialogbox.png');

        // load bitmap font
        this.load.bitmapFont('gem_font', 'font/gem.png', 'font/gem.xml');
    }
    create(){
        //sounds
        this.click = this.sound.add('click'); 
        this.click.setLoop(true);

        this.throw = this.sound.add('throw');

        //Create the Tilemap
        this.mapConfig = {
            key: 'tilemap_menu',
            tileWidth: 64,
            tileHeight: 64
        }
        this.map = this.make.tilemap(this.mapConfig);
        // add the tileset image we are using
        this.tileset = this.map.addTilesetImage('tilemap', 'base_tiles', 64, 64);

        // Create the layers we want: background, platform, door, tower, bridge, grass, water
        this.background = this.add.image(230, 1600, 'menuBackground');
        this.background.setScale(3, 1);
        this.waterLayer = this.map.createLayer('water', this.tileset);
        this.waterLayer.setCollisionByProperty({ collides: true });
        this.grassLayer = this.map.createLayer('grass', this.tileset);
        this.grassLayer.setCollisionByProperty({ collides: true });
        this.platformLayer = this.map.createLayer('platform', this.tileset);
        this.platformLayer.setCollisionByProperty({ collides: true });
        this.towerLayer = this.map.createLayer('tower', this.tileset);
        this.towerLayer.setCollisionByProperty({ collides: true });
        this.doorLayer = this.map.createLayer('door', this.tileset);
        this.doorLayer.setCollisionByProperty({ collides: true });
        this.bridgeLayer = this.map.createLayer('bridge', this.tileset);
        this.bridgeLayer.setCollisionByProperty({ collides: true });


        //setup player with state machine
        const playerSpawn = this.map.findObject("Points", obj => obj.name === "spawnPoint");
        this.player = new Player(this, playerSpawn.x, playerSpawn.y, 'player').setOrigin(0, 0);
        this.player.setScale(.5, .5);
        this.canMove = false;
        //this.player.body.collideWorldBounds=true;
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            aim: new AimState(),
            cast: new CastState(),
            reel: new ReelState(),
            freefall: new FreefallState(),
            hurt: new HurtState(),
        }, [this]);
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

        //setup hook and arrow
        this.hook;
        this.arrow;
        this.throwPosition = new Phaser.Math.Vector2();

        //fish enemies
        let fishSpawn = this.map.findObject("Points", obj => obj.name === "fish1");
        this.fish1 = new Enemy(this, fishSpawn.x, fishSpawn.y, 'fish1').setOrigin(0, 0);
        this.fish1.setPeaceful(this, true);
        fishSpawn = this.map.findObject("Points", obj => obj.name === "fish2");
        this.fish2 = new Enemy(this, fishSpawn.x, fishSpawn.y, 'fish2').setOrigin(0, 0);
        this.fish2.setPeaceful(this, true);
        fishSpawn = this.map.findObject("Points", obj => obj.name === "fish3");
        this.fish3 = new Enemy(this, fishSpawn.x, fishSpawn.y, 'fish3').setOrigin(0, 0);
        this.fish3.setPeaceful(this, true);
        this.fishCaught = 0;

        //gear
        const gearSpawn = this.map.findObject("Points", obj => obj.name === "gear");
        this.gear = this.add.image(gearSpawn.x, gearSpawn.y, 'gear');

        //mouse stuff
        this.mouseDownX;
        this.mouseDownY;
        this.mouseDownPosition = new Phaser.Math.Vector2();
        this.mouseUpX;
        this.mouseUpY;
        this.mouseUpPosition = new Phaser.Math.Vector2();

        // Keyboard keys
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Hook shenanigans
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

        //rope
        graphics = this.add.graphics();
        this.outerRope;
        this.innerRope;
        this.startPoint;
        this.controlPoint;
        this.endPoint;

        this.physics.add.collider(this.player, this.platformLayer);
        this.physics.add.collider(this.player, this.doorLayer);
        this.physics.add.collider(this.player, this.bridgeLayer);
        this.physics.add.collider(this.player, this.towerLayer);
        this.physics.add.collider(this.player, this.grassLayer);
        this.physics.add.collider(this.player, this.waterLayer);

        let tutorialConfig = {
            fontFamily: 'Verdana',
            fontSize: '45px',
            color: 'black',
            align: 'center',
            padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
            },
            fixedWidth: 0
        }
        this.tutorialText = this.add.text(playerSpawn.x, playerSpawn.y - 50, 'Click and drag to throw the hook\nClick again to retract it\nTry catching all fish', tutorialConfig).setOrigin(0.5);
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.5,1.5);
    }

    drawRope(){
        //curved rope when throwing
        if(this.playerFSM.state == 'cast'){
            graphics.lineStyle(5, 0xffffff, 1);
            if(!this.player.flipX){
                this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
                this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.hook.y);
            }
            else{
                this.startPoint = new Phaser.Math.Vector2(this.player.x + this.player.width/2, this.player.y);
                this.controlPoint = new Phaser.Math.Vector2(this.player.x + this.player.width/2, this.hook.y);
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
                this.startPoint = new Phaser.Math.Vector2(this.player.x + this.player.width/2, this.player.y);
            }
            this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
            this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.outerRope.draw(graphics);
            graphics.lineStyle(3, 0x808080, 1);
            this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.innerRope.draw(graphics);
        }
    }

    update(){
        //caught all fish so enable character movement
        if(this.fishCaught ==3){
            this.canMove = true;
            this.tutorialText.setText('Move left and right with A and D');
        }
        graphics.clear();
        //redraw the rope
        if(this.playerFSM.state == 'cast' || this.playerFSM.state == 'reel'){
            this.drawRope();
        }
        this.playerFSM.step();
        if(Phaser.Input.Keyboard.JustDown(keySpace)){
            this.scene.start('playScene');
        }
        if(this.player.x > 1391.5 && this.player.y < 2033) {
            this.titleScreen();
        }
        //falls in water
        if(this.player.y > 2400) {
            let checkpoint = this.map.findObject("Points", obj => obj.name === "checkPoint");
            this.player.setPosition(checkpoint.x, checkpoint.y);
        }
    }
    titleScreen(){
        // this.player.x = 1390;
        // this.player.y = 2033;
        keyA.enabled = false;
        keyD.enabled = false;
        this.cameras.main.stopFollow(this.player);
        this.cameras.main.pan(1390, 1033, 2000);
        this.timer = this.time.addEvent({
            delay: 2000,
            callback: this.showTitle,
            callbackScope: this
        });
        this.timer = this.time.addEvent({
            delay: 5000,
            callback: this.changeScene,
            callbackScope: this
        });
    }

    showTitle(){
        this.backgroundImage = this.add.image(1392,1033,'titleBackground').setScale(.75, .75);
        this.image = this.add.image(1392,1033,'title').setScale(.75, .75);
    }

    // transition(){
    //     this.cameras.main.pan(1390, 2020, 2000)
    //     //this.cameras.main.zoomTo(4, 3000);
    // }

    changeScene(){
        this.scene.start('playScene')
    }
}