var header = document.querySelector('header')
var main = document.querySelector('main');
var footer = document.querySelector('footer');

window.onload = function () {
    main.classList.remove('invisible');
    footer.classList.remove('invisible');
}

header.lastElementChild.onclick = function () {
    header.classList.add('invisible');
};

var c = [document.querySelector('canvas'),
    document.querySelector('canvas:nth-of-type(2)'),
    document.querySelector('canvas:nth-of-type(3)'),
];

c[0].width = c[0].width = c[2].width = window.innerWidth;
c[0].height = c[0].height = c[2].height = window.innerHeight - footer.scrollHeight;

var ctx = [c[0].getContext('2d'),
    c[1].getContext('2d'),
    c[2].getContext('2d')
];

ctx[0].fillStyle = '#FFFFFF';
ctx[0].fillRect(0, 0, c[0].width, c[0].height);

var tools = document.querySelectorAll('.tools');
tools.forEach(function (tool) {
    tool.onclick = function () {
        tools.forEach(function (tool) {
            tool.classList.remove('btn-primary');
            tool.classList.add('btn-secondary');
        });
        this.classList.add('btn-primary');
        this.classList.remove('btn-secondary');
        if (this.id === 'Text') {
            text = window.prompt('Input you text here:', 'TEXT');
        }
    };
});

var cursor = {},
    prevCursor = {};
var isDrawing = false;
var imgStack = [ctx[0].getImageData(0, 0, c[0].width, c[0].height)];
var index = 0;
var text;

function getCursor(c, e) {
    var rect = c.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

function getCursorTouch(c, e) {
    var rect = c.getBoundingClientRect();
    return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
    };
}

var lineWidth = document.querySelector('#LineWidth');
lineWidth.onmousemove = lineWidth.onchange = function () {
    document.querySelector('label[for=LineWidth]').innerHTML = this.value;
};

c[2].onmousedown = function (e) {
    var using = document.querySelector('.tools.btn-primary'),
        color = document.querySelector('input[name=color]').value,
        width = lineWidth.value;
    cursor = getCursor(c[1], e);
    if (using.id === 'Pencil') {
        ctx[1].strokeStyle = color;
        ctx[1].lineWidth = width;
        ctx[1].lineCap = ctx[1].lineJoin = 'round';
        drawLine();
    } else if (using.id === 'Eraser') {
        ctx[1].strokeStyle = '#FFFFFF';
        ctx[1].lineWidth = width;
        ctx[1].lineCap = ctx[1].lineJoin = 'round';
        drawLine();
    } else if (using.id === 'Text') {
        ctx[0].fillStyle = color;
        ctx[0].font = width + 'px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        ctx[0].fillText(text, cursor.x, cursor.y);
    } else if (using.id === 'Arc') {
        ctx[1].fillStyle = color;
    } else if (using.id === 'Rect') {
        ctx[1].fillStyle = color;
    } else if (using.id === 'Tri') {
        ctx[1].strokeStyle = color;
        ctx[1].fillStyle = color;
    }

    isDrawing = true;
    prevCursor = cursor;
};

