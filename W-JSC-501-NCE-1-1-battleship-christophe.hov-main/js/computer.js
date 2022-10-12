/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                self.game.fire(this, 0, 0, function (hasSucced) {
                    self.tries[0][0] = hasSucced;
                });
            }, 2000);
        },
        isShipOk: function (callback) {
            var i = 0;
            var j;
            while(i < 4) {
                this.randomOrientation();
                var x = this.randomPos();
                var y = this.randomPos();
                if ((this.orientation === 'Horizontale'
                        && this.verifShipPosition(y, x)
                        && this.setActiveShipPosition(y, x))
                    || (this.orientation === 'Verticale'
                        && this.verifShipPositionRight(y, x)
                        && this.setActiveShipPositionRight(y, x))) {
                    var ship = this.fleet[this.activeShip];
                    this.activateNextShip();
                    i++;
                }
            }
            /*this.fleet[i].forEach(function (ship, i) {
                j = 0;
                while (j < ship.life) {
                    this.grid[i][j] = ship.getId();
                    j += 1;
                }
            }, this);*/

            setTimeout(function () {
                callback();
            }, 500);
            console.log(this.grid);

        },

        randomOrientation: function() {
            var rand = Math.random() * 10;
            if(rand > 4) {
                this.orientation = 'Horizontale';
            } else {
                this.orientation = 'Verticale';
            }
        },
    });

    //random position, random orientation => créer instancier dans isShipOk()

    global.computer = computer;

}(this));