let posx = 0;
let posy = 0;
let direction = null;
let interval = 200;
let t = setInterval(move, interval);
let appleCords = { x: 0, y: 0 };
let score = -1;
let localStorage = window.localStorage;
let highscore = localStorage.getItem('Highscore') || 0;
let oldMoves = [{ x: 0, y: 0 }];
let bodylength = 0;
let allSqures = [];
let moved = false;
let upDir = 'up';
let downDir = 'down';
let leftDir = 'left';
let rightDir = 'right';
let diff = 1 ;

/*------------------------------------------------------------*/

window.onload = function () {
	generateApple();
	changeDifficulty(1);
}

genAllSquares();

function changeSpeed() {
	interval = interval == 200 ? 150 : interval == 150 ? 100 : 200
	clearInterval(t)
	t = setInterval(move, interval)
}
function changeDifficulty(difficulty){
	diff = difficulty;
	switch (difficulty){
		case 1:
			downDir = 'down';
			upDir = 'up';
			leftDir = 'left';
			rightDir = 'right';
			break;
		case 2:
			downDir = 'up';
			upDir = 'down';
			leftDir = 'right';
			rightDir = 'left';
			break;
		case 3:
			downDir = 'left';
			upDir = 'right';
			leftDir = 'down';
			rightDir = 'up';
			break;
		case 4:
			downDir = 'up';
			upDir = 'right';
			leftDir = 'down';
			rightDir = 'left';
			break;
	}
}


document.addEventListener('keydown', keyTask);
function keyTask(e) {
	if (moved) return;
	switch (e.code) {
		case 'ArrowUp':
			direction = direction == downDir ? downDir : upDir;
			moved = true;
			break;
		case 'ArrowDown':
			direction = direction == upDir ? upDir : downDir;
			moved = true;
			break;
		case 'ArrowLeft':
			direction = direction == rightDir ? rightDir : leftDir;
			moved = true;
			break;
		case 'ArrowRight':
			direction = direction == leftDir ? leftDir : rightDir;
			moved = true;
			break;
		case 'KeyW':
			direction = direction == downDir ? downDir : upDir;
			moved = true;
			break;
		case 'KeyS':
			direction = direction == upDir ? upDir : downDir;
			moved = true;
			break;
		case 'KeyA':
			direction = direction == rightDir ? rightDir : leftDir;
			moved = true;
			break;
		case 'KeyD':
			direction = direction == leftDir ? leftDir : rightDir;
			moved = true;
			break;
		case 'Space':
			changeSpeed();
			break;
		case 'Digit1':
			changeDifficulty(1);
			console.log('1');
			break;
		case 'Digit2':
			changeDifficulty(2);
			console.log('2');
			break;
		case 'Digit3':
			changeDifficulty(3);
			console.log('3');
			break;
		case 'Digit4':
			changeDifficulty(4);
			console.log('4');
			break;
	}
}

function generateApple() {
    let apple = document.getElementById("apple");
    let working = removeOldMoves(allSqures, oldMoves);

	let newApple = working[getRandomInt(working.length)];
	app = {x: (newApple.x*50)-50, y: (newApple.y*50)-50};

	if (appleCords.x == app.x && appleCords.y == app.y) return generateApple();

    apple.style.top = app.y + 'px';
    apple.style.left =  app.x + 'px';

	appleCords = { x: app.x, y: app.y };

	score += diff;
	if (score == 98*diff) {
		clearInterval(t);
		alert('You win!');
	}

    document.getElementById('score').innerHTML = `Poeng: ${score}</br> Highscore: ${highscore}`;
};

function findCollision(x, y) {
	let coll = false;
	for (let i = 0; i < oldMoves.length; i++) {
		if (oldMoves[i].x == x && oldMoves[i].y == y) {
			coll = true;
		}
	}
	return coll;
}
function move() {
	let oldx = posx;
	let oldy = posy;
	switch (direction) {
		case 'right':
			posx += 50;
			break;
		case 'down':
			posy += 50;
			break;
		case 'left':
			posx -= 50;
			break;
		case 'up':
			posy -= 50;
			break;
	}
	
	let xCord = (posx+50)/50;
    let yCord = (posy+50)/50;
	let currentPos = {x:xCord, y:yCord};
	
	let colliction = findCollision(xCord, yCord);
	if ((posx < 0 || posy < 0 || posx > 450 || posy > 450) || colliction) return failedGame();
	moved = false;
	
	animateHead(oldx, posx, oldy, posy);

	if (oldMoves.length > 1){
		for (i=0; i <oldMoves.length-1; i++) {
			let lastSquare = oldMoves[oldMoves.length-1-i];
			let secondLastSquare = oldMoves[oldMoves.length-2-i];
			let nodelength = document.getElementById('bodyFolder').childNodes.length;
			animateTail(lastSquare.x, secondLastSquare.x, lastSquare.y, secondLastSquare.y, nodelength-1-i);
		}
	} 

    if (appleCords.x == posx && appleCords.y == posy) {
		generateApple();
		oldMoves.unshift(currentPos);

		if (oldMoves.length > 1){
			createTail();
		}		
		
		if(highscore < score) highscore = score + 1;


   	} else if (posx != oldx || posy != oldy){
		oldMoves.unshift(currentPos);
		oldMoves.pop();
		if (oldMoves.length > 1){
			moveTail();
		}
	}
}

