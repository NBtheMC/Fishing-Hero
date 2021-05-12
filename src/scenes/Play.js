class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('player', 'assets/tempPlayer.png');
        this.load.image('hook', 'assets/tempHook.png');
    }

    create(){
        //setup player with state machine
        this.player = new Player(this, game.config.width/2, game.config.height/2, 'player').setOrigin(0, 0);
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            cast: new CastState(),
            reel: new ReelState(),
            freefall: new FreefallState(),
        }, [this]);
        //setup hook
        this.Hook = new Hook(this, game.config.width/2, game.config.height/2, 'hook');

        //mouse stuff
        this.mouseDownX;
        this.mouseDownY;

        // Keyboard keys
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Hook shenanigans
        this.input.on('pointerdown', function (pointer) {
            console.log('down');
            this.mouseDownX = pointer.x;
            this.mouseDownY = pointer.y;
        }, this);

        this.input.on('pointerup', function (pointer) {
            console.log('up');
            //calculate vector
            let diffX = pointer.x - this.mouseDownX;
            let diffY = pointer.y - this.mouseDownY;
            console.log('diffX: '+ diffX + '\ndiffY: ' + diffY);
            this.Hook.launch(-diffX,-diffY);
        }, this);

        //rope
        graphics = this.add.graphics();
        this.rope;
        this.startPoint;
        this.controlPoint;
        this.endPoint;
    }

    drawRope(){
        //redraw the rope
        graphics.clear();
        graphics.lineStyle(2, 0xffffff, 1);
        this.startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.controlPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);
        this.endPoint = new Phaser.Math.Vector2(this.Hook.x, this.Hook.y);
        this.rope = new Phaser.Curves.CubicBezier(this.startPoint, this.controlPoint, this.controlPoint, this.endPoint);
        this.rope.draw(graphics);
    }

    update(){
        //this.player.update();
        this.drawRope();
        this.playerFSM.step();
        this.Hook.update();
    }
}
