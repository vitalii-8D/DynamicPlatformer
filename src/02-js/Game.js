import * as Phaser from "phaser";
import Player from "./Player";

export default class Game extends Phaser.Scene {
   groundLayer;
   player;

   preload() {
      this.load.spritesheet('player', './src/assets/spritesheets/0x72-industrial-player-32px-extruded.png',
         {
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
         });
      this.load.image('tiles', './src/assets/tilesets/0x72-industrial-tileset-32px-extruded.png');
      this.load.tilemapTiledJSON('tilemap', './src/assets/tilemaps/platformer-simple.json')
   }

   create() {
      const map = this.make.tilemap({key: 'tilemap'});
      const tileset = map.addTilesetImage('0x72-industrial-tileset-32px-extruded', 'tiles');

      map.createDynamicLayer("Background", tileset);
      this.groundLayer = map.createDynamicLayer("Ground", tileset);
      map.createDynamicLayer("Foreground", tileset);

      // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map.
      // Note: instead of storing the player in a global variable, it's stored as a property of the scene.
      const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn Point');
      this.player = new Player(this, spawnPoint.x, spawnPoint.y);

      this.groundLayer.setCollisionByProperty({collides: true})
      this.physics.world.addCollider(this.player.sprite, this.groundLayer); // Instead of physics.add.collider()

      this.cameras.main.startFollow(this.player.sprite);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      // Help text that has a "fixed" position on the screen
      this.add
         .text(16, 16, "Arrow keys or WASD to move & jump", {
            font: "18px monospace",
            fill: "#000000",
            padding: { x: 20, y: 10 },
            backgroundColor: "#ffffff"
         })
         .setScrollFactor(0);

   }//**  create() {}

   update(time, dt) {
      // Allow the player to respond to key presses and move itself
      this.player.update();

      if (this.player.sprite.y > this.groundLayer.height) {
         this.player.destroy();
         this.scene.restart();
      }
   }

}