function failedGame() {
	posx = 0;
	posy = 0;
	score = -1*diff;
	localStorage.setItem('Highscore', highscore);
	
	let element = document.getElementById("bodyFolder");
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}

	generateApple()

	oldMoves = [{ x: 0, y: 0 }];
	allSqures = [];
	genAllSquares();
	document.getElementById('box').style.left = 1 + 'px';
	document.getElementById('box').style.top = 1 + 'px';
	return direction = null;
}

function animateHead(xfrom, xto, yfrom, yto) {
	let x = xfrom;
	let y = yfrom;

	let id = setInterval(frame, interval / 50);
	function frame() {
		if (x == xto && y == yto) {
			clearInterval(id);
		} else {
			if (x < xto) {
				x++;
			}
			if (x > xto) {
				x--;
			}
			if (y < yto) {
				y++;
			}
			if (y > yto) {
				y--;
			}
			document.getElementById('box').style.left = x + 'px';
			document.getElementById('box').style.top = y + 'px';
		}
	}
}

function animateTail(xfrom, xto, yfrom, yto, bodypos) {
	let x = (xfrom*50)-50;
	let y = (yfrom*50)-50;
	let x2 = (xto*50)-50;
	let y2 = (yto*50)-50;

	let id = setInterval(frame, interval / 50);
	function frame() {
		if (x == x2 && y == y2) {
			clearInterval(id);
		} else {
			if (x < x2) {
				x++;
			}
			if (x > x2) {
				x--;
			}
			if (y < y2) {
				y++;
			}
			if (y > y2) {
				y--;
			}
			document.getElementById('bodyFolder').childNodes[bodypos].style.left = x + 'px';
			document.getElementById('bodyFolder').childNodes[bodypos].style.top = y + 'px';
		}
	} 
}

function createTail (){
	let newBod = document.createElement('div');
	newBod.setAttribute('id', 'bod');
	document.getElementById('bodyFolder').appendChild(newBod);
	let a = document.getElementById('bodyFolder').childNodes.length;
	moveTail(a);
}

function moveTail (pos) {
	if (Number.isInteger(pos)){
		bodylength = pos;
	}
	for (let i = 1; i <= bodylength; i++){
		document.getElementById('bodyFolder').childNodes[i-1].style.left = ((oldMoves[i].x)*50)-50 +'px';
		document.getElementById('bodyFolder').childNodes[i-1].style.top = ((oldMoves[i].y)*50)-50 +'px';
	}
}

function getRandomInt (max) {
	return Math.floor(Math.random()*max); 
}

function genAllSquares() {
	for (let i = 1; i <= 10; i++){
		for (let j = 1; j <=10; j++){
			allSqures.push({x: i, y: j});
		}
	}
}

function removeOldMoves(arr1, arr2) {
	let newArr = [];
	for (let i = 0; i < arr1.length; i++){
		let match = false;
		for (let j = 0; j < arr2.length; j++){
			if (arr1[i].x == arr2[j].x && arr1[i].y == arr2[j].y){
				match = true;
			}
		}
		if (!match){
			newArr.push(arr1[i]);
		}
	}
	return newArr;
}

const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');

for (let i = 0; i < 5; i++) {
	let xCord = 100 * i + 50;
	for (let j = 0; j < 5; j++) {
		ctx.fillStyle = '#a6d13d';
		ctx.fillRect(xCord, 100 * j, 50, 50);
	}
}
for (let i = 0; i < 5; i++) {
	let xCord = 100 * i;
	for (let j = 0; j < 5; j++) {
		ctx.fillStyle = '#a6d13d';
		ctx.fillRect(xCord, 100 * j + 50, 50, 50);
	}
}
for (let i = 0; i < 5; i++) {
	let xCord = 100 * i;
	for (let j = 0; j < 5; j++) {
		ctx.fillStyle = '#aed746';
		ctx.fillRect(xCord, 100 * j, 50, 50);
	}
}
for (let i = 0; i < 5; i++) {
	let xCord = 100 * i + 50;
	for (let j = 0; j < 5; j++) {
		ctx.fillStyle = '#aed746';
		ctx.fillRect(xCord, 100 * j + 50, 50, 50);
	}
}