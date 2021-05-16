class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    preload(){
        this.load.image('player', 'assets/tempPlayer.png');
        this.load.image('hook', 'assets/tempHook.png');
        this.load.audio('click', 'assets/click.wav');
        this.load.audio('throw', 'assets/throw.wav');
    }
    create(){
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
    update(){
        if(Phaser.Input.Keyboard.JustDown(keySpace)){
            this.scene.start('playScene');    
        }
    }
}