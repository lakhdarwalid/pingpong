let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

let size = 20;
let rows = canvas.height/size;
let cols = canvas.width/size;
let walBin=[];
let numberOfWalls = 0;
let wall;
let walls = [];
let playerDirectionX = 0;
let playerDirectionY = 0;
let ballDirectionX = 0;
let ballDirectionY = 0;
let gameOver = false;
let startGame = true;
let time = 15000;
let ballSpeed = 5;
let loop;
let ballLoop;

class Brick{
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.color = color;
        this.isBrick = false;
        this.goingUp = false;
        this.goingDown = false;
    }
    render(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x+2, this.y+2, size-2, size-2);
    }
    renderCircle(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x+(size/2), this.y+(size/2), size/2, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
    clear(){
        ctx.fillStyle = '#000000';
        ctx.clearRect(this.x, this.y, size, size);
    }

    move(){
        this.clear();
        this.x += ballDirectionX;
        this.y += ballDirectionY;
        this.renderCircle();
        ballMovement();
    }
}

class Wall{
    constructor(){
        this.bricks=[];
    }
    render(){
        this.bricks.forEach(brick=>{
            if (brick!=null) brick.render() 
        });
    }
    movePlayer(){
        this.bricks.forEach(brick=>{
            brick.clear();
            brick.x += playerDirectionX *size;
            brick.y += playerDirectionY*size ;
        })
        this.render();
    }
    movePlayerWithMouse(x){
        for (let i=0; i< this.bricks.length; i++){
            this.bricks[i].clear();
            this.bricks[i].x = x +i*size;
        }
        this.render();
    }
    slideDown(){
        this.bricks.forEach(brick=>{
            if (brick!=null){
                brick.clear();
                brick.y += size;
            }
        })
        this.render();
    } 
}

