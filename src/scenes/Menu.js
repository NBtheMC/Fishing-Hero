class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    preload(){
        this.load.image('player', 'assets/tempPlayer.png');
        this.load.image('hook', 'assets/tempHook.png');
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('background', 'assets/background.png');

        this.load.audio('click', 'assets/click.wav');
        this.load.audio('throw', 'assets/throw.wav');

        this.load.image('base_tiles_menu', 'assets/tilemap/gridTile_tile1.png');
        this.load.tilemapTiledJSON('tilemap_menu', 'assets/tilemap/FishingHero_TileMap.json');
    }
    create(){
        this.background = this.add.image(0,0, 'background');
        //sounds
        this.click = this.sound.add('click'); 
        this.click.setLoop(true);

        this.throw = this.sound.add('throw');

        // Create the Tilemap
        this.map = this.make.tilemap({key: 'tilemap_menu' });
        
        // // add the tileset image we are using
        this.tileset = this.map.addTilesetImage('tower', 'base_tiles_menu');

        // Create the layers we want
        this.platformLayer = this.map.createLayer('platform', this.tileset);
        this.platformLayer.setCollisionByProperty({ collides: true });
        this.groundLayer = this.map.createLayer('ground', this.tileset);
        this.groundLayer.setCollisionByProperty({ collides: true });

        //setup player with state machine
        this.player = new Player(this, game.config.width/16, game.config.height/2, 'player').setOrigin(0, 0);
        this.player.body.collideWorldBounds=true;
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            aim: new AimState(),
            cast: new CastState(),
            reel: new ReelState(),
            freefall: new FreefallState(),
        }, [this]);
        
        //setup hook and arrow
        this.hook;
        this.arrow;

        //mouse stuff
        this.mouseDownX;
        this.mouseDownY;
        this.mousePosition = new Phaser.Math.Vector2(this.mouseDownX, this.mouseDownY);

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
                this.mouseDownX = pointer.x
                this.mousePosition.set(this.mouseDownX,this.mouseDownY);
                this.arrowAngle = Phaser.Math.Angle.BetweenPoints(this.player, this.mousePosition);
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
            }
        }, this);

        //rope
        graphics = this.add.graphics();
        this.outerRope;
        this.innerRope;
        this.startPoint;
        this.controlPoint;
        this.endPoint;

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
        this.add.text(game.config.width/2, game.config.height/2, 'Press Space to start!', menuConfig).setOrigin(0.5);
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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