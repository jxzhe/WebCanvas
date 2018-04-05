const c = document.querySelectorAll('canvas');
const ctx = Array.from(c, canvas => canvas.getContext('2d'));
const tools = document.querySelectorAll('.tools');
const color = document.querySelector('#Color');
const lineWidth = document.querySelector('#LineWidth');
const undo = document.querySelector('#Undo');
const redo = document.querySelector('#Redo');
const pencil = new Image;
const eraser = new Image;
pencil.src = 'images/pencil.svg';
eraser.src = 'images/eraser.svg';

function Cursor() {
    this.x = this.y = null;
}
let distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
let cursor = new Cursor();
let prevCursor = new Cursor();
let isDrawing = false;
let canvasStack = [];
let index = 0;
let text = 'TEXT';
let font = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
let img = new Image();
let useStroke = false;
let picker = new CP(color);

window.onload = function () {
    initCanvas();
    initCanvasStack();
    initTools();
    initStartButton();
    initColor();
    initLineWidth();
};

function initCanvas() {
    for (let cv of c) {
        cv.width = window.innerWidth;
        cv.height = window.innerHeight - document.querySelector('footer').clientHeight;
    }
    ctx[0].fillStyle = '#FFFFFF';
    ctx[0].fillRect(0, 0, c[0].width, c[0].height);

    c[2].onmousedown = handleMouseDown;
    c[2].onmousemove = handleMouseMove;
    c[2].onmouseleave = handleMouseLeave;
    c[2].onmouseenter = handleMouseEnter;
    c[2].onmouseup = handleMouseUp;

    c[2].ontouchstart = handleTouchStart;
    c[2].ontouchmove = handleTouchMove;
    c[2].ontouchcancel = handleTouchCancel;
    c[2].ontouchend = handleTouchEnd;
}

function initCanvasStack() {
    canvasStack.push(ctx[0].getImageData(0, 0, c[0].width, c[0].height));
}

function initTools() {
    for (let tool of tools) {
        tool.onclick = function () {
            for (let tool of tools) {
                if (tool.classList.contains('btn-primary')) {
                    tool.classList.remove('btn-primary');
                    tool.classList.add('btn-secondary');
                }
            }
            this.classList.remove('btn-secondary');
            this.classList.add('btn-primary');
            lineWidth.value = lineWidth.nextElementSibling.innerHTML = this.id === 'Eraser' ? 80 : 10;
        };
    }
    document.querySelector('#Text').addEventListener('click', function () {
        lineWidth.value = lineWidth.nextElementSibling.innerHTML = 50;
        let input = window.prompt('Input', 'TEXT');
        if (input) {
            text = input;
        }
        input = window.prompt('Font Family\n*change it if you want\n*use comma to seperate', font);
        if (input) {
            font = input;
        }
    });
    document.querySelector('#Upload').onchange = function (e) {
        lineWidth.value = lineWidth.nextElementSibling.innerHTML = 50;
        let reader = new FileReader();
        reader.onload = function (event) {
            img = new Image();
            img.onload = function () {
                if (img.width / img.height > c[0].width / c[0].height) {
                    img.height *= c[0].width / img.width;
                    img.width = c[0].width;
                } else {
                    img.width *= c[0].height / img.height;
                    img.height = c[0].height;
                }
            };
            img.src = this.result;
        };
        if (this.files.length) {
            reader.readAsDataURL(this.files[0]);
        }
    }
    undo.onclick = function () {
        ctx[0].putImageData(canvasStack[--index], 0, 0);
        updateUndoRedo();
    };
    redo.onclick = function () {
        ctx[0].putImageData(canvasStack[++index], 0, 0);
        updateUndoRedo();
    };
    document.querySelector('#Refresh').onclick = function () {
        ctx[0].fillStyle = '#FFFFFF';
        ctx[0].fillRect(0, 0, c[0].width, c[0].height);
        updateCanvasStack();
    };
    document.querySelector('#Save').onclick = function () {
        this.setAttribute('href', c[0].toDataURL('image/png').replace('image/png', 'image/octet-stream'));
        this.click();
    };
}

function initStartButton() {
    document.querySelector('header button').onclick = function () {
        for (let e of document.querySelectorAll('body>:not(script)')) {
            e.classList.toggle('invisible');
        }
    };
}

function initColor() {
    picker.on("change", function (color) {
        this.target.value = '#' + color;
    });
    if (window.innerWidth < 992) {
        color.setAttribute('disabled', 'disabled');
    }
}

