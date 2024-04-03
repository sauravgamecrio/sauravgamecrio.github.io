import { Application, Container, Sprite, Loader, AnimatedSprite, TilingSprite, Texture, TextStyle, Text, Graphics } from "./node_modules/pixi.js/dist/browser/pixi.min.mjs";

// App
const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window
});
app.renderer.view.style.position = 'absolute';
document.body.appendChild(app.view);
console.log("Load done..:)");

let parallaxContainer = new Container();
app.stage.addChild(parallaxContainer);


// Intialization some varibles
let isgamePaused = false;
let gameStarted = false;
let isJumping = false;
let score = 0;
let highScore = 0;

// Parallax TilingSprite
function createParallaxTilingSprite(path, speed) {
   
    const texture = Sprite.from(path).texture;
    const tilingSprite = new TilingSprite(texture, app.screen.width, app.screen.height);
    tilingSprite.anchor.set(0.5);
    tilingSprite.position.set(app.screen.width / 2, app.screen.height / 2);
    tilingSprite.tilePosition.x = 0; 
    tilingSprite.speed = speed; 
    parallaxContainer.addChild(tilingSprite);
    return tilingSprite;
}

const parallaxTilingSprites = [];

const images = [
    { path: './Forest/10.png', speed: 1.1 },
    { path: './Forest/09.png', speed: 1.2 },
    { path: './Forest/08.png', speed: 1.3 },
    { path: './Forest/07.png', speed: 1.4 },
    { path: './Forest/06.png', speed: 1.5 },
    { path: './Forest/05.png', speed: 1.6 },
    { path: './Forest/04.png', speed: 1.7 },
    { path: './Forest/03.png', speed: 1.8 },
    { path: './Forest/02.png', speed: 1.9 },
    { path: './Forest/01.png', speed: 2.0 }
    
];

// Fetching all paths and put into  parallax TilingSprites 
images.forEach(({ path, speed }) => {
    const tilingSprite = createParallaxTilingSprite(path, speed);
    parallaxTilingSprites.push(tilingSprite);
});

// Platform Container
let platformContainer = new Container();
app.stage.addChild(platformContainer);

function setupPlatform() {
    const platformTexture = Sprite.from('./BG/platform.png').texture;
    const platformSprite = new TilingSprite(platformTexture);
    platformSprite.width = app.screen.width;
    platformSprite.height = 70;
    platformSprite.clampMargin = 5;
    platformSprite.tilePosition.set(0, app.screen.height);// - platformSprite.height);
    platformSprite.position.set(0, app.screen.height - platformSprite.height);
    platformSprite.speed = 8; // Adjust speed as needed
    platformContainer.addChild(platformSprite);
    return platformSprite;
}
//call the platform function
const platformSprite = setupPlatform();

// Player Container
let playerContainer = new Container();
playerContainer.backgroundColor = 'pink';
app.stage.addChild(playerContainer);

// Load the player animations
const loader = new Loader();
loader.add('player', `./Player/spritesheet.json`)
    .add('playerMove', './Player/playerMove.json')
    .add('playerJump', './Player/playerJump1.json')
    .add('playerDeath', './Player/playerDeath.json')
    .load(setupPlayerAnimations);


// Function to create an AnimatedSprite with the given parameters
function createAnimation(baseName, start, end, speed, scaleX, scaleY, x, y) {
    const textures = [];
    for (let i = start; i <= end; i++) {
        const texture = Texture.from(`${baseName}${i}.png`);
        textures.push(texture);
    }
    const animation = new AnimatedSprite(textures);
    animation.position.set(x, y);
    animation.scale.set(scaleX, scaleY);
    animation.animationSpeed = speed;
    return animation;
}
function setupPlayerAnimations() {
    // Ideal
    const playerIdeal = createAnimation('Orion-Hoverboard_Idle(96,96)_18F.dain', 1, 13, 0.10, 2.5, 2.5, 300, 680);
    playerIdeal.visible = true;
    playerIdeal.play();

    // Move
    const playerMove = createAnimation('Orion-Hoverboard_Move(96,96)_17F.dain', 1, 7, 0.25, 2.5, 2.5, 300, 680);
    playerMove.visible = false;
    playerMove.stop();

    // Jump
    const playerJump = createAnimation('Orion-Hoverboard_Jump(96,96)_18F.dain', 5, 17, 0.25, 2.5, 2.5, 300, 570);
    playerJump.visible = false;
    playerJump.stop();

    //Death 
    const playerDeath = createAnimation('Orion_HoverboardDeath(144,96)_19F.dain', 2, 19, 0.15, 2.5, 2.5, 100, 680);
    playerDeath.visible = false;
    playerDeath.stop();

    // Add all animations to the player container
    playerContainer.addChild(playerIdeal);
    playerContainer.addChild(playerMove);
    playerContainer.addChild(playerJump);
    playerContainer.addChild(playerDeath);
}

   
//switch to move animations
function switchToMoveAnimation() {
    playerContainer.children.forEach(animation => {
        animation.visible = false;
        animation.stop();
    });
    const moveAnimation = playerContainer.getChildAt(1); // move is the second child
    moveAnimation.visible = true;
    moveAnimation.play();
}

