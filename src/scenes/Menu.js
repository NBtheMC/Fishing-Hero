class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    preload(){
        this.load.image('player', 'assets/tempPlayer.png');
        this.load.image('hook', 'assets/tempHook.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('enemy', 'assets/tempSlime.png');
        this.load.image('background', 'assets/background.png');

        this.load.audio('click', 'assets/click.wav');
        this.load.audio('throw', 'assets/throw.wav');

        this.load.image('base_tiles', 'assets/tilemap/tilemap.png');
        this.load.tilemapTiledJSON('tilemap_menu', 'assets/tilemap/FishingHero_TileMap_OpeningScene.json');
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

        // Create the layers we want: platform, door, tower, bridge, grass, water
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
        
        //setup hook and arrow
        this.hook;
        this.arrow;

        //test enemy
        // this.enemy = new Enemy(this, 704, 1880, 'enemy', false).setOrigin(0, 0);
        // this.enemy.body.collideWorldBounds=true;

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
                this.hook.launch(-diffX,-diffY);
                this.throw.play();
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
        this.physics.add.collider(this.player, this.grassLayer);
        this.physics.add.collider(this.player, this.waterLayer);

        let menuConfig = {
            fontFamily: 'Verdana',
            fontSize: '45px',
            color: 'white',
            align: 'center',
            padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
            },
            fixedWidth: 0
        }
        let customHeight = 50;
        this.add.text(playerSpawn.x, playerSpawn.y, 'Move left and right with A and D\nClick and drag to throw the hook\nClick again to retract it\nPress Space to start!', menuConfig).setOrigin(0.5);
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cameras.main.startFollow(this.player);
    }

    drawRope(){
        //curved rope when throwing
        if(this.playerFSM.state == 'cast'){
            graphics.lineStyle(5, 0xffffff, 1);
            this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
            this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.hook.y);
            this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
            this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
            this.outerRope.draw(graphics);
            graphics.lineStyle(3, 0x808080, 1);
            this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
            this.innerRope.draw(graphics);
        }
        else if(this.playerFSM.state == 'reel'){
            graphics.lineStyle(5, 0xffffff, 1);
            this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
            this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
            this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.outerRope.draw(graphics);
            graphics.lineStyle(3, 0x808080, 1);
            this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.startPoint, this.endPoint, this.endPoint);
            this.innerRope.draw(graphics);
        }
    }

    update(){
        graphics.clear();
        //redraw the rope
        if(this.playerFSM.state == 'cast' || this.playerFSM.state == 'reel'){
            this.drawRope();
        }
        this.playerFSM.step();
        if(Phaser.Input.Keyboard.JustDown(keySpace)){
            this.scene.start('playScene');
        }
    }
}