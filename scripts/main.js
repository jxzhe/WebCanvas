window.onload = function () {
    var arrow = document.querySelector('header i');
    arrow.onclick = function () {
        document.querySelector('footer').scrollIntoView({
            behavior: 'smooth'
        });
    }

    document.querySelector('footer').style.height = String(window.innerHeight * 0.1) + 'px';

    var canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.9;

    var context = canvas.getContext('2d');
    context.fillStyle = '#FFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    var paint = false;
    var cursor = {},
        prevCursor = {};

    canvas.addEventListener('mousedown', function (e) {
        cursor = getCursor(canvas, e);
        draw();
        paint = true;
        prevCursor.x = cursor.x;
        prevCursor.y = cursor.y;
    });

    canvas.addEventListener('mousemove', function (e) {
        if (paint) {
            cursor = getCursor(canvas, e);
            draw();
            prevCursor.x = cursor.x;
            prevCursor.y = cursor.y;
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        paint = false;
    });

    canvas.addEventListener('mouseleave', function (e) {
        paint = false;
    });

    function getCursor(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function draw() {
        context.strokeStyle = document.querySelector('input[type=color]').value;
        if (document.querySelector('#Eraser').classList.contains('btn-primary')) {
            context.strokeStyle = '#FFF';
        }
        context.lineWidth = document.querySelector('input[type=range]').value;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        if (paint) {
            context.moveTo(prevCursor.x, prevCursor.y);
        } else {
            context.moveTo(cursor.x - 1, cursor.y);
        }
        context.lineTo(cursor.x, cursor.y);
        context.closePath();
        context.stroke();
    }

    var buttons = document.querySelectorAll('footer>button');
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

    document.querySelector('input[type=range]').addEventListener('mousemove', function () {
        document.querySelector('input[type=range]+div').innerHTML = this.value;
    });

    document.querySelector('input[type=range]').addEventListener('change', function () {
        document.querySelector('input[type=range]+div').innerHTML = this.value;
    });

    document.querySelector('#Refresh').addEventListener('click', function () {
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });

    document.querySelector('#Save').addEventListener('click', function () {
        this.setAttribute('download', 'paint.png');
        this.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        this.click();
    });

    document.querySelector('input[name=imageLoader]').addEventListener('change', handleImage, false);

    function handleImage(e) {
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
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
    }
}