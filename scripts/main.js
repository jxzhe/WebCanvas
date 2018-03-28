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

var canvas = document.querySelector('canvas'),
    c = document.querySelector('canvas:nth-of-type(2)'),
    cs = document.querySelector('canvas:nth-of-type(3)');

canvas.width = c.width = cs.width = window.innerWidth;
canvas.height = c.height = cs.height = window.innerHeight - footer.scrollHeight;

var context = canvas.getContext('2d'),
    ctx = c.getContext('2d'),
    csx = cs.getContext('2d');

context.fillStyle = '#FFFFFF';
context.fillRect(0, 0, canvas.width, canvas.height);

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
var imgStack = [context.getImageData(0, 0, c.width, c.height)];
var index = 0;
var text;

function getCursor(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

var lineWidth = document.querySelector('#LineWidth');
lineWidth.onmousemove = lineWidth.onchange = function () {
    document.querySelector('label[for=LineWidth]').innerHTML = this.value;
};

cs.onmousedown = function (e) {
    var using = document.querySelector('.tools.btn-primary'),
        color = document.querySelector('input[name=color]').value,
        width = lineWidth.value;
    cursor = getCursor(c, e);
    if (using.id === 'Pencil') {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = ctx.lineJoin = 'round';
        drawLine();
    } else if (using.id === 'Eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = width;
        ctx.lineCap = ctx.lineJoin = 'round';
        drawLine();
    } else if (using.id === 'Text') {
        context.fillStyle = color;
        context.font = width + 'px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        context.fillText(text, cursor.x, cursor.y);
    } else if (using.id === 'Arc') {
        ctx.fillStyle = color;
    } else if (using.id === 'Rect') {
        ctx.fillStyle = color;
    } else if (using.id === 'Tri') {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
    }

    isDrawing = true;
    prevCursor = cursor;
};

cs.onmousemove = function (e) {
    var using = document.querySelector('.tools.btn-primary'),
        color = document.querySelector('input[name=color]').value,
        width = lineWidth.value;
    cursor = getCursor(c, e);
    csx.clearRect(0, 0, c.width, c.height);
    var pencil = new Image,
        eraser = new Image;
    pencil.src = 'images/pencil.svg';
    eraser.src = 'images/eraser.svg';
    if (using.id === 'Pencil') {
        csx.beginPath();
        csx.strokeStyle = '#000000';
        csx.fillStyle = color;
        csx.arc(cursor.x, cursor.y, width / 2, 0, 2 * Math.PI);
        csx.stroke();
        csx.fill();
        csx.drawImage(pencil, cursor.x + 1, cursor.y - 29, 30, 30);
    } else if (using.id === 'Eraser') {
        csx.beginPath();
        csx.strokeStyle = '#000000';
        csx.fillStyle = '#FFFFFFAA';
        csx.arc(cursor.x, cursor.y, width / 2, 0, 2 * Math.PI);
        csx.stroke();
        csx.fill();
        csx.drawImage(eraser, cursor.x - 3, cursor.y - 25, 30, 30);
    } else if (using.id === 'Text') {
        csx.fillStyle = color;
        csx.font = width + 'px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        csx.fillText(text, cursor.x, cursor.y);
    } else if (using.id === 'Arc') {
        csx.fillStyle = '#000000';
        csx.font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        csx.fillText('●', cursor.x - 14, cursor.y + 10);
    } else if (using.id === 'Rect') {
        csx.fillStyle = '#000000';
        csx.font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        csx.fillText('■', cursor.x - 14, cursor.y + 10);
    } else if (using.id === 'Tri') {
        csx.fillStyle = '#000000';
        csx.font = '30px -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue", Arial, sans-serif';
        csx.fillText('▲', cursor.x - 14, cursor.y + 10);
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

cs.onmouseup = function () {
    if (isDrawing) {
        isDrawing = false;
        context.drawImage(c, 0, 0);
        ctx.clearRect(0, 0, c.width, c.height);
        imgStack[++index] = context.getImageData(0, 0, c.width, c.height);
        imgStack.splice(index + 1);
        undoRedoBtn();
    }
    csx.clearRect(0, 0, c.width, c.height);
};

cs.onmouseleave = cs.onmouseup;

function drawLine() {
    ctx.beginPath();
    if (isDrawing) {
        ctx.moveTo(prevCursor.x, prevCursor.y);
    } else {
        ctx.moveTo(cursor.x - 1, cursor.y);
    }
    ctx.lineTo(cursor.x, cursor.y);
    ctx.stroke();
}

document.querySelector('#Undo').onclick = function () {
    if (index > 0) {
        context.putImageData(imgStack[--index], 0, 0);
    }
    undoRedoBtn();
};

document.querySelector('#Redo').onclick = function () {
    if (imgStack[index + 1] !== undefined) {
        context.putImageData(imgStack[++index], 0, 0);
    }
    undoRedoBtn();
};

document.querySelector('#Refresh').onclick = function () {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    imgStack[++index] = context.getImageData(0, 0, c.width, c.height);
    imgStack.splice(index + 1);
    undoRedoBtn();
};

document.querySelector('#Save').onclick = function () {
    this.setAttribute('download', 'save.png');
    this.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    this.click();
};

document.querySelector('input[name=upload]').onchange = function (e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
            var width = img.width;
            var height = img.height;
            if (img.width / img.height > canvas.width / canvas.height) {
                height *= canvas.width / width;
                context.drawImage(img, 0, (canvas.height - height) / 2, canvas.width, height);
            } else {
                width *= canvas.height / height;
                context.drawImage(img, (canvas.width - width) / 2, 0, width, canvas.height);
            }
            imgStack[++index] = context.getImageData(0, 0, c.width, c.height);
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