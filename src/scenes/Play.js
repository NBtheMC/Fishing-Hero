class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('base_tiles', 'assets/tilemap/gridTile_tile2.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/FishingHero_TileMap_FullLevel.json');
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
        this.tileset = this.map.addTilesetImage('Tower_new', 'base_tiles');

        // Create the layers we want
        this.wallLayer = this.map.createLayer('Wall', this.tileset);
        this.wallLayer.setCollisionByProperty({ collides: true });
        this.backgroundLayer = this.map.createLayer('Background', this.tileset);
        this.backgroundLayer.setCollisionByProperty({ collides: true });
        this.platformLayer = this.map.createLayer('Platforms', this.tileset);
        this.platformLayer.setCollisionByProperty({ collides: true });
        
        //setup player with state machine
        const playerSpawn = this.map.findObject("Points", obj => obj.name === "spawnPoint");
        this.player = new Player(this, playerSpawn.x, playerSpawn.y, 'player').setOrigin(0, 0); //change to accept spawn point later
        console.log(this.player.x, this.player.y);
        this.player.body.collideWorldBounds=true;
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
        
        //setup hook
        this.hook;
        

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
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

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
        this.physics.add.collider(this.player, this.wallLayer);
        this.physics.add.collider(this.player, this.platformLayer, function(p,g){
            if(this.playerFSM.state == 'reel'){
                this.playerFSM.transition('freefall');
            }
        });
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(275, 0, 1280,10000, true);
        this.cameras.main.setZoom(.9,.9);
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
        if(Phaser.Input.Keyboard.JustDown(keyF)){
            if(dialogueCounter < 1) {
                this.scene.launch('dialogueScene');
            }
        }
    }
}
