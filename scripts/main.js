window.onload = function () {
    var arrow = document.querySelector('header i');
    arrow.onclick = function () {
        document.querySelector('footer').scrollIntoView({
            behavior: 'smooth'
        });
    }

    document.querySelector('main').style.height = String(window.innerHeight * 0.9) + 'px';
    document.querySelector('footer').style.height = String(window.innerHeight * 0.1) + 'px';

    var canvas = document.querySelectorAll('canvas');
    canvas[0].width = canvas[1].width = window.innerWidth;
    canvas[0].height = canvas[1].height = window.innerHeight * 0.9;

    var context = [];
    context[0] = canvas[0].getContext('2d');
    context[1] = canvas[1].getContext('2d');

    context[0].fillStyle = '#FFF';
    context[0].fillRect(0, 0, canvas[0].width, canvas[0].height);

    var isFirst = true,
        isPainting = false,
        clickUndo = false,
        clickRefresh = false,
        uploadImage = false;

    var cursor = {},
        prevCursor = {},
        lineHistory = [];

    canvas[1].addEventListener('mousedown', function (e) {
        if (isFirst) {
            isFirst = false;
        } else {
            printToCanvas();
            context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
        }
        redo.setAttribute('disabled', 'disabled');
        undo.removeAttribute('disabled');

        context[1].strokeStyle = document.querySelector('input[type=color]').value;
        if (document.querySelector('#Eraser').classList.contains('btn-primary')) {
            context[1].strokeStyle = '#FFF';
        }
        context[1].lineWidth = document.querySelector('input[type=range]').value;
        context[1].lineJoin = "round";
        context[1].lineCap = "round";

        lineHistory.push(context[1].strokeStyle);
        lineHistory.push(context[1].lineWidth);

        cursor = getCursor(canvas[1], e);
        draw();
        prevCursor = cursor;
    });

    canvas[1].addEventListener('mousemove', function (e) {
        if (isPainting) {
            cursor = getCursor(canvas[1], e);
            draw();
            prevCursor = cursor;
        }
    });

    canvas[1].addEventListener('mouseup', function (e) {
        isPainting = false;
    });

    canvas[1].addEventListener('mouseleave', function (e) {
        isPainting = false;
    });

    function getCursor(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function draw() {
        context[1].beginPath();
        if (!isPainting) {
            context[1].moveTo(cursor.x - 1, cursor.y);
            lineHistory.push({
                x: cursor.x - 1,
                y: cursor.y,
            });
            isPainting = true;
        } else {
            context[1].moveTo(prevCursor.x, prevCursor.y);
        }
        context[1].lineTo(cursor.x, cursor.y);
        lineHistory.push(cursor);
        context[1].closePath();
        context[1].stroke();
    }

    function printToCanvas() {
        context[0].drawImage(canvas[1], 0, 0);
        // if (clickUndo) {
        //     context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
        //     canvas[1].style.opacity = '1';
        //     clickUndo = false;
        // } else if (clickRefresh) {
        //     context[0].fillStyle = '#FFF';
        //     context[0].fillRect(0, 0, canvas[0].width, canvas[0].height);
        //     clickRefresh = false;
        // } else if (uploadImage) {
        //     var width = img.width;
        //     var height = img.height;
        //     if (img.width / img.height > canvas[0].width / canvas[0].height) {
        //         height *= canvas[0].width / width;
        //         context[0].drawImage(img, 0, (canvas[0].height - height) / 2, canvas[0].width, height);
        //     } else {
        //         width *= canvas[0].height / height;
        //         context[0].drawImage(img, (canvas[0].width - width) / 2, 0, width, canvas[0].height);
        //     }
        //     context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
        //     uploadImage = false;
        // } else {
        //     context[0].strokeStyle = lineHistory[0];
        //     context[0].lineWidth = lineHistory[1];
        //     context[0].lineJoin = "round";
        //     context[0].lineCap = "round";
        //     for (var i = 3; i < lineHistory.length; ++i) {
        //         context[0].beginPath();
        //         context[0].moveTo(lineHistory[i - 1].x, lineHistory[i - 1].y);
        //         context[0].lineTo(lineHistory[i].x, lineHistory[i].y);
        //         context[0].closePath();
        //         context[0].stroke();
        //     }
        // }
        lineHistory.length = 0;
    }

    var buttons = document.querySelectorAll('.tool');
    for (var i = 0; i < buttons.length; ++i) {
        buttons[i].addEventListener('click', function () {
            var others = document.querySelectorAll('footer>button');
            for (var i = 0; i < others.length; ++i) {
                others[i].classList.add('btn-secondary');
                others[i].classList.remove('btn-primary');
            }
            this.classList.add('btn-primary');
            this.classList.remove('btn-secondary');
        });
    }

    var penSize = document.querySelector('input[type=range]');
    penSize.addEventListener('mousemove', function () {
        document.querySelector('input[type=range]+div').innerHTML = this.value;
    });
    penSize.addEventListener('change', function () {
        document.querySelector('input[type=range]+div').innerHTML = this.value;
    });

    var undo = document.querySelector('#Undo'),
        redo = document.querySelector('#Redo');

    undo.addEventListener('click', function () {
        canvas[1].style.opacity = '0';
        clickUndo = true;
        undo.setAttribute('disabled', 'disabled');
        redo.removeAttribute('disabled');
    });

    redo.addEventListener('click', function () {
        canvas[1].style.opacity = '1';
        clickUndo = false;
        redo.setAttribute('disabled', 'disabled');
        undo.removeAttribute('disabled');
    });

    document.querySelector('#Refresh').addEventListener('click', function () {
        if (!isFirst) {
            printToCanvas();
            redo.setAttribute('disabled', 'disabled');
            undo.removeAttribute('disabled');
            context[1].fillStyle = "#FFF";
            context[1].fillRect(0, 0, canvas[1].width, canvas[1].height);
            clickRefresh = true;
        }
    });

    document.querySelector('#Save').addEventListener('click', function () {
        printToCanvas();
        undo.setAttribute('disabled', 'disabled');
        redo.setAttribute('disabled', 'disabled');
        this.setAttribute('download', 'save.png');
        this.setAttribute('href', canvas[0].toDataURL("image/png").replace("image/png", "image/octet-stream"));
        this.click();
    });

    document.querySelector('input[name=imageLoader]').addEventListener('change', handleImage, false);

    function handleImage(e) {
        if (!isFirst) {
            printToCanvas();
            context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
        }
        redo.setAttribute('disabled', 'disabled');
        undo.removeAttribute('disabled');

        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                var width = img.width;
                var height = img.height;
                if (img.width / img.height > canvas[1].width / canvas[1].height) {
                    height *= canvas[1].width / width;
                    context[1].drawImage(img, 0, (canvas[1].height - height) / 2, canvas[1].width, height);
                } else {
                    width *= canvas[1].height / height;
                    context[1].drawImage(img, (canvas[1].width - width) / 2, 0, width, canvas[1].height);
                }
            };
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
        uploadImage = true;
    }
}