c[2].onmousemove = function (e) {
    var using = document.querySelector('.tools.btn-primary'),
        color = document.querySelector('input[name=color]').value,
        width = lineWidth.value;
    cursor = getCursor(c[1], e);
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
    var pencil = new Image,
        eraser = new Image;
    pencil.src = 'images/pencil.svg';
    eraser.src = 'images/eraser.svg';
    if (using.id === 'Pencil') {
        ctx[2].beginPath();
        ctx[2].strokeStyle = '#000000';
        ctx[2].fillStyle = color;
        ctx[2].arc(cursor.x, cursor.y, width / 2, 0, 2 * Math.PI);
        ctx[2].stroke();
        ctx[2].fill();
        ctx[2].drawImage(pencil, cursor.x + 1, cursor.y - 29, 30, 30);
    } else if (using.id === 'Eraser') {
        ctx[2].beginPath();
        ctx[2].strokeStyle = '#000000';
        ctx[2].fillStyle = '#FFFFFFAA';
        ctx[2].arc(cursor.x, cursor.y, width / 2, 0, 2 * Math.PI);
        ctx[2].stroke();
        ctx[2].fill();
        ctx[2].drawImage(eraser, cursor.x - 3, cursor.y - 25, 30, 30);
    } else if (using.id === 'Text') {
        if (text === null) {
            text = 'TEXT';
        }
        ctx[2].fillStyle = color;
        ctx[2].font = width + 'px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        ctx[2].fillText(text, cursor.x, cursor.y);
    } else if (using.id === 'Arc') {
        ctx[2].fillStyle = '#000000';
        ctx[2].font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        ctx[2].fillText('●', cursor.x - 14, cursor.y + 10);
    } else if (using.id === 'Rect') {
        ctx[2].fillStyle = '#000000';
        ctx[2].font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        ctx[2].fillText('■', cursor.x - 14, cursor.y + 10);
    } else if (using.id === 'Tri') {
        ctx[2].fillStyle = '#000000';
        ctx[2].font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        ctx[2].fillText('▲', cursor.x - 14, cursor.y + 10);
    }
    if (isDrawing) {
        if (using.id === 'Pencil') {
            drawLine();
        } else if (using.id === 'Eraser') {
            drawLine();
        } else if (using.id === 'Arc') {

        } else if (using.id === 'Rect') {

        } else if (using.id === 'Tri') {

        }
    }
    prevCursor = cursor;
};

c[2].onmouseup = c[2].onmouseleave = function () {
    if (isDrawing) {
        isDrawing = false;
        ctx[0].drawImage(c[1], 0, 0);
        ctx[1].clearRect(0, 0, c[0].width, c[0].height);
        imgStack[++index] = ctx[0].getImageData(0, 0, c[0].width, c[0].height);
        imgStack.splice(index + 1);
        undoRedoBtn();
    }
    ctx[2].clearRect(0, 0, c[0].width, c[0].height);
};

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

document.querySelector('#Undo').onclick = function () {
    if (index > 0) {
        ctx[0].putImageData(imgStack[--index], 0, 0);
    }
    undoRedoBtn();
};

document.querySelector('#Redo').onclick = function () {
    if (imgStack[index + 1] !== undefined) {
        ctx[0].putImageData(imgStack[++index], 0, 0);
    }
    undoRedoBtn();
};

document.querySelector('#Refresh').onclick = function () {
    ctx[0].fillStyle = '#FFFFFF';
    ctx[0].fillRect(0, 0, c[0].width, c[0].height);
    imgStack[++index] = ctx[0].getImageData(0, 0, c[0].width, c[0].height);
    imgStack.splice(index + 1);
    undoRedoBtn();
};

document.querySelector('#Save').onclick = function () {
    this.setAttribute('download', 'save.png');
    this.setAttribute('href', c[0].toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    this.click();
};

document.querySelector('input[name=upload]').onchange = function (e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
            var width = img.width;
            var height = img.height;
            if (img.width / img.height > c[0].width / c[0].height) {
                height *= c[0].width / width;
                ctx[0].drawImage(img, 0, (c[0].height - height) / 2, c[0].width, height);
            } else {
                width *= c[0].height / height;
                ctx[0].drawImage(img, (c[0].width - width) / 2, 0, width, c[0].height);
            }
            imgStack[++index] = ctx[0].getImageData(0, 0, c[0].width, c[0].height);
            imgStack.splice(index + 1);
            undoRedoBtn();
        };
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function undoRedoBtn() {
    var undo = document.querySelector('#Undo'),
        redo = document.querySelector('#Redo');
    if (index > 0) {
        undo.removeAttribute('disabled');
    } else {
        undo.setAttribute('disabled', 'disabled');
    }
    if (imgStack[index + 1] !== undefined) {
        redo.removeAttribute('disabled');
    } else {
        redo.setAttribute('disabled', 'disabled');
    }
}