function initLineWidth() {
    lineWidth.onmousemove = lineWidth.onchange = function () {
        this.nextElementSibling.innerHTML = this.value;
    };
}

function updateCanvasStack() {
    canvasStack[++index] = ctx[0].getImageData(0, 0, c[0].width, c[0].height);
    canvasStack.splice(index + 1);
    updateUndoRedo();
}

function updateUndoRedo() {
    if (index > 0) {
        undo.removeAttribute('disabled');
    } else {
        undo.setAttribute('disabled', 'disabled');
    }
    if (canvasStack[index + 1] !== undefined) {
        redo.removeAttribute('disabled');
    } else {
        redo.setAttribute('disabled', 'disabled');
    }
}

function getCursor(c, e) {
    let rect = c.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function drawLine() {
    ctx[1].beginPath();
    if (isDrawing) {
        ctx[1].moveTo(prevCursor.x, prevCursor.y);
    } else {
        ctx[1].moveTo(cursor.x - 1, cursor.y);
    }
    ctx[1].lineTo(cursor.x, cursor.y);
    ctx[1].stroke();
}

function handleMouseDown(e) {
    let using = document.querySelector('.tools.btn-primary');
    cursor = getCursor(c[2], e);
    ctx[1].strokeStyle = color.value;
    ctx[1].fillStyle = color.value;
    ctx[1].lineWidth = lineWidth.value / 2;
    ctx[1].lineCap = ctx[1].lineJoin = 'round';
    if (using.id === 'Pencil') {
        drawLine();
    } else if (using.id === 'Eraser') {
        ctx[1].strokeStyle = '#FFFFFF';
        drawLine();
    } else if (using.id === 'Text') {
        ctx[0].fillStyle = color.value;
        ctx[0].font = lineWidth.value * 2 + `px ${font}`;
        ctx[0].fillText(text, cursor.x, cursor.y);
    } else if (using.getAttribute('for') === 'Upload') {
        ctx[0].drawImage(img, cursor.x - img.width * lineWidth.value / 100, cursor.y - img.height * lineWidth.value / 100, img.width * lineWidth.value / 50, img.height * lineWidth.value / 50);
    }
    isDrawing = true;
    prevCursor = cursor;
};

function handleMouseMove(e) {
    let using = document.querySelector('.tools.btn-primary');
    cursor = getCursor(c[2], e);
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
    ctx[1].strokestyle = color.value;
    ctx[1].fillStyle = color.value;

    if (using.id === 'Pencil') {
        ctx[2].beginPath();
        ctx[2].strokeStyle = '#000000';
        ctx[2].fillStyle = color.value;
        ctx[2].arc(cursor.x, cursor.y, lineWidth.value / 4, 0, 2 * Math.PI);
        ctx[2].stroke();
        ctx[2].fill();
        ctx[2].drawImage(pencil, cursor.x + 1, cursor.y - 29, 30, 30);
        c[2].style.cursor = 'none';
    } else if (using.id === 'Eraser') {
        ctx[2].beginPath();
        ctx[2].strokeStyle = '#000000';
        ctx[2].fillStyle = '#FFFFFFAA';
        ctx[2].arc(cursor.x, cursor.y, lineWidth.value / 4, 0, 2 * Math.PI);
        ctx[2].stroke();
        ctx[2].fill();
        ctx[2].drawImage(eraser, cursor.x - 3, cursor.y - 25, 30, 30);
        c[2].style.cursor = 'none';
    } else if (using.id === 'Text') {
        ctx[2].fillStyle = color.value;
        ctx[2].font = lineWidth.value * 2 + `px ${font}`;
        ctx[2].fillText(text, cursor.x, cursor.y);
        c[2].style.cursor = 'default';
    } else if (using.getAttribute('for') === 'Upload') {
        ctx[2].drawImage(img, cursor.x - img.width * lineWidth.value / 100, cursor.y - img.height * lineWidth.value / 100, img.width * lineWidth.value / 50, img.height * lineWidth.value / 50);
        c[2].style.cursor = 'default';
    } else {
        c[2].style.cursor = 'crosshair';
    }
    if (isDrawing) {
        if (using.id === 'Pencil') {
            drawLine();
            prevCursor = cursor;
        } else if (using.id === 'Eraser') {
            drawLine();
            prevCursor = cursor;
        } else if (using.id === 'Line') {
            ctx[1].beginPath();
            ctx[1].clearRect(0, 0, c[0].width, c[0].height);
            ctx[1].moveTo(prevCursor.x, prevCursor.y);
            ctx[1].lineTo(cursor.x, cursor.y);
            ctx[1].stroke();
        } else if (using.id === 'Arc') {
            ctx[1].beginPath();
            ctx[1].clearRect(0, 0, c[0].width, c[0].height);
            ctx[1].arc(prevCursor.x, prevCursor.y, distance(cursor, prevCursor), 0, 2 * Math.PI);
            if (useStroke) {
                ctx[1].stroke();
            } else {
                ctx[1].fill();
            }
        } else if (using.id === 'Rect') {
            ctx[1].beginPath();
            ctx[1].clearRect(0, 0, c[0].width, c[0].height);
            ctx[1].rect(prevCursor.x, prevCursor.y, cursor.x - prevCursor.x, cursor.y - prevCursor.y);
            if (useStroke) {
                ctx[1].stroke();
            } else {
                ctx[1].fill();
            }
        } else if (using.id === 'Tri') {
            ctx[1].beginPath();
            ctx[1].clearRect(0, 0, c[0].width, c[0].height);
            ctx[1].moveTo(prevCursor.x, prevCursor.y);
            ctx[1].lineTo(cursor.x, cursor.y);
            ctx[1].lineTo((prevCursor.x + cursor.x) / 2 + (cursor.y - prevCursor.y) * Math.sin(Math.PI / 3), (prevCursor.y + cursor.y) / 2 + (prevCursor.x - cursor.x) * Math.sin(Math.PI / 3));
            ctx[1].closePath();
            if (useStroke) {
                ctx[1].stroke();
            } else {
                ctx[1].fill();
            }
        }
    }
};

function handleMouseLeave() {
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
}

function handleMouseEnter(e) {
    let using = document.querySelector('.tools.btn-primary');
    if (isDrawing) {
        cursor = getCursor(c[2], e);
        if (using.id === 'Pencil' || using.id === 'Eraser') {
            prevCursor = cursor;
        }
    }
}

function handleMouseUp() {
    if (isDrawing) {
        isDrawing = false;
        ctx[0].drawImage(c[1], 0, 0);
        ctx[1].clearRect(0, 0, c[0].width, c[0].height);
        updateCanvasStack();
    }
};

let ongoingTouches = [];
let startingTouches = [];

function handleTouchStart(e) {
    e.preventDefault();
    let using = document.querySelector('.tools.btn-primary');

    ctx[1].fillStyle = color.value;
    ctx[1].strokeStyle = color.value;
    ctx[1].lineWidth = lineWidth.value / 2;
    ctx[1].lineCap = ctx[1].lineJoin = 'round';

    let touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
        startingTouches.push(copyTouch(touches[i]));
        [cursor.x, cursor.y] = [touches[i].pageX, touches[i].pageY];
        if (using.id === 'Pencil') {
            ctx[1].beginPath();
            ctx[1].moveTo(cursor.x - 1, cursor.y);
            ctx[1].lineTo(cursor.x, cursor.y);
            ctx[1].stroke();
        } else if (using.id === 'Eraser') {
            ctx[1].strokeStyle = '#FFFFFF';
            ctx[1].beginPath();
            ctx[1].moveTo(cursor.x - 1, cursor.y);
            ctx[1].lineTo(cursor.x, cursor.y);
            ctx[1].stroke();
        } else if (using.id === 'Text') {
            ctx[1].font = lineWidth.value * 2 + `px ${font}`;
            ctx[1].fillText(text, cursor.x, cursor.y);
        } else if (using.getAttribute('for') === 'Upload') {
            ctx[1].drawImage(img, cursor.x - img.width * lineWidth.value / 100, cursor.y - img.height * lineWidth.value / 100, img.width * lineWidth.value / 50, img.height * lineWidth.value / 50);
        }
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    let using = document.querySelector('.tools.btn-primary');

    ctx[1].fillStyle = color.value;
    ctx[1].strokeStyle = color.value;
    ctx[1].lineWidth = lineWidth.value / 2;
    ctx[1].lineCap = ctx[1].lineJoin = 'round';

    let touches = e.changedTouches;
    if (using.id !== 'Pencil' && using.id !== 'Eraser') {
        ctx[1].clearRect(0, 0, c[0].width, c[0].height);
    }
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            [cursor.x, cursor.y] = [touches[i].pageX, touches[i].pageY];
            if (using.id === 'Pencil') {
                [prevCursor.x, prevCursor.y] = [ongoingTouches[idx].pageX, ongoingTouches[idx].pageY];
                ctx[1].beginPath();
                ctx[1].moveTo(prevCursor.x, prevCursor.y);
                ctx[1].lineTo(cursor.x, cursor.y);
                ctx[1].stroke();
                ctx[2].beginPath();
                ctx[2].strokeStyle = '#000000';
                ctx[2].fillStyle = color.value;
                ctx[2].arc(cursor.x, cursor.y, lineWidth.value / 4, 0, 2 * Math.PI);
                ctx[2].stroke();
                ctx[2].fill();
                ctx[2].drawImage(pencil, cursor.x + 1, cursor.y - 29, 30, 30);
                c[2].style.cursor = 'none';
            } else if (using.id === 'Eraser') {
                [prevCursor.x, prevCursor.y] = [ongoingTouches[idx].pageX, ongoingTouches[idx].pageY];
                ctx[1].strokeStyle = '#FFFFFF';
                ctx[1].beginPath();
                ctx[1].moveTo(prevCursor.x, prevCursor.y);
                ctx[1].lineTo(cursor.x, cursor.y);
                ctx[1].stroke();
                ctx[2].beginPath();
                ctx[2].strokeStyle = '#000000';
                ctx[2].fillStyle = '#FFFFFFAA';
                ctx[2].arc(cursor.x, cursor.y, lineWidth.value / 4, 0, 2 * Math.PI);
                ctx[2].stroke();
                ctx[2].fill();
                ctx[2].drawImage(eraser, cursor.x - 3, cursor.y - 25, 30, 30);
                c[2].style.cursor = 'none';
            } else if (using.id === 'Line') {
                [prevCursor.x, prevCursor.y] = [startingTouches[idx].pageX, startingTouches[idx].pageY];
                ctx[1].beginPath();
                ctx[1].moveTo(prevCursor.x, prevCursor.y);
                ctx[1].lineTo(cursor.x, cursor.y);
                ctx[1].stroke();
            } else if (using.id === 'Arc') {
                [prevCursor.x, prevCursor.y] = [startingTouches[idx].pageX, startingTouches[idx].pageY];
                ctx[1].beginPath();
                ctx[1].arc(prevCursor.x, prevCursor.y, distance(cursor, prevCursor), 0, 2 * Math.PI);
                if (useStroke) {
                    ctx[1].stroke();
                } else {
                    ctx[1].fill();
                }
            } else if (using.id === 'Rect') {
                [prevCursor.x, prevCursor.y] = [startingTouches[idx].pageX, startingTouches[idx].pageY];
                ctx[1].beginPath();
                ctx[1].rect(prevCursor.x, prevCursor.y, cursor.x - prevCursor.x, cursor.y - prevCursor.y);
                if (useStroke) {
                    ctx[1].stroke();
                } else {
                    ctx[1].fill();
                }
            } else if (using.id === 'Tri') {
                [prevCursor.x, prevCursor.y] = [startingTouches[idx].pageX, startingTouches[idx].pageY];
                ctx[1].beginPath();
                ctx[1].moveTo(prevCursor.x, prevCursor.y);
                ctx[1].lineTo(cursor.x, cursor.y);
                ctx[1].lineTo((prevCursor.x + cursor.x) / 2 + (cursor.y - prevCursor.y) * Math.sin(Math.PI / 3), (prevCursor.y + cursor.y) / 2 + (prevCursor.x - cursor.x) * Math.sin(Math.PI / 3));
                ctx[1].closePath();
                if (useStroke) {
                    ctx[1].stroke();
                } else {
                    ctx[1].fill();
                }
            } else if (using.id === 'Text') {
                [prevCursor.x, prevCursor.y] = [startingTouches[idx].pageX, startingTouches[idx].pageY];
                ctx[1].font = lineWidth.value * 2 + `px ${font}`;
                ctx[1].fillText(text, cursor.x, cursor.y);
            } else if (using.getAttribute('for') === 'Upload') {
                ctx[1].drawImage(img, cursor.x - img.width * lineWidth.value / 100, cursor.y - img.height * lineWidth.value / 100, img.width * lineWidth.value / 50, img.height * lineWidth.value / 50);
            }
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    ctx[0].drawImage(c[1], 0, 0);
    ctx[1].clearRect(0, 0, c[0].width, c[0].height);
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
    updateCanvasStack();
    ongoingTouches.splice(0);
    startingTouches.splice(0);
}

function handleTouchCancel(e) {
    e.preventDefault();
    ctx[1].clearRect(0, 0, c[0].width, c[0].height);
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
    ongoingTouches.splice(0);
    startingTouches.splice(0);
}

function copyTouch(touch) {
    return {
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY
    };
}

function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        if (ongoingTouches[i].identifier == idToFind) {
            return i;
        }
    }
    return -1;
}