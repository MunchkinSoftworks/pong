// Constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGT = 100;
const WINNING_SCORE = 5;

//valiables that help draw the black canvas.
var canvas; 
var canvasContext;
var showWinScreen = false; // covers the game with a black canvas to help show text after a win.
//variables that control the position of the ball
var ballX = 50;
var ballY = 100;
var ballRadius = 10;
//variables that control the velocity of the ball
var ballSpeedX = 5;
var ballSpeedY = 5;
//variables that control the position of the players paddles
var paddlePlayer1_Y = 250;
var paddlePlayer2_Y = 250;
//canvas refresh rate
var framesPerSecond = 60; 
//variables that keep track of the players scores
var player1Score = 0;
var player2Score = 0;
//variable introduced to help the AI calculate how to move respective to the ball
var deltaY = 0;
// AI dificulty as in pixels the paddle will move with regards to the ball each frame. they higher the number the more difficult the AI. 
var dificultyAI = 6;


window.onload = function(){ //waits until the browser window loads completely before executing the code within
    canvas = document.getElementById("gameCanvas"); //receives the properties from the HTML element id #gameCanvas, mainly the height and width attributes
    canvasContext = canvas.getContext("2d"); //The getContext() method returns an object that provides methods and properties for drawing on the canvas. This reference will cover the properties and methods of the getContext("2d") object, which can be used to draw text, lines, boxes, circles, and more - on the canvas.

    setInterval(function() { //timer funtion in js.
        drawBoth();
    }, 1000/framesPerSecond);
    
    //controlls the position on the mouse for player 1 responding to the position of the mouse
    canvas.addEventListener("mousemove", function(event){
        var mousePos = calculateMousePos(event);
        paddlePlayer1_Y = mousePos.y - (PADDLE_HEIGT/2);
    });
    //event listener that responds to the click to continue when winning screen shows up
    canvas.addEventListener("click", function(){
        if(showWinScreen){
            player1Score = 0;
            player2Score = 0; 
            showWinScreen = false;
        }
    });
};
// function that resets the ball position
function ballReset(){
    if(player1Score >= WINNING_SCORE ||
       player2Score >= WINNING_SCORE){
            showWinScreen = true;
    }
    ballSpeedX = -(ballSpeedX);
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}
//functions that controls the movement of the ball and the AI's paddle
function moveEverything(){
    //check for win screen 
    if(showWinScreen){ //if a player has won then exit moveEverything
        return;
    }
    ballX += ballSpeedX; // each frame ball distance changes by ballSpeedX in the X-axis 
    ballY += ballSpeedY; // each frame ball distance changes by ballSpeedX in the Y-axis 

    playerAI(); //AI for player 2
  
    if (ballX > canvas.width){ // if the positon of the ball is outside the right side of the canvas
        if( ballY > paddlePlayer2_Y && 
            ballY < paddlePlayer2_Y + PADDLE_HEIGT){ // check to see if the ball is within Player 2's paddle range. 
            ballSpeedX = -(ballSpeedX); // reflect the ball on x direction
            // these two lines change the Y speed in regards to how far away from the center of the paddle the ball is hit
            deltaY = ballY - (paddlePlayer2_Y + (PADDLE_HEIGT/2));
            ballSpeedY = deltaY * 0.35;
            //ballSpeedX = (-(ballSpeedX))*(deltaY*0.35);
        } else { // if it is outside the range of the paddle, add score and reset
            player1Score++; // score has to be updated before the ball is reset
            ballReset();
            
        }
    } else if (ballX < 0){ // if the positon of the ball is outside the left side of the canvas
        if( ballY > paddlePlayer1_Y &&
            ballY < paddlePlayer1_Y + PADDLE_HEIGT){ // check to see if the ball is within of Player 1's paddle range.

            ballSpeedX = -(ballSpeedX);
            deltaY = ballY - (paddlePlayer1_Y + (PADDLE_HEIGT/2));
            ballSpeedY = deltaY * 0.35;
        } else { // if it is outside the range of the paddle, add score and reset
            player2Score++;
            ballReset();
        }

    }
    // bouncing the ball off the top and bottom of the screen
    if (ballY > canvas.height){
        ballSpeedY = - ballSpeedY;
    } else if (ballY < 0){
        ballSpeedY = - ballSpeedY;
    }
    
}

function drawBoth (){
    moveEverything();
    drawEverything();
}

function drawEverything(){
    //draw game screen - a black canvas
    drawRectangle(0, 0, canvas.width, canvas.height, "black");

    if(showWinScreen){  // show winning screen if someone wins
        canvasContext.fillStyle = "white";

        if(player1Score >= WINNING_SCORE){
            canvasContext.fillText("Left Player Won!", 360, 200);
        }else if( player2Score >= WINNING_SCORE){
            canvasContext.fillText("Right Player Won!", 360, 200);
        }
        canvasContext.fillText("click to continue", 360, 500);
        return;
    }
    var player1_X = 0; 
    var player2_X = canvas.width - PADDLE_WIDTH;
    
    //draw net
    drawNet();

    // player 1 paddle
    drawRectangle(player1_X, paddlePlayer1_Y, PADDLE_WIDTH,PADDLE_HEIGT, "white");
    // player 2 paddle
    drawRectangle(player2_X, paddlePlayer2_Y, PADDLE_WIDTH,PADDLE_HEIGT, "white");
    //draw ball 
    drawBall(ballX, ballY, ballRadius, "white");
    //player 1 score
    canvasContext.fillText(player1Score, 100, 100);
    //player 2 score
    canvasContext.fillText(player2Score, canvas.width-100, 100);
}

function drawRectangle(offsetX, offsetY, width, height, color){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(offsetX, offsetY, width, height);
}

function drawBall(offsetX, offsetY, circle_radius, color  ){
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(offsetX, offsetY, circle_radius, 0, Math.PI*2, true);
    canvasContext.fill();
}

function calculateMousePos(event){ //calculates the mouse coordinaes as long as they are within the game canvas, regardless of window size of scrolling applied to the browser window.
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = event.clientX - rect.left - root.scrollLeft;
    var mouseY = event.clientY - rect.top - root.scrollTop;
    return {
        x:mouseX,
        y:mouseY
    };
}

function playerAI(){ // AI will react to the position of the ball in the Y-axis each fram
    var paddlePlayer2_Y_Center = paddlePlayer2_Y + (PADDLE_HEIGT/2);
    if(paddlePlayer2_Y_Center < ballY -35 ) { // the number 35 here is a 35 pixel band around the center of the paddle. 
        paddlePlayer2_Y += dificultyAI;
    } else if(paddlePlayer2_Y_Center > ballY + 35 ) {
        paddlePlayer2_Y -= dificultyAI;
    }
}

function drawNet(){ //draws the net in the middle of the screen
    for(var i = 10; i < canvas.height; i+=40){
        drawRectangle((canvas.width/2)-1, i, 2, 20, "white");
    }
}