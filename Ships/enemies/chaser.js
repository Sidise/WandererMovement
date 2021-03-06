/*
Chasers pursue the player relentlessly with some concept of velocity.

They move stictly towards the player taking the most direct route possible.
*/

const CHASER_WIDTH = 75; //Should match graphic in final.
const CHASER_HEIGHT = 75; //Should match graphic in final.

const CGW_CENTER = CHASER_WIDTH / 2; //Measures center of graphic, x-value.
const CGH_CENTER = CHASER_HEIGHT / 2; //Center of graphic, y-value.

const CHASER_RADIUS = 17.5; //Size of Chaser bounding circle.
const CHASER_MOVE_RATE = 12.5; //Speed at which Chaser moves.
const CHASER_FRICTION = 0.97; //Rate at which Chaser loses speed. Lower = slower.


class Chaser {
    constructor(game) {
        //Initialize element.
        this.game = game;
        this.imageAsset = ASSET_MANAGER.getAsset("./Ships/gfx/Chaser.svg"); //Messy hardcode, fix later.
        this.player = this.fetchPlayer(game);
        console.log(this.player);

        this.x = 100;
        this.y = 100;
        this.dX = 0;
        this.dY = 0;
        this.xCenter = 0;
        this.yCenter = 0;
        this.updateCenter();
        this.BoundingCircle = new BoundingCircle(CHASER_RADIUS, this.xCenter, this.yCenter);



        this.playerX = 0;
        this.playerY = 0;


    }

    draw(ctx) {
        var myCanvas = document.createElement('canvas');
        myCanvas.width = CHASER_WIDTH;
        myCanvas.height = CHASER_HEIGHT;
        var myCtx = myCanvas.getContext('2d');
        myCtx.save();
        myCtx.translate(CGW_CENTER, CGH_CENTER); //This should go to the center of the object.
        this.angle = this.rotateHandle();
        myCtx.rotate(this.angle);
        myCtx.translate(-(CGW_CENTER), -(CGH_CENTER));
        myCtx.drawImage(this.imageAsset, 12, 12);
        myCtx.restore();

        ctx.drawImage(myCanvas, this.x, this.y);

        //Debug to show bounding circle, keep out of final release.
        ctx.beginPath();
        ctx.arc(this.BoundingCircle.xCenter, this.BoundingCircle.yCenter, CHASER_RADIUS, 0, 2 * Math.PI, false);
        ctx.stroke();
    }

    update() {

        //First - have we been shot?
        this.checkIfShot();

        //Is the player dead?
        if (this.player.dead) {
            this.removeFromWorld = true;
        }

        //Get player's location.
        this.playerX = this.player.xCenter;
        this.playerY = this.player.yCenter;
        //Get current location.
        this.calcMovement(this.xCenter, this.playerX, this.yCenter, this.playerY);
        this.x += this.dX;
        this.y += this.dY;
        this.dX *= CHASER_FRICTION;
        this.dY *= CHASER_FRICTION;
        this.edgeDetect();
        this.updateCenter();


    }

    /*
    Fetch the player reference from the game manager.
    */
    fetchPlayer(game) {
        var foundPlayer;
        while (typeof foundPlayer === 'undefined') {
            foundPlayer = game.entities.find(entity => entity instanceof PlayerShip);
        }
        return (foundPlayer);
    }

    /*
    Update the Chaser's center.

    For the bounding circle.
    */
    updateCenter() {
        this.xCenter = this.x + CGW_CENTER;
        this.yCenter = this.y + CGH_CENTER;
        this.BoundingCircle = new BoundingCircle(CHASER_RADIUS, this.xCenter, this.yCenter);
    }

    /*
    Calculate the vector that will be used to move the bullets.

    Accomplished through the magic of polar coordinates.
    */
    calcMovement(p1X, p2X, p1Y, p2Y) {
        let effectiveMoveRate = CHASER_MOVE_RATE * this.game.clockTick;
        this.angle = Math.atan2(p2Y - p1Y, p2X - p1X);
        this.dX += Math.cos(this.angle) * effectiveMoveRate;
        this.dY += Math.sin(this.angle) * effectiveMoveRate;
    }

    rotateHandle() {
        if (this.player == null) {
            return (0); //If player doesn't exist, don't rotate.
        }

        var dx = (this.playerX) - (this.x + CGW_CENTER); //Accounting for difference in center of thing.
        var dy = (this.playerY) - (this.y + CGH_CENTER);

        return (Math.atan2(dy, dx) + (Math.PI / 2));
    }

    /*
    Has this enemy been shot?

    If so, this enemy is removed from the game world.
    */
    checkIfShot() {
        var that = this;

        this.game.entities.forEach(function (entity) {
            /*
            Check if thing has bounding circle.
            If so, make sure it's not the player.
            If that's true, actually detect collision.
            */
            if (!(typeof entity.BoundingCircle === 'undefined') && (entity instanceof Bullet)
                && (entity.parent == "Player") &&entity.BoundingCircle && that.BoundingCircle.collide(entity.BoundingCircle)) {
                entity.removeFromWorld = true;
                that.removeFromWorld = true;
            }
        })
    }

    collideLeft() {
        return ((this.xCenter - CHASER_RADIUS) < 0)
    }

    collideRight() {
        return ((this.xCenter + CHASER_RADIUS) > GAME_WORLD_WIDTH)
    }

    collideUp() {
        return ((this.yCenter - CHASER_RADIUS) < 0)
    }

    collideDown() {
        return ((this.yCenter + CHASER_RADIUS) > GAME_WORLD_HEIGHT)
    }

    edgeDetect() {
        if (this.collideLeft() || this.collideRight()) {
            this.x += (this.collideLeft() ? 1 : -1);
            this.dX *= -0.1;
        }

        if (this.collideUp() || this.collideDown()) {
            this.dY *= -0.1;
        }
    }

}