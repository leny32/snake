let posx = 0;
let posy = 0;
let pastDirection = null;
let currentDirection = 'right';
let interval = 200;
let t = setInterval(move, interval);
let appleCords = { x: 0, y: 0 };
let score = -1;
let oldMoves = [{ x: 0, y: 0 }];
let bodylength = 0;
let allSquares = [];
let moved = false;
let startTime = 6000;
let audio_timer = new Audio('media/audio_timer.mp3');
let audio_t3 = new Audio('media/audio_scifi.mp3');
let audio_t4 = new Audio('media/audio_beep.mp3');
audio_timer.play();
audio_timer.volume = 0.2;
audio_t3.volume = 0.4;
audio_t4.volume = 0.5;
audio_t3.loop = true;
audio_t4.loop = true;

/*------------------------------------------------------------*/

genAllSquares();
generateApple();
window.addEventListener('message', (event) => {
	let data = event.data
	console.log("test")
	if (data.action == 'startGame') {
		startGame();
	}
});


function startGame() {
	posx = 0;
	posy = 0;
	score = -1;

	let element = document.getElementById("bodyFolder");
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}

	oldMoves = [{ x: 0, y: 0 }];
	allSquares = [];
	document.getElementById('box').style.left = 1 + 'px';
	document.getElementById('box').style.top = 1 + 'px';
	return;
}

let x = setInterval(() => {
	if (score == 10) {
		audio_t3.play();
	} else if (score == 15) {
		audio_t3.pause();
		audio_t4.play();
	} else if (score == 20) {
		audio_t3.play();
	}
	startTime--;
	let sec = Math.floor(startTime / 100);
	let ms = startTime % 100;
	if (startTime < 1) {
		clearInterval(x);
		failedGame();
	}
	let tr = document.getElementById('score');
	tr.innerHTML = `${sec < 10 ? '0' + sec : sec}<span id="ms">${ms}</span>`;
}, 10);

document.addEventListener('keydown', keyTask);
function keyTask(e) {
	switch (e.code) {
		case 'ArrowUp':
		case 'KeyW':
			currentDirection = pastDirection == 'down' ? 'down' : 'up';
			break;
		case 'ArrowDown':
		case 'KeyS':
			currentDirection = pastDirection == 'up' ? 'up' : 'down';
			break;
		case 'ArrowLeft':
		case 'KeyA':
			currentDirection = pastDirection == 'right' ? 'right' : 'left';
			break;
		case 'ArrowRight':
		case 'KeyD':
			currentDirection = pastDirection == 'left' ? 'left' : 'right';
			break;
		case 'Escape':
			failedGame();
			break;
	}
}

function generateApple() {
	let apple = document.getElementById("apple");
	let working = removeOldMoves(allSquares, oldMoves);

	let newApple = working[getRandomInt(working.length)];
	app = { x: (newApple.x * 50) - 50, y: (newApple.y * 50) - 50 };

	if (appleCords.x == app.x && appleCords.y == app.y) return generateApple();

	apple.style.top = app.y + 'px';
	apple.style.left = app.x + 'px';

	appleCords = { x: app.x, y: app.y };

	score++;
	document.getElementById('box').innerHTML = score;
};

function verifyWin() {
	clearInterval(t);
	clearInterval(x);
	audio_timer.pause();
	//audio_t2.pause();
	audio_t3.pause();
	audio_t4.pause();
	let element = document.getElementById("bodyFolder");
	let i = 0;
	while (element.firstChild) {
		i++;
		element.removeChild(element.firstChild);
	};
	if (i == 25) {
		console.log();
		fetch("http://nui2/win", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ score: btoa(JSON.stringify(oldMoves)) })
		});
	}
	return;
}

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
	if (score == 25) return verifyWin();
	if (currentDirection == null) audio_timer.pause();
	else audio_timer.play()
	let oldx = posx;
	let oldy = posy;
	switch (currentDirection) {
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

	let xCord = (posx + 50) / 50;
	let yCord = (posy + 50) / 50;
	let currentPos = { x: xCord, y: yCord };

	let colliction = findCollision(xCord, yCord);
	if ((posx < 0 || posy < 0 || posx > 450 || posy > 450) || colliction) return failedGame();
	pastDirection = currentDirection;

	animateHead(oldx, posx, oldy, posy);

	if (oldMoves.length > 1) {
		for (i = 0; i < oldMoves.length - 1; i++) {
			let lastSquare = oldMoves[oldMoves.length - 1 - i];
			let secondLastSquare = oldMoves[oldMoves.length - 2 - i];
			let nodelength = document.getElementById('bodyFolder').childNodes.length;
			animTail(lastSquare.x, lastSquare.y, nodelength - 1 - i, secondLastSquare.x, secondLastSquare.y);
		}
	}

	if (appleCords.x == posx && appleCords.y == posy) {
		generateApple();
		oldMoves.unshift(currentPos);

		if (oldMoves.length > 1) {
			createTail();
		}

	} else if (posx != oldx || posy != oldy) {
		oldMoves.unshift(currentPos);
		oldMoves.pop();
		if (oldMoves.length > 1) {
			moveTail();
		}
	}

}

function failedGame() {
	audio_timer.pause();
	//audio_t2.pause();
	audio_t3.pause();
	audio_t4.pause();
	clearInterval(x);
	clearInterval(t);

	fetch("http://nui2/close", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ score: score })
	})
	return;
}

function animateHead(xfrom, xto, yfrom, yto) {
	let x = xfrom;
	let y = yfrom;

	let id = setInterval(frame, interval / 25);
	function frame() {
		if (x == xto && y == yto) {
			clearInterval(id);
		} else {
			if (x < xto) {
				x += 2;
			}
			if (x > xto) {
				x -= 2;
			}
			if (y < yto) {
				y += 2;
			}
			if (y > yto) {
				y -= 2;
			}
			document.getElementById('box').style.left = x + 'px';
			document.getElementById('box').style.top = y + 'px';
		}
	}
}

function animTail(xto, yto, bodypos) {
	let x = (xto * 50) - 50;
	let y = (yto * 50) - 50;
	document.getElementById('bodyFolder').childNodes[bodypos].style.left = x + 'px';
	document.getElementById('bodyFolder').childNodes[bodypos].style.top = y + 'px';
}

function createTail() {
	let newBod = document.createElement('div');
	newBod.setAttribute('id', 'bod');
	document.getElementById('bodyFolder').appendChild(newBod);
	let a = document.getElementById('bodyFolder').childNodes.length;
	moveTail(a);
}

function moveTail(pos) {
	if (Number.isInteger(pos)) {
		bodylength = pos;
	}
	for (let i = 1; i <= bodylength; i++) {
		document.getElementById('bodyFolder').childNodes[i - 1].style.left = ((oldMoves[i].x) * 50) - 50 + 'px';
		document.getElementById('bodyFolder').childNodes[i - 1].style.top = ((oldMoves[i].y) * 50) - 50 + 'px';
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function genAllSquares() {
	for (let i = 1; i <= 10; i++) {
		for (let j = 1; j <= 10; j++) {
			allSquares.push({ x: i, y: j });
		}
	}
}

function removeOldMoves(arr1, arr2) {
	let newArr = [];
	for (let i = 0; i < arr1.length; i++) {
		let match = false;
		for (let j = 0; j < arr2.length; j++) {
			if (arr1[i].x == arr2[j].x && arr1[i].y == arr2[j].y) {
				match = true;
			}
		}
		if (!match) {
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