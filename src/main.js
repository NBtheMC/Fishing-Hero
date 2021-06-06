let config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        // matter: {
        //     gravity: {
        //         y: 200
        //     },
        //     debug: true
        // },
        arcade: {
            debug: true,
                gravity: { y: 1200 }
            //  gravity: {
            //      x: 0,
            //      y: 200
            // }
        }
    },
    scene: [Menu, Play, Dialogue]
}

let game = new Phaser.Game(config);

// Global Variables
let keyA, keyD, keySpace, keyF;
let activeHook;
let graphics;
let convoCounter = -1;
let playerX, playerY, violaFlag = 0;

// Dialogue stuff
const centerX = game.config.width / 2;
const centerY = game.config.height / 2;
let cursors = null;