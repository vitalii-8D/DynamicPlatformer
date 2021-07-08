export default class MouseTileMaker {
   constructor(scene, map) {
      this.map = map;
      this.scene = scene;

      // Create a simple graphic that can be used to show which tile the mouse is over
      this.graphics = scene.add.graphics();
      this.graphics.lineStyle(5, 0xffffff, 1);
      this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
      this.graphics.lineStyle(3, 0xff4f78, 1);
      this.graphics.strokeRect(0, 0, map.tileWidth, map.tileHeight);
   }

   update() {
      // When mouse is down, put a colliding tile at the mouse location
      const pointer = this.scene.input.activePointer;
      const worldPoint = pointer.positionToCamera(this.scene.cameras.main);

      const pointerTileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
      const snappedWorldPoint = this.map.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);

      this.graphics.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
   }

   destroy() {
      this.graphics.destroy();
   }

}
