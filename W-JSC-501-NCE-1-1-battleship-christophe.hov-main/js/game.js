/*jslint browser this */
/*global _, player, computer, utils */
(function () {
    "use strict";
    // var audioToucher = new Audio('221.mp3');
    // var audioAqua = new Audio('9677.mp3');
    // var audioTir = new Audio('9334.mp3');
    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",


        begins: Math.round(Math.random()+1),
        compteurMarque: 1,
        currentPhase: "",
        phaseOrder: [],
        nextTries: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,


        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,


        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,


        // liste des joueurs
        players: [],



        // lancement du jeu
        init: function () {
            this.nextTries = [0, 0];
            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');


            // défini l'ordre des phase de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 0;


            // initialise les joueurs
            this.setupPlayers();


            // ajoute les écouteur d'événement sur la grille
            this.addListeners();


            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);
            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];


            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;


            if (ci < this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[4];
            }
            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[1];
                        this.goNextPhase();
                    }
                    break;
                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.currentPhase = this.phaseOrder[this.begins];
                    this.players[1].isShipOk(function () {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    //console.log('salut');
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play();
                    break;
            }


        },
        gameIsOver: function () {
            if(this.players[0].gameOver === 17) {
                utils.info("GameOver");
                return true;
            } else if (this.players[1].gameOver === 17) {
                utils.info("Win");
                return true;
            }
            return false;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.handleRightClick, this));
        },

        handleMouseMove: function (e) {
            e.preventDefault();
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    if(this.players[0].orientation === 'Verticale'){

                        this.grid.appendChild(ship.dom);
                    }
                    else {
                        this.grid.appendChild(ship.dom);
                    }

                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                if(ship.getId() === 3 && this.players[0].orientation === 'Verticale') {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) + 30 +"px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + 30 + "px";
                }  else {
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + (this.players[0].activeShip) * 60) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                }
            }
        },
        handleClick: function (e) {
            e.preventDefault();
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;
            var lineR = this.nextTries[0];
            var colR = this.nextTries[1];
            if(document.querySelectorAll('.main-grid>.row:nth-of-type('+(lineR+1)+')>.cell:nth-of-type('+(colR+1)+')').item(0).style.backgroundColor === 'blue') {
                document.querySelectorAll('.main-grid>.row:nth-of-type('+(lineR+1)+')>.cell:nth-of-type('+(colR+1)+')').item(0).style.backgroundColor = '';
            }
            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if ((this.players[0].orientation === 'Horizontale'
                            && this.players[0].verifShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))
                            && this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode)))
                        || (this.players[0].orientation === 'Verticale'
                            && this.players[0].verifShipPositionRight(utils.eq(e.target), utils.eq(e.target.parentNode))
                            && this.players[0].setActiveShipPositionRight(utils.eq(e.target), utils.eq(e.target.parentNode)))) {
                        // on passe au bateau suivant
                            this.players[0].orientation = 'Horizontale';
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                var lineR = self.nextTries[0];
                                var colR = self.nextTries[1];
                                if(document.querySelectorAll('.main-grid>.row:nth-of-type('+(lineR+1)+')>.cell:nth-of-type('+(colR+1)+')').item(0).style.backgroundColor === 'blue') {
                                    document.querySelectorAll('.main-grid>.row:nth-of-type('+(lineR+1)+')>.cell:nth-of-type('+(colR+1)+')').item(0).style.backgroundColor = '';
                                }
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                var radios = document.getElementsByName('begins');
                                for (var i = 0, length = radios.length; i < length; i++) {
                                    if (radios[i].checked) {
                                        // do whatever you want with the checked radio
                                        if(radios[i].value >= 1 && radios[i].value <= 3) {
                                            if(radios[i].value === 3) {
                                                self.begins = Math.round(Math.random()+1);
                                            } else {
                                                self.begins = radios[i].value;
                                            }
                                        }
                                        // only one radio can be logically checked, don't check the rest
                                        break;
                                    }
                                }
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                    self.renderMap();
                }
            }
        },

        handleRightClick: function(e) {
            e.preventDefault();
            var ship = this.players[0].fleet[this.players[0].activeShip];
            if(this.players[0].orientation === 'Verticale') {
                this.players[0].orientation = 'Horizontale';
                ship.dom.style.transform = 'rotate(0deg)';

            } else {
                this.players[0].orientation = 'Verticale';
                ship.dom.style.transform = 'rotate(90deg)';
            }


            return true;
        },

        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";


            // determine qui est l'attaquant et qui est attaqué

            var target = (this.players.indexOf(from) === -1)
                ? this.players[0]
                : this.players[1];
            var expediteur = (this.players.indexOf(from) === -1)
                ? this.players[1]
                : this.players[0];
            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                this.currentPhase = this.phaseOrder[3];
                msg += "Votre adversaire vous a... ";
            }


            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                if (hasSucceed) {
                    setTimeout(function () {
                        if(target.role === 1) {
                            if(document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor === 'red') {
                                msg += "encore ";
                            } else {
                                //    console.log(target.gameOver);
                                target.gameOver += 1;
                            }
                            document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'red';
                        } else if(target.role === 0) {
                            document.querySelectorAll('.mini-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'red';
                            var id = target.grid[line][col] - 1;
                            target.fleet[id].life -= 1;
                            if(target.fleet[id].life <= 0) {
                                document.querySelectorAll('.fleet>*')[id].className += ' sunk';
                            }
                            target.grid[line][col] = null;
                            target.gameOver += 1;
                        }
                        msg += "Touché !";
                        utils.info(msg);


                        // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                        // pour transmettre à l'attaquant le résultat de l'attaque
                        callback(hasSucceed);


                        // on fait une petite pause avant de continuer...
                        // histoire de laisser le temps au joueur de lire les message affiché

                        setTimeout(function () {
                            self.stopWaiting();
                            self.goNextPhase();
                        }, 1000);
                    }, 1000);
                } else {
                    setTimeout(function () {


                        if(target.role === 1) {
                            if(document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor === 'grey') {
                                msg += "encore ";
                            } else {
                                //  console.log(target.gameOver);
                            }
                            document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'grey';
                        } else if(target.role === 0) {
                            document.querySelectorAll('.mini-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'grey';
                        }
                        msg += "Manqué...";
                        utils.info(msg);


                        // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                        // pour transmettre à l'attaquant le résultat de l'attaque
                        callback(hasSucceed);


                        // on fait une petite pause avant de continuer...
                        // histoire de laisser le temps au joueur de lire les message affiché

                        setTimeout(function () {
                            self.stopWaiting();
                            self.goNextPhase();
                        }, 1000);
                    }, 1000);
                }
            });


        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            document.getElementsByClassName("mini-grid").item(0).innerHTML = document.getElementsByClassName('main-grid').item(0).innerHTML;
            document.getElementsByClassName("mini-grid").item(0).style.marginTop = "-210px";
        }
    };


    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });


}());