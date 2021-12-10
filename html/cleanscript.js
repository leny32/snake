// CONSTANTS
const delay = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));
const audio_call = new Audio('media/audio_calling.mp3');
const audio_future = new Audio('media/audio_future.mp3');
const audio_timer = new Audio('media/audio_timer.mp3');
const audio_t2 = new Audio('media/audio_timer.ogg');
const audio_t3 = new Audio('media/audio_scifi.mp3');
const audio_t4 = new Audio('media/audio_beep.mp3');
const oldMoves = [{ x: 0, y: 0 }];
const allSquares = [];

// VARIABLES
let bodylength = 0;
let appleCords = { x: 0, y: 0 };
let posx = 0;
let posy = 0;
let pastDirection = null;
let currentDirection = 'right';
let score = -1;
let moved = false;
let x, t, startTime, interval;

// SETTINGS
audio_call.volume = 0.1;
audio_future.volume = 0.1;
audio_timer.volume = 0.15;
audio_t2.volume = 0.15;
audio_t3.volume = 0.15;
audio_t4.volume = 0.2;
audio_t2.loop = true;
audio_t3.loop = true;
audio_t4.loop = true;

/*------------------------------------------------------------*/


/*
window.addEventListener('message', (event) => {
	let data = event.data
	if (data.action == 'startGame') {
		startLoading(data.max, data.time, data.speed, data.diff);
	}
});
*/

startLoading(25, 60, true, 1);

async function startLoading(max, sec, speed, diff) {
	document.getElementById('score').innerHTML = `${sec}<span id="ms">00</span>`;
	genAllSquares();
	generateApple();
	startTime = sec * 100;
	audio_call.play();
	if (diff > 1) max += Math.floor(0.25 * max * diff);
	await displayLoading('oppretter tilkobling...', 4);
	if (!speed) {
		audio_future.currentTime = 2;
		audio_future.play();
		await displayLoading('kobler til...', 2.8);
		await displayLoading('henter data...', 3.5);
		await displayLoading('konverterer data...', 3.2);
		await displayLoading('sykroniserer data...', 2.5);
		audio_future.pause();
		await displayLoading('feilet...', 2.5);
		await displayLoading('kobler til igjen med lav hastighet...', 2);
		await displayLoading('laster', Math.random() * 2);
		await displayLoading('laster.', Math.random() * 2);
		await displayLoading('laster..', Math.random() * 2);
		await displayLoading('laster...', Math.random() * 2);
		await displayLoading('laster', Math.random() * 2);
		await displayLoading('laster.', Math.random() * 2);
		await displayLoading('laster..', Math.random() * 2);
		await displayLoading('laster...', Math.random() * 2);
	} else {
		await displayLoading('kobler til med høy hastighet...');
	}
	await displayLoading(`tid med full kraft; ?${sec.toString().charAt(1)} sec; ${sec.toString().charAt(0)}`, sec / 15);
	await displayLoading(`påkrevd med !!${max.toString().charAt(1)} checkpoints; ${max.toString().charAt(0)}`, speed ? 3.4 : 5.5);
	await displayLoading(`forsøker automatisk bruteforce; error: ${diff}`, (speed ? 2.25 : 4.5) / diff);
	audio_t4.currentTime = 8;
	audio_t4.play();
	await displayLoading('tilgang flagget; trenger menneskelig verifisering...', 2);
	audio_t4.pause();
	audio_t4.currentTime = 0;
	await displayLoading('tilgang flagget; trenger menneskelig verifisering...', 2);
	document.getElementById('loading').style.display = 'none';
	document.getElementById('game').style.display = 'block';
	genMap();
	await delay(1);
	startGame(max, diff);
}

async function displayLoading(content, time = null) {
	if (time == 3.5) document.getElementById('loading-image').style.display = 'block';
	let c = content.toUpperCase();
	document.getElementById('description').innerHTML = `<span>${c.charAt(0)}</span>${c.substring(1)}`;
	await delay(time !== null ? time : content.length / 10);
	if (time == 2.5) document.getElementById('loading-image').style.display = 'none';
}

function startGame(max, diff) {
	interval = 200 - (diff > 1 ? diff * 25 : 0);
	audio_timer.play();
	document.getElementById('box').style.animation = 'none';
	t = setInterval(move, interval);

	let element = document.getElementById("bodyFolder");
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}

	x = setInterval(async () => {
		startTime--;
		let sec = Math.floor(startTime / 100);
		let ms = startTime % 100;
		if (startTime < 1) {
			clearInterval(x);
			if (score === max) return verifyWin(max);
			else return failedGame();
		}
		if (score == Math.floor(max * 0.25)) {
			if (diff > 0) {
				for (const el of element.children) {
					await delay(0.05);
					el.style.animation = 'flickerAnimation 1s infinite';
				}
			}
			audio_t3.play();
		} else if (score == Math.floor(max * 0.5)) {
			audio_t3.pause();
			audio_t4.play();
			if (diff > 0) document.getElementById('box').style.animation = 'flickerAnimation 0.5s infinite';
		} else if (score == Math.floor(max * 0.75)) {
			audio_t3.play();
		}
		let tr = document.getElementById('score');
		tr.innerHTML = `${sec < 10 ? '0' + sec : sec}<span id="ms">${ms - 1}</span>`;
	}, 10);
}




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

function verifyWin(max) {
	clearInterval(t);
	clearInterval(x);
	audio_timer.pause();
	audio_t2.pause();
	audio_t3.pause();
	audio_t4.pause();
	const element = document.getElementById("bodyFolder");
	let i = 0;
	while (element.firstChild) {
		let child = element.firstChild.outerHTML;
		if (!(child.includes('<div id="bod" style="left:') || child.includes('px"></div>'))) return failedGame();
		element.removeChild(element.firstChild);
		for (const el of element.childNodes) {
			if (el.outerHTML == child) return failedGame();
		}
		i++;
	};
	if (i == max && max >= 25) {
		fetch("https://lenySnake/callback", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ success: i == max })
		});
	} else {
		failedGame();
	}
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
	audio_t2.pause();
	audio_t3.pause();
	audio_t4.pause();
	clearInterval(x);
	clearInterval(t);

	fetch("https://lenySnake/callback", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ success: false })
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
function genMap() {
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
}