//switch to jump animations
function switchToJumpAnimation() {
    playerContainer.children.forEach(animation => {
        animation.visible = false;
        animation.stop();
    });
    const jumpAnimation = playerContainer.getChildAt(2); // jump is the third child
    jumpAnimation.visible = true;
    jumpAnimation.play();
    jumpAnimation.loop = false;
    jumpAnimation.gotoAndPlay(0);
    jumpAnimation.onComplete = () =>{
        isJumping = false;
        jumpAnimation.visible = false;
        const moveAnimation = playerContainer.getChildAt(1);
        moveAnimation.visible = true;
        moveAnimation.play();

       
    }
}

//switch to death animations
function switchToDeathAnimation(){
    playerContainer.children.forEach(animation =>{
        animation.visible = false;
        animation.stop();
    })

    const deathAnimation = playerContainer.getChildAt(3); //death is the fourth child
    deathAnimation.visible = true;
    deathAnimation.play();
    deathAnimation.loop = false;
    deathAnimation.gotoAndPlay(0);
    deathAnimation.onComplete = () =>{
        gameStarted = false;
        gameOverText.visible = true; 

    }
}


// Function to increase player animation speed
function increasePlayerAnimationSpeed() {
    playerContainer.children.forEach(animation => {
        // Increase the animation speed by a certain factor
        const moveAnimation = playerContainer.getChildAt(1);
        moveAnimation.animationSpeed = 0.4;
        const jumpAnimation = playerContainer.getChildAt(2); 
        jumpAnimation.animationSpeed = 0.25;
    });
}

//newobstacleBySprite setup
let obstacleContainer = new Container();
app.stage.addChild(obstacleContainer);

let obstaclesImages = ['./Obstacles/01.png'];

// Define obstacle pool
const obstaclePool = [];

//obstacle setup by sprite
function createObstacleImages(){
    // const randomImageIndex = Math.floor(Math.random() * obstaclesImages.length);
    // const obstacleImagePath = obstaclesImages[randomImageIndex];

    const obstacle = new Sprite.from(obstaclesImages[0]);
    obstacle.scale.set(3);
    return obstacle;
}

function createObstacle() {
    const obstacle = obstaclePool.pop() || createObstacleImages();
    obstacle.x = app.screen.width;
    obstacle.y = app.screen.height * 0.89;
    return obstacle;
}

function resetObstacle(obstacle) {
    obstaclePool.push(obstacle);
}

// //obstacles setup
// let obstacleContainer = new Container();
// app.stage.addChild(obstacleContainer);

// function createObstacle() {
//     const obstacle = new Graphics();
//     obstacle.beginFill(0xFFFFFF);
//     obstacle.drawRect(0, 0, 50, 50); 
//     obstacle.endFill();
//     obstacle.x = app.screen.width; 
//     obstacle.y = app.screen.height - 100; 
//     return obstacle;
// }


let obstacles = [];

