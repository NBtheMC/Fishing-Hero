class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('player', 'assets/tempPlayer.png');
        this.load.image('hook', 'assets/tempHook.png');
        this.load.image('base_tiles', 'assets/tilemap/gridTile_tile1.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/FishingHero_TileMap.json');

        this.load.audio('jump','assets/jump.wav');
    }

    create(){
        // Create the Tilemap
        const map = this.make.tilemap({key: 'tilemap' });
        
        // add the tileset image we are using
        const tileset = map.addTilesetImage('tower', 'base_tiles');

        // Create the layers we want
        this.worldLayer = map.createLayer('friday', tileset);
        this.worldLayer.setCollisionByProperty({ collides: true });

        //setup player with state machine
        this.player = new Player(this, game.config.width/16, game.config.height/2, 'player').setOrigin(0, 0);

        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            aim: new AimState(),
            cast: new CastState(),
            reel: new ReelState(),
            freefall: new FreefallState(),
        }, [this]);
        
        //setup hook
        this.hook;

        //mouse stuff
        this.mouseDownX;
        this.mouseDownY;

        // Keyboard keys
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.jumpSound = this.sound.add('jump');

        // Hook shenanigans
        this.input.on('pointerdown', function (pointer) {
            if(this.playerFSM.state == 'idle'){
                this.playerFSM.transition('aim');
                console.log('down');
                this.mouseDownX = pointer.x;
                this.mouseDownY = pointer.y;
            }
            else if(this.playerFSM.state == 'reel'){
                this.playerFSM.transition('freefall');
                this.hook.destroy();
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
                this.jumpSound.play();
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

        this.physics.add.collider(this.player, this.worldLayer);
    }

    drawRope(){
        //redraw the rope
        graphics.lineStyle(5, 0xffffff, 1);
        this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.hook.y);
        this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
        this.outerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
        this.outerRope.draw(graphics);
        graphics.lineStyle(3, 0x808080, 1);
        this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.hook.y);
        this.endPoint = new Phaser.Math.Vector2(this.hook.x, this.hook.y);
        this.innerRope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.endPoint, this.endPoint);
        this.innerRope.draw(graphics);
    }

    update(){
        graphics.clear();
        if(this.playerFSM.state == 'cast' || this.playerFSM.state == 'reel'){
            this.drawRope();
        }
        this.playerFSM.step();
    }
}
