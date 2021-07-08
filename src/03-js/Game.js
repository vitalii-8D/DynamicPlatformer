import * as Phaser from "phaser";
import Player from "./Player";
import MouseTileMaker from "./MouseTileMaker";

export default class Game extends Phaser.Scene {
   isPlayerDead;
   groundLayer;
   shiftKey;
   controls;
   spikeGroup;
   player;
   marker;

   preload() {
      this.load.spritesheet('player', './src/assets/spritesheets/0x72-industrial-player-32px-extruded.png',
         {
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
         });
      this.load.image('spike', './src/assets/images/0x72-industrial-spike.png')
      this.load.image('tiles', './src/assets/tilesets/0x72-industrial-tileset-32px-extruded.png');
      this.load.tilemapTiledJSON('tilemap', './src/assets/tilemaps/platformer.json')
   }

   create() {
      this.isPlayerDead = false;

      const map = this.make.tilemap({key: 'tilemap'});
      const tileset = map.addTilesetImage('0x72-industrial-tileset-32px-extruded', 'tiles');

      map.createDynamicLayer("Background", tileset);
      this.groundLayer = map.createDynamicLayer("Ground", tileset);
      map.createDynamicLayer("Foreground", tileset);

      // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
      const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn Point');
      this.player = new Player(this, spawnPoint.x, spawnPoint.y);

      // Collide the player against the ground layer - here we are grabbing the sprite property from
      // the player (since the Player class is not a Phaser.Sprite).
      this.groundLayer.setCollisionByProperty({collides: true})
      this.physics.world.addCollider(this.player.sprite, this.groundLayer); // Instead of physics.add.collider()

      // The map contains a row of spikes. The spike only take a small sliver of the tile graphic, so
      // if we let arcade physics treat the spikes as colliding, the player will collide while the
      // sprite is hovering over the spikes. We'll remove the spike tiles and turn them into sprites
      // so that we give them a more fitting hitbox.
      this.spikeGroup = this.physics.add.staticGroup();
      this.groundLayer.forEachTile(tile => {
         if (tile.index === 77) {
            // A sprite has its origin at the center, so place the sprite at the center of the tile
            const x = tile.getCenterX();
            const y = tile.getCenterY();
            const spike = this.spikeGroup.create(x, y, 'spike');

            // The map has spike tiles that have been rotated in Tiled ("z" key), so parse out that angle
            // to the correct body placement
            spike.rotation = tile.rotation;
            if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
            else if (spike.angle === -90) spike.body.setSize(6, 32).setOffset(26, 0);
            else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);

            // And lastly, remove the spike tile from the layer
            this.groundLayer.removeTileAt(tile.x, tile.y);
         }
      })

      this.cameras.main.startFollow(this.player.sprite);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

      this.marker = new MouseTileMaker(this, map);

      // Help text that has a "fixed" position on the screen
      this.add
         .text(16, 16, "Arrow/WASD to move & jump\nLeft click to draw platforms", {
            font: "18px monospace",
            fill: "#000000",
            padding: {x: 20, y: 10},
            backgroundColor: "#ffffff"
         })
         .setScrollFactor(0);

      // Adding the debug graphic
      const debugGraphic = this.add.graphics().setAlpha(0.2);
      this.groundLayer.renderDebug(debugGraphic, {
         tileColor: null,
         collidingTileColor: new Phaser.Display.Color(243, 234, 45, 255),
         faceColor: new Phaser.Display.Color(40, 39, 37, 255)
      });

   }//**  create() {}

   update(time, dt) {
      if (this.isPlayerDead) return;

      this.player.update();
      this.marker.update();

      // Add a colliding tile at the mouse position
      const pointer = this.input.activePointer;
      const worldPoint = pointer.positionToCamera(this.cameras.main);

      if (pointer.isDown) {
         // Do not allow to draw over other ground tiles tiles.
         const tileAtPoint = this.groundLayer.getTileAtWorldXY(worldPoint.x, worldPoint.y);
         if (tileAtPoint) return;

         if (this.shiftKey.isDown) {
            this.groundLayer.removeTileAtWorldXY(worldPoint.x, worldPoint.y);
         } else {
            const tile = this.groundLayer.putTileAtWorldXY(6, worldPoint.x, worldPoint.y);
            tile.setCollision(true);
         }
      }

      if (this.player.sprite.y > this.groundLayer.height ||
         this.physics.world.overlap(this.player.sprite, this.spikeGroup)
      ) {
         // Flag that the player is dead so that we can stop update from running in the future
         this.isPlayerDead = true;

         const cam = this.cameras.main;
         cam.shake(1000, 0.05);
         cam.fade(2500, 20, 20, 20);

         // Freeze the player to leave them on screen while fading but remove the marker immediately
         this.player.freeze();
         this.marker.destroy();

         cam.once('camerafadeoutcomplete', () => {
            this.player.destroy();
            this.scene.restart();
         })
      }
   }

   // Tiles have other useful properties & methods. tile.x and tile.y are the position in grid units. tile.getLeft(),
   // tile.getBottom(), tile.getCenterX(), etc. will give you the position in world pixel units.

   // Tilemaps have methods for turning Tiled objects and tiles
   // into sprites: createFromObjects & createFromTiles respectively.

}
