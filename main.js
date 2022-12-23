// Set up canvas and context
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

// Canvas dimensions
var canvasWidth = 1000;
var canvasHeight = 600;

// Background image dimensions
var backgroundWidth = 960;
var backgroundHeight = 540;

// Background image x position
var backgroundX = 0;

// Background scroll speed
var backgroundScrollSpeed = -5;

// Load background image
var backgroundImage = new Image();
backgroundImage.src = "assets/space.png";

// Set up player object
var player = {
    x: 30,
    y: 250,
    width: 140,
    height: 100,
    xBoundOffset: 20,
    yBoundOffset: 20,
    xBound: 90,
    yBound: 60,
    color: "pink",
    speed: 5
};

// Set up frame index and frame rate
let playerFrameIndex = 0;
let playerFrameRate = 13;
let delay = 0;

// load player gif
var playerImages = [];
for(playerFrameIndex; playerFrameIndex<=playerFrameRate; playerFrameIndex++){
    playerImages[playerFrameIndex] = new Image();
    playerImages[playerFrameIndex].src = "assets/player/player"+playerFrameIndex+".png";
}

// Candy array
var candies = [];
var candyImage = new Image();
candyImage.src = "assets/candy.png";

// Number of candies to spawn
var numCandies = 5;


// Generate candies
for (var i = 0; i < numCandies; i++) {
    // Create new candy object
    var candy = {
        x: Math.random() * (canvas.width+600 - canvas.width) + canvas.width,
        y: Math.random() * canvas.height,
        radius: 25,
        color: "yellow",
        speed: 10
    };
    // Add candy to array
    candies.push(candy);
}

// Set up score variable
var score = 0;

// Set up game over flag
var gameOver = false;

// Set up game loop interval identifier
var gameLoopInterval;

// Set up reset game function
function resetGame() {
    // Reset game over flag
    gameOver = false;
    // Reset score
    score = 0;

    // Reset candies position and speed
    for (var i = 0; i < candies.length; i++) {
        candies[i].x = Math.random() * (canvas.width+600 - canvas.width) + canvas.width
        candies[i].y = Math.random() * canvas.height
        candies[i].speed = 5;
    }

    // Reset player position
    player.y = 250

    // Start game loop
    playAgainButton.style.display = "none";
    gameLoopInterval = setInterval(gameLoop, 30);
}

function gameOverScreen(){
    playAgainButton.style.display = "block";
    // Set up font and text color

    var gameOverText = document.getElementById("score");
    // Set font of canvas context to the same font as the game over text
    ctx.font = window.getComputedStyle(gameOverText).font;
    ctx.fillStyle = "#ff4be1";

    // Set up text alignment
    ctx.textAlign = "center";

    // Draw "Game over" text
    ctx.fillText("GAME OVER", canvas.width / 2 + 20, canvas.height / 2 + 20);
    ctx.fillStyle = "#fc79f2";
    ctx.fillText("GAME OVER", canvas.width / 2 + 10, canvas.height / 2 + 10);
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    clearInterval(gameLoopInterval);
}

var playAgainButton = document.getElementById("play-again");
playAgainButton.style.display = "none";
playAgainButton.addEventListener("click", function() {
    resetGame();
});

// Set up keydown event listener
document.addEventListener("keydown", function(event) {
    // Check for up arrow key
    if (event.code === "ArrowUp") {
        player.y -= player.speed;
    }
    // Check for down arrow key
    else if (event.code === "ArrowDown") {
        player.y += player.speed;
    }
});

// Set up game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update background x position
    backgroundX -= backgroundScrollSpeed;

    // Check if background has reached the end of the image
    if (backgroundX >= backgroundWidth) {
        // Reset background x position
        backgroundX = 0;
    }

    // Draw background image
    ctx.drawImage(backgroundImage, backgroundX, 0, backgroundWidth, backgroundHeight, 0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(backgroundImage, backgroundX - backgroundWidth, 0, backgroundWidth, backgroundHeight, 0, 0, canvasWidth, canvasHeight);

    // Check if player has reached the top or bottom of the canvas
    if (player.y < 0) {
        // Set player y position to 0
        player.y = 0;
    } else if (player.y + player.height > canvas.height) {
        // Set player y position to the canvas height minus the player height
        player.y = canvas.height - player.height;
    }

    // Update frame index
    if(playerFrameIndex >= playerFrameRate){
        playerFrameIndex = 0;
    }
    if(delay > 3){
        playerFrameIndex+=1;
        delay = 0;
    }
    delay +=1;

    // Draw player bounding box for debugging
    /*ctx.fillStyle = player.color;
    ctx.fillRect(player.xBoundOffset+player.x, player.yBoundOffset+player.y, player.xBound, player.yBound);*/

    // Draw player
    ctx.drawImage(playerImages[playerFrameIndex], player.x, player.y, player.width, player.height);

    // Update score
    document.getElementById("score").innerHTML = "Score: " + score;

    // Draw candies
    for (var i = 0; i < candies.length; i++) {
        // Move candy
        candies[i].x -= candies[i].speed;

        // Draw candy bounding box for debugging
        /*ctx.fillStyle = candies[i].color;
        ctx.beginPath();
        ctx.arc(candies[i].x, candies[i].y, candies[i].radius, 0, 360);
        ctx.fill();*/

        // Draw candy
        ctx.drawImage(candyImage, candies[i].x-candies[i].radius, candies[i].y-candies[i].radius, candies[i].radius*2, candies[i].radius*2);

        // Check for collision
        if (collision(player, candies[i])) {
            clearInterval(gameLoopInterval);
            gameOver = true;
            document.getElementById("play-again").style.display = "block";
        }

        // Check if candy has reached the left side of the canvas
        if (candies[i].x + candies[i].radius*2 < 0) {
            // Increment score
            score++;
            // Reset candy position
            candies[i].x = Math.random() * (canvas.width+600 - canvas.width) + canvas.width;
            candies[i].y = Math.random() * canvas.height;
            candies[i].speed +=2;
        }
    }

    if(gameOver){
        gameOverScreen();
    }
}

function collision(obj1, obj2) {
    // Calculate the distance between the center of the circle and the rectangle
    var dx = Math.abs(obj2.x - (obj1.x+obj1.xBoundOffset) - obj1.xBound / 2);
    var dy = Math.abs(obj2.y - (obj1.y+obj1.yBoundOffset) - obj1.yBound / 2);

    // Check if the distance is less than the sum of the radius of the circle and half the width and height of the rectangle
    if (dx <= (obj1.xBound / 2 + obj2.radius) && dy <= (obj1.yBound / 2 + obj2.radius)) {
        return true;
    } else {
        return false;
    }
}

gameLoopInterval = setInterval(gameLoop, 30);