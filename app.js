//define express and socket
var express = require('express');
var app = express();
app.use(express.static('Static'));
var server = require('http').Server(app);
var port = process.env.PORT || 8080;
var io = require('socket.io')(server);

//global variable
var board = [];
var leader = [];

var users=new Map();

class User {
    constructor(nickname, score) {
        this.nickname = nickname;
        this.score = score;
    }
}


/****
 *
 * Start socket.io
 *
 * ***/

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/Static/index.html');
});

server.listen(port, function(){
    console.log('listening on: ' + port);
});


//Start a connection
io.on('connection', function (socket) {

    //initialize dynamic board size
    socket.on('board size', function(data){
    if(users.size <=2){
        console.log("new connection");
        io.sockets.emit('board size', JSON.stringify(boardArray(data,data)));
    }});

    //add a new user
    console.log("other connection");
    socket.on('playerTurn', function(data){
        users.set(socket.id, new User('', 0));
        console.log(users.size);
        socket.emit('newPlayer', JSON.stringify(users.size));
    });

    //Add a user nickname
    socket.on('changeUserName', function(username) {
        users.get(socket.id).nickname = username;
        var usernames = [];
        for (var user of users.values()) {
            usernames.push(user.nickname);
        }
        io.sockets.emit('setUserName', ...usernames); //
    });

    //Resign from the game and restart a new one
    socket.on('reset', function(){
            users.clear();
            io.sockets.emit('reset');
    });

    //change user turns
    socket.on('changedTurn', function(data){
        socket.emit('giveTurn', JSON.stringify(data));
        socket.broadcast.emit('giveTurn', JSON.stringify(data));

    });

    //refersh the new array
    socket.on('newArray', function(data){
        console.log("refresh");
        board=data;
        socket.emit('refresh', JSON.stringify(board));
        socket.broadcast.emit('refresh', JSON.stringify(board));
        console.log(board);
    });

    // socket.on('winning count', function(userscore) {
    //     users.get(socket.id).score = userscore;
    //     var userscores=[];
    //     for (var user of users.values()) {
    //         userscores.push(user.score);
    //     }
    //     io.sockets.emit('sent score', ...userscores); //
    // });
});


/****
 *
 * functions listed below
 *
 * ****/

function boardArray(row,col){
    board = [];
    for (var i = 0; i < row; i++) {
        board[i] = [];
        for (var j = 0; j < col; j++) {
            board[i][j]=0;
            if (i % 2 == 1 && j % 2 == 0) { //odd rown col
                i < (row/2-1 )? board[i][j] =1:null; //top player:  0 - 11
                i > (row/2)? board[i][j] =2:null;
            }
            if (i % 2 == 0 && j% 2 == 1) {
                i < (row/2-1)? board[i][j] =1:null; //bottom player:  12 - 23
                i > (row/2)? board[i][j] =2:null;
            }
        }
    }
    //console.log('new'+board);
    return board;
}