class Score {
    constructor(){
        this.score = 0;
    }
    writeScore(text){
        ctx.fillStyle= '#000000' ;
        ctx.clearRect(0, 380, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = "11px arial";
        ctx.fillText("Score : " + text, 300, 390);
    
    }
}
let _score = new Score();
function createWall(){
    for (let i = 0; i< cols; i++){
        walBin.push(Math.round(Math.random()));
    }
    wall = new Wall(); 
    for (let i=0; i<walBin.length; i++){
    if (walBin[i]==1) wall.bricks.push(new Brick(
            (i)*size ,0, 'rgba(202, 68, 68, 0.993)'
        ));
    }   
    wall.render();
    numberOfWalls++;
    walBin= [];
}
createWall();
walls.push(wall);

let player = new Wall();
for (let i=0; i<5; i++){
    player.bricks.push(new Brick(
        (i*size)+(((cols/2)*size)-2*size) ,(rows-2)*size, 'grey'
    ));
}
player.render();


let ball = new Brick(((cols/2)*size) ,((rows-3)*size)-1 , 'yellow');
ball.renderCircle();


document.body.addEventListener('keydown', keyPressed);

function keyPressed(event){
    if (!gameOver)  {
        event.preventDefault();
        if (event.keyCode == 37) {     // left
            if (player.bricks[0].x>0)
            {playerDirectionX = -1;
            playerDirectionY = 0;}
            else playerDirectionX = 0;
        }
        
        if (event.keyCode == 39) {     // right
            if (player.bricks[player.bricks.length-1].x + size<
                canvas.width)  
            {playerDirectionX = 1;
            playerDirectionY = 0;}
            else playerDirectionX=0;
        }
        if (startGame) {
            if (event.keyCode == 32) {
                ballDirectionY = -1;
                ball.move(); 
                startGame=false;
                }
        }

        player.movePlayer();
        ballMovement();
    }
}


canvas.addEventListener('mousemove', (ev)=>{
    player.movePlayerWithMouse(ev.clientX - canvas.offsetLeft -2.5*size);
    ballMovement();
});

canvas.addEventListener('click', (ev)=>{
    ballDirectionY = -1;
    ball.move(); 
    startGame=false;
});

canvas.ontouchmove = moveOntouch;
function moveOntouch(e){
    e.preventDefault();
    player.movePlayerWithMouse(e.touches[0].clientX - canvas.offsetLeft -2.5*size);
    ballMovement();
}


function Game(time, ballSpeed){
     loop = setInterval(()=>{
        walls.forEach(wall=>wall.slideDown());
        createWall();
        walls.push(wall);
        if (wall == null)clearInterval(loop);
    },time);


     ballLoop = setInterval(()=>{
        ball.move();
        _score.writeScore(_score.score);
    }, ballSpeed );
}
Game(time, ballSpeed);

function ballMovement(){
        if (ball.y  <= 0 ){       //  hit the ceiling
            ballDirectionY = 1;
        }

        if (ball.y+ size == player.bricks[0].y &&    //hit the player in the middle
            ball.x+size > player.bricks[1].x &&
            ball.x < player.bricks[player.bricks.length-1].x+size){
            ballDirectionY = -1;
        }
                                                // hit player from corner left 
        if (ball.x > player.bricks[0].x - size && ball.x < player.bricks[0].x+size && ball.y + size == player.bricks[0].y){
            ballDirectionX = -1;
            ballDirectionY = -1;
        }
        if (ball.x >= player.bricks[0].x - size && ball.x < player.bricks[0].x+size && ball.y > player.bricks[0].y-size && ball.y <player.bricks[0].y+size ) ballDirectionX = -1;
                    
                                                   // hit player from corner right
        if (ball.x < player.bricks[player.bricks.length-1].x + size*2 && ball.x > player.bricks[player.bricks.length-1].x && ball.y + size == player.bricks[0].y){
            ballDirectionX = 1;
            ballDirectionY = -1;
        }
        if (ball.x >= player.bricks[player.bricks.length-1].x - size && ball.x < player.bricks[player.bricks.length-1].x+size && ball.y > player.bricks[0].y-size && ball.y <player.bricks[0].y+size ) {
            ballDirectionX = 1;
        }


        if (ball.x+size == canvas.width){  // touching right broder 
           ballDirectionX = -1;
        }

        if (ball.x <= 0){  // touching left broder 
            ballDirectionX = 1;
        }

        if (ball.y >= canvas.height) {
            gameOver = true;
            ShowGameOver();
            clearInterval(ballLoop);
            clearInterval(loop);
        }

        walls.forEach(row=>
            row.bricks.forEach(brick=>{
                if (brick!=null){
                                                    // check collision up 
                    if (ball.y + size == brick.y && Math.abs(ball.x - brick.x) < size) {
                        ballDirectionY = -1;
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick);
                    }
                  
                    
                                                    // check collision down
                    if (ball.y-size == brick.y && Math.abs(ball.x - brick.x) < size){
                            ballDirectionY = 1; 
                            _score.score ++;
                            brick.clear();
                            removeBrick(brick);
                    }
                                        
                                                // check collision for all 4 corners
                                                // up left
                    if (ball.y + size == brick.y  && ball.x + size == brick.x && ballDirectionX==1 && ballDirectionY===1 ){
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick);
                        ballDirectionX = -1;
                        ballDirectionY = -1;
                    }       
                                                // up right
                    if (ball.y + size == brick.y  && ball.x - size == brick.x && ballDirectionX==-1 && ballDirectionY==1){
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick);
                        ballDirectionX = 1;
                        ballDirectionY = -1;
                    }
                                                // down left
                    if (ball.y  == brick.y + size && ball.x + size == brick.x && ballDirectionX==1 && ballDirectionY==-1){
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick); 
                        ballDirectionX = -1;
                        ballDirectionY = 1;
                    }
                                                // down right
                    if (ball.y  == brick.y + size && ball.x - size == brick.x && ballDirectionX==-1 && ballDirectionX==-1){
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick);
                        ballDirectionX = 1;
                        ballDirectionY = 1;
                    }

                    if (ball.x + size == brick.x && Math.abs(ball.y - brick.y)<size){
                        if (ballDirectionX !=0 && ballDirectionY !=0){
                        ballDirectionX *= -1; 
                        _score.score ++;
                        brick.clear();
                        removeBrick(brick);
                        }
                    }
                    
                    if (ball.x -size == brick.x && Math.abs(ball.y - brick.y) < size ){  
                        if (ballDirectionX !=0 && ballDirectionY !=0) {   
                            ballDirectionX *= -1; 
                            _score.score ++;
                            brick.clear();
                            removeBrick(brick);
                        }
                   }                    
                }
            })
        );
};


function ShowGameOver(){
    ctx.fillStyle = 'white';
    ctx.font = "50px arial";
    ctx.fillText("Game Over !! ", 50, canvas.height/2);
    startGame = true;
}

function CheckCollision(ball, wall){
    wall.bricks.forEach(brick=>{
        if (ball.x > brick.x && ball.x < brick.x+size &&
                ball.y-size/2 == brick.y+size) return true;
        else return false;
    });
}

function removeBrick(brick){
    for (let i=0; i<walls.length; i++){
        for (let j=0; j< walls[i].bricks.length; j++){
            if (walls[i].bricks[j] ===brick ){
                walls[i].bricks[j]=null;
            }
        }
    }
}


