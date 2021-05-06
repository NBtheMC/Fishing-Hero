let config = {
    type: Phaser.AUTO,
    width: 1800,
    height: 720,
    physics: {
        default: 'matter',
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
                 y: 0
             }
        }
    },
    scene: [Menu, Play]
}