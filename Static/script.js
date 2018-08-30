//(function() {
$(function () {
    //Global variables
    var boardArray = null;
    var player = 1;
    var newTurn = 1;
    var countPieces1 = '';
    var countPieces2 = '';
    var countTiles = 0;
    var xposNew = '';
    var yposNew = '';
    var xposOld = '';
    var yposOld = '';
    var xposEat = '';
    var yposEat = '';
    var thisKing = '';
    var lightN = '';
    var darkN = '';


    /******
     *
     * Start socket io
     *
     * *****/

    var socket = io();
    var username;

    /*****
     * dynamic array 8*8, 10*10, 12*12
     * ****/

    $("#start").on("click", function () {
        socket.emit('board size', $('#size').val());
    });

    /****
     * Resign from the current game
     * ****/

    $("#cleargame").on("click", function () {
        socket.emit('reset');
    });

    socket.on('reset', function () {
        location.reload();
    });

    /****
     * Sign In
     * ****/

    $('#signIn').on("click", function () {
        username = document.getElementById("uName").value; //SEND TO TO THE SERVER
        //document.getElementById("DarkPlayer").innerHTML = WHATEVER HAS BEEN RETRIEVED FROM THE SERVER;
        //console.log(username);
        socket.emit('changeUserName', username);

        $("#login").hide();
        $(".column1").show();

    });


    socket.on('setUserName', function (darkName, lightName) {
        darkN = darkName;
        lightN = lightName;
        document.getElementById("darkPlayer").innerHTML = darkName;
        document.getElementById("lightPlayer").innerHTML = lightName;
    });

    socket.on('login', function (msg) {
        //console.log(data)
        usersOnline = msg.users;
        updateUserList();
        myGames = msg.games;
        updateGamesList();
    });

    /****
     * Initalize Board
     * ****/

    socket.on('board size', function (data) {
        $("#size").hide();
        $("#board").show();
        //console.log(data);
        initBoard(data);
    });


    /******
     * Refresh Board
     * *****/
    socket.on('refresh', function (data) {
        //console.log(data);
        refreshBoard(data);
    });

    /*****
     * Player Turn
     * *****/
    socket.emit('playerTurn',);


    var recievedPlayer = false;
    socket.on('newPlayer', function (data) {
        if (recievedPlayer == false) {
            player = JSON.parse(data);
            console.log("the player" + player);
            recievedPlayer = true;
        }
    });

    socket.on('giveTurn', function (data) {
        //console.log(data);
        newTurn = data;
        colorChange();
    });


    /*****
     * Start callback functions and checker rules
     * *****/
    //initialize board function
    function initBoard(array) {
        boardArray = JSON.parse(array);

        var table = $('<table></table>');
        for (var x = 0; x < boardArray.length; x++) {
            var row = $('<tr></tr>');
            for (var y = 0; y < boardArray[x].length; y++) {
                var col = $('<td></td>').css({
                    "width": "60px",
                    "height": "60px",
                    "background-color": "#a6a2a2",
                    "border-color": "collapse"
                });
                col.attr('xpos', x);
                col.attr('ypos', y);
                if (x % 2 == 0) {
                    if (y % 2 == 1) {
                        col.css("background-color", "#847577");
                        col.attr({
                            'id': countTiles,
                            'class': 'tile',
                            "xpos": x,
                            'ypos': y
                        });
                        countTiles++;
                        if (x < (boardArray.length / 2 - 1)) {
                            //bottom player: pieceID: 12 - 23
                            col.css("background-color", "#847577").append("<div class='piece' id='" + countPieces1 + "' style='background-color: #565264'></div>");
                            countPieces1++;
                        }
                        if (x > boardArray.length / 2) {
                            col.css("background-color", "#847577").append("<div class='piece' id='" + countPieces2 + "' style='background-color: white'></div>");
                            countPieces2++;
                        }

                        if ((x == (boardArray.length / 2) - 1) || (x == boardArray.length / 2)) {
                            col.css("background-color", "#847577").append("<div class='piece' style='display:none'></div>");
                        }
                    }
                }
                if (x % 2 == 1) {
                    if (y % 2 == 0) {
                        col.css("background-color", "#847577");
                        col.attr({
                            'id': countTiles,
                            'class': 'tile',
                            "xpos": x,
                            'ypos': y
                        });
                        countTiles++;
                        if (x < (boardArray.length / 2 - 1)) {
                            //bottom player: pieceID: 12 - 23
                            col.css("background-color", "#847577").append("<div class='piece' id='" + countPieces1 + "' style='background-color: #565264'></div>");
                            countPieces1++;
                        }
                        if (x > boardArray.length / 2) {
                            col.css("background-color", "#847577").append("<div class='piece' id='" + countPieces2 + "' style='background-color: white'></div>");
                            countPieces2++;
                        }
                        if ((x == boardArray.length / 2 - 1) || (x == boardArray.length / 2)) {
                            col.css("background-color", "#847577").append("<div class='piece' style='display:none'></div>");
                        }
                    }
                }
                row.append(col);
            }
            table.append(row);
        }

        $("#board").append(table);
        colorChange();

        $('.piece').on("click", onPieceClick);
        $('.tile').on('click', onTileClick);


        console.log("tiles: " + countTiles + ", pieces black: " + countPieces1 + "piece white: " + countPieces2);
    }; //end of initBoard


    //refresh board function
    function refreshBoard(data) {
        countPieces1 = 0;
        countPieces2 = 0;
        boardArray = JSON.parse(data);
        console.log("refreshed board");

        $('.piece').remove();
        $('table tr td').each(function () {
            //console.log("here i am modifying css");
            let piece = $(this);
            var x = parseInt(piece.attr('xpos'));
            var y = parseInt(piece.attr('ypos'));

            if (boardArray[x][y] === 1) {
                piece.append("<div class='piece'  id='" + countPieces1 + "' style='background-color: #565264'></div>");
                countPieces1++;
            }
            if (boardArray[x][y] === 2) {
                piece.append("<div class='piece'  id='" + countPieces2 + "' style='background-color: white'></div>");
                countPieces2++;
            }
            if (boardArray[x][y] === 11) {
                piece.append("<div class='piece'  id='" + countPieces1 + "' style='background-color:#565264; border: 5px solid #ab808c' ></div>");
                countPieces1++;
            }
            if (boardArray[x][y] === 12) {
                piece.append("<div class='piece'  id='" + countPieces2 + "' style='background-color:white; border: 5px solid #ab808c' ></div>");
                countPieces2++;
            }
        });
        endScreen();
        $('.piece').on("click", onPieceClick);
        $('.tile').on('click', onTileClick);
        colorChange();
    };

    //initialise log in
    //function playerLogin() {
    $('#login').on('click', function () {
        username = $('#username').val();

        if (username && username.length > 0) {
            $('#userLabel').text(username);
            socket.emit('login', username);

            $('#page-login').hide();
            $('#page-lobby').show();
        }
    });

    $('#game-back').on('click', function () {
        socket.emit('login', username);

        $('#page-game').hide();
        $('#page-lobby').show();
    });

    $('#game-resign').on('click', function () {
        socket.emit('resign', {
            userId: username,
            gameId: serverGame.id
        });

        socket.emit('login', username);
        $('#page-game').hide();
        $('#page-lobby').show();

    });
    //}


    //select the piece function
    function onPieceClick() {
        // console.log("working..");
        var selected;
        var king = false;
        let piece = $(this);
        var x = parseInt(piece.parent().attr('xpos'));
        var y = parseInt(piece.parent().attr('ypos'));

        if (newTurn != player) {
            console.log("balialalalalal");
            console.log("newturn " + newTurn);
            console.log("player " + player);
            return false;
        }


        var changePlayersTurn = parseInt(boardArray[x][y]) % 10;
        // console.log(x+" , "+y);
        console.log("change player turn to: " + changePlayersTurn);

        if (changePlayersTurn == player) { //make sure selected the right player?pieces
            if ($(this).hasClass('selected')) selected = true; // if one piece is selected, remove selected from all other pieces
            $('.piece').each(function (index) {
                $('.piece').eq(index).removeClass('selected')
            });
            if (!selected) {
                $(this).addClass('selected'); //if the piece is not marked as selected, when selected add a "selected"
            }
        } else return false;


        thisKing = king;

        xposOld = x; //give value to manipulate global variable
        yposOld = y;
        console.log("player: " + player);

    }

    //select the tile to move function
    function onTileClick() {
        let pieceinTile = $(this);
        var x = parseInt(pieceinTile.attr('xpos'));
        var y = parseInt(pieceinTile.attr('ypos'));
        xposNew = x;
        yposNew = y;


        if ($('.selected').length != 0) {
            console.log("isking? " + thisKing);

            if (validToMove(boardArray[xposNew][yposNew]) && checkMoveDirection(thisKing)) {
                //multiple jumps
                if (inRange() == 'jump') {
                    pieceJump(thisKing);
                    console.log("jump");
                    endScreen();
                } else if (inRange() == 'regular') {
                    pieceMove(thisKing);
                    console.log("move");
                    endScreen();
                }
            }
        }
        console.log(xposNew + ',' + yposNew);
    };


    //validate move function
    function validToMove(value) {
        if (value == 0) { //0 means no pieces occupied
            return true;
        }
        return false;
    };


    function checkMoveDirection(king) {

        console.log("player: " + player);

        if (boardArray[xposOld][yposOld] === 1 && king === false) { //cannot move backwards
            if (xposNew < xposOld) {
                console.log("Cant move");
                return false;
            }
        } else if (boardArray[xposOld][yposOld] === 2 && king === false) { //cannot move backwards
            if (xposNew > xposOld) {
                console.log("Cant move");
                return false;
            }
        }
        return true;
    };


    function inRange() {
        if (Math.abs((parseInt(xposNew) - parseInt(xposOld))) == 1) {
            return 'regular';
        } else if ((Math.abs((parseInt(xposNew) - parseInt(xposOld))) == 2) && yposNew != yposOld) {
            return 'jump';
        }
    };


    //moves the piece
    function pieceMove(king) {

        $('.piece').removeClass('selected');

        takeTurn();

        if ((king === false && player === 1 && xposNew === boardArray.length - 1) || boardArray[xposOld][yposOld] === 11) { // && validToMove(boardArray[xposNew][yposNew]) f reach the bottom or top make a king
            boardArray[xposNew][yposNew] = 11;
            boardArray[xposOld][yposOld] = 0;
            // console.log("king array " + boardArray[xposNew][yposNew]);
            socket.emit('newArray', boardArray);

        } else if ((king === false && player === 2 && xposNew === 0) || boardArray[xposOld][yposOld] === 12) { //if reach the bottom or top make a king
            boardArray[xposNew][yposNew] = 12;
            boardArray[xposOld][yposOld] = 0;
            //console.log("is piece in " + xposNew + " isKing: " + thisKing);
            socket.emit('newArray', boardArray);
        } else {

            // swap array positions (new and old)
            boardArray[xposOld][yposOld] = 0;
            boardArray[xposNew][yposNew] = player;
            console.log(xposNew + " , " + yposNew);

            socket.emit('newArray', boardArray);
            //console.log("turn"+newTurn);


        }
        socket.emit('changedTurn', newTurn); //send to turn to server
        return true;
    };


    function pieceJump() {
        takeTurn();
        console.log("working");
        xposEat = parseInt((xposOld + xposNew) / 2);
        yposEat = parseInt((yposOld + yposNew) / 2);
        //checkMoveDirection();
        //must be in bounds
        if (xposNew > boardArray.length - 1 || yposNew > boardArray.length - 1 || xposNew < 0 || yposNew < 0) return false;
        console.log("woking");

        if (boardArray[xposEat][yposEat] === 0) return false;

        //if there is a piece there and there is no piece in the space after that
        if (boardArray[xposEat][yposEat] != player) {
            boardArray[xposOld][yposOld] = 0;
            boardArray[xposEat][yposEat] = 0;
            boardArray[xposNew][yposNew] = player;
            console.log("mid value now " + xposEat + "," + yposEat + "," + boardArray[xposEat][yposEat]);
            console.log("old value now " + xposOld + "," + yposOld + "," + boardArray[xposOld][yposOld]);
            console.log("new value now " + xposNew + "," + yposNew + "," + boardArray[xposNew][yposNew]);
        }

        console.log(boardArray);
        socket.emit('newArray', boardArray);
        socket.emit('changedTurn', newTurn); //send to turn to server
        return true;
    };


    function takeTurn() {
        if (newTurn == 1 && validToMove(boardArray[xposNew][yposNew])) {
            newTurn = 2;

        } else if (newTurn == 2 && validToMove(boardArray[xposNew][yposNew])) {
            newTurn = 1;
        }

    }

    function endScreen() {
        // player 2 won
        if (countPieces2 === 0) {
            $(".result").text("Player " + darkN  + " won by " + countPieces1 + " pieces!").show();
            $("#board").css("opacity", "0.3");
            socket.emit('winning count', countPieces2);
        }
        // player 1 won
        else if (countPieces1 === 0) {
            $("#result").text("Player " + lightN+ "won by " + countPieces2 + " pieces!").show();
            $("#boardSize").css("opacity", "0.3");
            socket.emit('winning count', countPieces1);
        }
    }


    //change the color of player turn function
    function colorChange() {
        if (newTurn == 1) {
            $('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
        } else {
            $('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%)");
        }
    };

    // function scoreBoard(){
    //
    //     $("#leader").show();
    //
    //     var localStorage = window.localStorage;  //create local storage to capture caches
    //     var scoreBoard = [];
    //     socket.on('sent score', function(data) {
    //         scoreBoard = scoreBoard ? scoreBoard : [];
    //         scoreBoard.push({"name": username.value, "score": "$" + corrAnswer});
    //
    //     });
    //
    //     socket.on('setUserName', function(darkName, lightName) {
    //         darkN = darkName;
    //         lightN = lightName;
    //         document.getElementById("darkPlayer").innerHTML = darkName;
    //         document.getElementById("lightPlayer").innerHTML = lightName;
    //     });
    //
    //     scoreBoard = scoreBoard ? scoreBoard : [];
    //     scoreBoard.push({"name": username.value, "score": "$" + corrAnswer});
    //     localStorage.setItem("scoreBoard", JSON.stringify(scoreBoard));
    //     //Sort score from the largest to smallest
    //     scoreBoard.sort(function (a, b) {
    //         for (var i = 0; i < scoreBoard.length; i++) {
    //             var scoreA = a.score;
    //             var scoreB = b.score;
    //             return (scoreA > scoreB) ? -1 : (scoreA < scoreB) ? 1 : 0;
    //         }
    //     });
    // };


    //24 pieces in a checkers game

    //piece reaches the bottom to be a king
    // this.king = false;
    // this.makeKing = function () {
    //     this.element.css("border", "1vmin solid #ab808c"); //add a pink ring on the piece
    //     this.king = true;
    //
    // }

    // //moves the piece
    // this.move = function (tile) {
    //     var id = this.element.selector.split("#")[1];
    //     if (parseInt(id) < countPieces / 2)
    //         player = 1;
    //     else
    //         player = 2;
    //
    //     this.element.removeClass('selected');
    //     if (!validToMove(boardArray[xposNew][yposNew])) return false;
    //     //no backward move unless "Kinged"
    //     console.log("thisplayer:")
    //     console.log(player)
    //
    //     if (player == 1 && this.king == false) {
    //         if (tile.position[0] < this.position[0]) return false;
    //
    //     }
    //     else if (player == 2 && this.king == false) {
    //         if (tile.position[0] > this.position[0]) return false;
    //     }
    //     //remove the mark from board
    //     //console.log("moving")
    //     boardArray[xposOld][yposOld] = 0;
    //     boardArray[xposNew][yposNew] = player;
    //     this.position = [xposNew, yposNew];
    //     console.log(this.position);
    //     console.log(xposNew+" , "+yposNew);
    //
    //     //change the css
    //     //this.element.detach().appendTo('#'+this.id);
    //
    //     //this.element.appendTo('.tile').attr('#'+this.tile.element.selector);
    //     //this.element.css('left', dictionary[this.position[1]]);
    //     //crown a king
    //     if (!this.king && (this.position[0] == 0 || this.position[0] == 7)) //if reach the bottom or top make a king
    //         this.makeKing();
    //     //Board.changePlayerTurn();
    //     return true;
    // };


    //tests if an opponent jump can be made to a specific place


    //tests if piece can jump anywhere
    // this.canJumpAny = function() {
    //   if (this.canOppJump([this.position[0] + 2, this.position[1] + 2]) ||
    //     this.canOppJump([this.position[0] + 2, this.position[1] - 2]) ||
    //     this.canOppJump([this.position[0] - 2, this.position[1] + 2]) ||
    //     this.canOppJump([this.position[0] - 2, this.position[1] - 2])) {
    //     return true;
    //   }
    //   return false;
    // };

    // function opponentJump(){
    //     var pieceToRemove = this.canOppJump(tile.position);
    //
    //     if (pieceToRemove) {
    //         pieces[pieceID].remove();
    //         return true;
    //     }
    //     return false;
    // };
    //
    // this.remove = function() {
    //   //remove it and delete it from the gameboard
    //   this.element.css("display", "none");
    //   if (player == 1) {
    //     $('#player2').append("<div class='capturedPiece'></div>");
    //     countRemove1++;
    //     console.log("player 1 lost : " + countRemove1 + " piece(s)"); //my own reference
    //   }
    //   if (player == 2) {
    //     $('#player1').append("<div class='capturedPiece'></div>");
    //     countRemove2++;
    //     console.log("player 2 lost : " + countRemove2 + " piece(s)"); //my own reference
    //   }
    //   boardArray[this.position[0]][this.position[1]] = 0;
    //   //reset position
    //   this.position = [];


    //end of jquery document ready
});