//spawinng
let spawnInterval;
let spawnCount;
let gap;
function spawnObstacles() {
    if(gameStarted && !isgamePaused){
        if(score < 40){
            spawnCount = Math.random() < 0.5 ? 1 : 1 ;
            gap = 400;
        }else if(score >= 40 && score <100){
            spawnCount = Math.random() < 0.5 ? 1 : 2 ; 
            gap = 500;
        }else if(score >= 100){
            spawnCount = Math.random() < 0.5 ? 2 : 3 ; 
            gap = 600;
        }
     
    let xPos = app.screen.width;

    for (let i = 0; i < spawnCount; i++) {
        const obstacle = createObstacle();
        obstacle.x = xPos;
        obstacleContainer.addChild(obstacle);
        obstacles.push(obstacle);
        xPos += obstacle.width + gap;
    }
    console.log("Spawn");
    }
}

// Spawn obstacles every 3 seconds
spawnInterval = setInterval(spawnObstacles, 4000);



//collision between player and obstacles

const screenWidth = -app.screen.width;
playerContainer._calculateBounds();
obstacleContainer._calculateBounds();

function collisionDetaction(){
    
    let playerBounds = playerContainer.getBounds();
    // let obstacleBounds = obstacleContainer.getBounds();
    // console.log(playerBounds);
    obstacles.forEach(obstacle => {
        let obstacleBounds = obstacle.getBounds();
        // console.log(obstacleBounds);
        if(playerBounds.x < obstacleBounds.x + obstacleBounds.width / 2 &&
        playerBounds.x + playerBounds.width / 2 > obstacleBounds.x &&
        playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
        playerBounds.y + playerBounds.height > obstacleBounds.y )
        {
            switchToDeathAnimation();
            gameStarted = false;
            pauseText.visible = false;
            scoreText.visible = false;
            app.stage.interactive = false;
            clearInterval(spawnInterval);
            if(obstacle.x < screenWidth){
                obstacles.forEach(obj => obstacleContainer.removeChild(obj));
                obstacles= [];
            }
        }
        
    });
}

// Tap to play
const style = new TextStyle({
    fontFamily: 'High Tide',
    fontSize: 48,
    fill: 'black',
    align: 'center'
});
let tapToPlayText = new Text('Tap to Play', style);
tapToPlayText.anchor.set(0.5); // Center the text
tapToPlayText.x = app.screen.width / 2;
tapToPlayText.y = app.screen.height / 2;
app.stage.addChild(tapToPlayText);
tapToPlayText.visible = true;

// Event listener for the tap to play game
app.stage.interactive = true;
app.stage.on('pointerdown', () => {
    if (!gameStarted) {
        tapToPlayText.visible = false;
        pauseText.visible = true;
        scoreText.visible = true;
        switchToMoveAnimation();
        gameStarted = true; // Set game started flag
    }
    else if(!isJumping && !isgamePaused){
        // Jump is the second child of playerContainer
        switchToJumpAnimation();
        isJumping= true;
    }
});

// Pause 
const stylePause = new TextStyle({
    fontFamily: 'High Tide',
    fontSize: 48,
    fill: 'black',
    align: 'center'
});
let pauseText = new Text('Pause', stylePause);
pauseText.x = app.screen.width - pauseText.width - 10;
pauseText.y = 10;
app.stage.addChild(pauseText);
pauseText.visible = gameStarted ; 

pauseText.interactive = true;

pauseText.on('pointerdown', () =>{
    pauseText.visible = false;
    isgamePaused = true;
    gamePaused();
});

function gamePaused(){
    isJumping = false;
    const styleContine = new TextStyle({
        fontFamily: 'High Tide',
        fontSize: 48,
        fill: 'black',
        align: 'center'
    });
    let continueText = new Text('Continue...', styleContine);
    continueText.anchor.set(0.5); // Center the text
    continueText.x = app.screen.width / 2;
    continueText.y = app.screen.height / 2;
    app.stage.addChild(continueText);
    
    continueText.interactive = true;
    continueText.on('pointerdown', () =>{
        isgamePaused = false;
        isJumping = true;
        pauseText.visible = true;
    });
    continueText.on('pointerup', () =>{
        isJumping = false;
        continueText.visible = false;
    });
}

// Game Over Tap To play
const styleAnother = new TextStyle({
    fontFamily: 'High Tide',
    fontSize: 48,
    fill: 'black',
    align: 'center'
});
let gameOverText = new Text('Game Over ... Tap To Restart...', styleAnother);
gameOverText.anchor.set(0.5); // Center the text
gameOverText.x = app.screen.width / 2;
gameOverText.y = app.screen.height / 2;
app.stage.addChild(gameOverText);
gameOverText.visible = false;

