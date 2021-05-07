let config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        matter: {
            gravity: {
                y: 200
            },
            debug: true
        },
        arcade: {
            debug: true,
             gravity: {
                 x: 0,
                 y: 200
             }
        }
    },
    scene: [Menu, Play]
}