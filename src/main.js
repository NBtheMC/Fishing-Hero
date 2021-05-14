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
    scene: [Play, Menu]
}

let game = new Phaser.Game(config);

// Global Variables
let keyA, keyD;

let graphics;