gameOverText.interactive = true;
gameOverText.on('pointerdown', () => {
    resetGame();
});

//  reset the game state
function resetGame() {
    // Reset game state variables
    score = 0;
    gameStarted = false;
    isJumping = false;
    obstacles.forEach(obj => obstacleContainer.removeChild(obj));
    obstacles = [];
    clearInterval(spawnInterval);
    tapToPlayText.visible = true;
    app.stage.interactive = true;
    gameOverText.visible = false;
    platformSprite.tilePosition.x = 0;
    playerContainer.children.forEach(animation => {
        animation.visible = false;
        animation.stop();
    });
    const playerIdeal = playerContainer.getChildAt(0); // Ideal is the first child
    playerIdeal.visible = true;
    playerIdeal.play();
    spawnInterval = setInterval(spawnObstacles, 3000);
}

//score and highscore
const scoreStyle = new TextStyle({
    fontFamily: 'High Tide',
    fontSize: 48,
    fill: 'black',
    align: 'center'
});

let scoreText = new Text('Score: 0', scoreStyle);
scoreText.x = 10;
scoreText.y = 10;
app.stage.addChild(scoreText);
scoreText.visible = false;

let highScoreText = new Text('High Score: 0', scoreStyle);
highScoreText.x = app.screen.width - highScoreText.width - 10;
highScoreText.y = 10;
app.stage.addChild(highScoreText);
highScoreText.visible = false;

//update the score and highscore
function updateScoreText() {
    scoreText.text = `Score: ${score}`;
    highScoreText.text = `High Score: ${highScore}`;
    gameOverText.text = `Game Over ... Tap To Restart...\nScore: ${score}\nHigh Score: ${highScore}`;
}
// Increase score by 1 every second
setInterval(() => {
    if (gameStarted && !isgamePaused) {
        score += 1; 
        if (score > highScore) {
            highScore = score;
        }
        updateScoreText();
    }
}, 1000); 




//ticker
app.ticker.add((delta) => {
   
    //increaseParallaxSpeed()
    if (gameStarted && !isgamePaused) {
        parallaxTilingSprites.forEach(tilingSprite => {
            tilingSprite.tilePosition.x -= tilingSprite.speed * delta;
        });
        increasePlayerAnimationSpeed();

        platformSprite.tilePosition.x -= platformSprite.speed * delta;

        if (platformSprite.tilePosition.x <= -platformSprite.width ) {
             platformSprite.tilePosition.x = app.screen.width;
            console.log("hi");
        }

        obstacles.forEach(obstacle => {
            obstacle.x -= 8 * delta; // Move obstacles to the left
        });

        collisionDetaction();
    }
  
    // console.log("Parallax Speed:", parallaxTilingSprites[0].speed); 
    // console.log("Parallax Speed1:", parallaxTilingSprites[8].speed);
});

// Responsive

// // Define the design resolution
// const designResolution = { width: 1920, height: 1080 };

// // Calculate the scale factor
// const scaleFactor = Math.min(window.innerWidth / designResolution.width, window.innerHeight / designResolution.height);

// // Apply the scale factor to all game elements
// playerContainer.scale.set(scaleFactor, scaleFactor);
// platformContainer.scale.set(scaleFactor, scaleFactor);
// parallaxContainer.scale.set(scaleFactor,scaleFactor);
// obstacleContainer.scale.set(scaleFactor,scaleFactor);
// pauseText.scale.set(scaleFactor,scaleFactor);
// continueText.scale.set(scaleFactor,scaleFactor);
// tapToPlayText.scale.set(scaleFactor,scaleFactor);
// gameOverText.scale.set(scaleFactor,scaleFactor);
// // Repeat for other elements: animations, text, obstacles, parallax sprites, etc.

// // Adjust the game's position
// const offsetX = (window.innerWidth - designResolution.width * scaleFactor) / 2;
// const offsetY = (window.innerHeight - designResolution.height * scaleFactor) / 2;
// app.stage.x = offsetX;
// app.stage.y = offsetY;

// // Update the game's renderer size
// app.renderer.resize(window.innerWidth, window.innerHeight);

