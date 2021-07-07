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

      // -----  Put tile index 1 at tile grid location (20, 10) within layer
      // this.groundLayer.putTileAt(1, 20, 10);

      // -----  Put tile index 2 at world pixel location (200, 50) within layer
      // -----  (This uses the main camera's coordinate system by default)
      // this.groundLayer.putTileAtWorldXY(2, 200, 50);

      // -----  There are also methods for converting from tile grid units to world pixel
      // -----  coordinates and vice versa:  worldToTileXY, tileToWorldXY.

      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

      const cursors = this.input.keyboard.createCursorKeys();
      const controlConfig = {
         camera: this.cameras.main,
         left: cursors.left,
         right: cursors.right,
         up: cursors.up,
         down: cursors.down,
         speed: 0.5
      }

      this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

      // Limit the camera to the map size
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      // Create a simple graphic that can be used to show which tile the mouse is over
      this.marker = this.add.graphics();
      this.marker.lineStyle(5, 0xffffff, 1);
      this.marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
      this.marker.lineStyle(3, 0xff4f78, 1);
      this.marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

      // Help text that has a "fixed" position on the screen
      this.add
         .text(16, 16, "Arrow keys to scroll\nLeft-click to draw tiles\nShift + left-click to erase", {
            font: "18px monospace",
            fill: "#000000",
            padding: { x: 20, y: 10 },
            backgroundColor: "#ffffff"
         })
         .setScrollFactor(0);

   }

   update(time, delta) {
      this.controls.update(delta);

      // Convert the mouse position to world position within the camera
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

      // -----   Draw tiles (only within the groundLayer)
      // if (this.input.manager.activePointer.isDown) { // If the mouse is down
      //    this.groundLayer.putTileAtWorldXY(353, worldPoint.x, worldPoint.y)
      // }

      // Place the marker in world space, but snap it to the tile grid. If we convert world -> tile and
      // then tile -> world, we end up with the position of the tile under the pointer
      const pointerTileXY = this.groundLayer.worldToTileXY(worldPoint.x, worldPoint.y);
      const snappedWorldPoint = this.groundLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
      this.marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);

      // Draw or erase tiles (only within the groundLayer)
      if (this.input.manager.activePointer.isDown) {
         if (this.shiftKey.isDown) {
            this.groundLayer.removeTileAtWorldXY(worldPoint.x, worldPoint.y);
         } else {
            this.groundLayer.putTileAtWorldXY(353, worldPoint.x, worldPoint.y);
         }
      }

   }//  update(time, delta) {}
}
