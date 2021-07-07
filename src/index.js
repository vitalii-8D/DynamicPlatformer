import Phaser from 'phaser';

import Game from "./scenes/Game";

const config = {
    type: Phaser.AUTO,
    parent: 'phaser',
    width: 1280,
    height: 640,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {y: 0}
        }
    },
    scene: [Game]
};


export default new Phaser.Game(config);
