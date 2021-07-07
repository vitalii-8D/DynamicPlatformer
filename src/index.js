import Phaser from 'phaser';

// import Game from "./01-js/Game";
import Game from "./02-js/Game";

const config = {
    type: Phaser.AUTO,
    parent: 'phaser',
    width: 1280,
    height: 640,
    backgroundColor: "#1d212d",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {y: 1000}
        }
    },
    scene: [Game]
};


export default new Phaser.Game(config);
