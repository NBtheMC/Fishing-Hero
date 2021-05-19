class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('base_tiles', 'assets/tilemap/gridTile_tile1.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/FishingHero_TileMap_Test.json');
    }

    create(){
        //sounds
        this.click = this.sound.add('click');
        this.click.setLoop(true);

        this.throw = this.sound.add('throw');
        
        // Sanity Check:
        //this.add.image(0, 0, 'base_tiles').setOrigin(0, 0);

        // Create the Tilemap
        this.map = this.make.tilemap({key: 'tilemap' });
        
        // add the tileset image we are using
        this.tileset = this.map.addTilesetImage('tower', 'base_tiles');

        // Create the layers we want
        this.worldLayer = this.map.createLayer('friday', this.tileset);
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

        this.physics.add.collider(this.player, this.worldLayer);
        // this.physics.add.collider(this.player, this.worldLayer, function(p,g){
        //     if(this.playerFSM.state == 'freefall'){
        //         this.playerFSM.transition('idle');
        //     }
        // });d
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
    }
}
