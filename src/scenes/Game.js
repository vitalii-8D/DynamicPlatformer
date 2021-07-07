import * as Phaser from "phaser";

export default class Game extends Phaser.Scene {
   groundLayer;
   controls;
   marker;
   shiftKey;

   constructor() {
      super({key: 'game'});
   }

   preload() {
      this.load.image('tiles', './src/assets/tilesets/0x72-industrial-tileset-32px-extruded.png');
      this.load.tilemapTiledJSON('tilemap', './src/assets/tilemaps/platformer.json');
   }

   create() {
      const map = this.make.tilemap({key: 'tilemap'});
      const tiles = map.addTilesetImage('0x72-industrial-tileset-32px-extruded', 'tiles');

      // Same setup as static layers
      map.createDynamicLayer("Background", tiles);
      this.groundLayer = map.createDynamicLayer("Ground", tiles);
      map.createDynamicLayer("Foreground", tiles);

      // Put tile index 1 at tile grid location (20, 10) within layer
      this.groundLayer.putTileAt(1, 20, 10);

      // Put tile index 2 at world pixel location (200, 50) within layer
      // (This uses the main camera's coordinate system by default)
      this.groundLayer.putTileAtWorldXY(2, 200, 50);

      // There are also methods for converting from tile grid units to world pixel
      // coordinates and vice versa:  worldToTileXY, tileToWorldXY.
   }

   update() {
      // Convert the mouse position to world position within the camera
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

      // Draw tiles (only within the groundLayer)
      if (this.input.manager.activePointer.isDown) { // If the mouse is down
         this.groundLayer.putTileAtWorldXY(353, worldPoint.x, worldPoint.y)
      }

   }
}
