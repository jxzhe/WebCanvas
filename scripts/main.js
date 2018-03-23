window.onload = function () {
//    var date = new Date();
//    var footer = document.querySelector('footer');
//    footer.innerHTML = footer.innerHTML.replace('2000', date.getFullYear());

    var arrow = document.querySelector('header i');
    arrow.onclick = function () {
        document.querySelector('main').scrollIntoView({
            behavior: 'smooth'
        });
    }

    var canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;

    var context = canvas.getContext('2d');
    var paint;
    var prevCursor = {};

    canvas.addEventListener('mousedown', function(e) {
        var cursor = getCursor(canvas, e);
        draw(cursor);
        paint = true;
        prevCursor.x = cursor.x;
        prevCursor.y = cursor.y;
    });

    canvas.addEventListener('mousemove', function(e) {
        if (paint) {
            var cursor = getCursor(canvas, e);
            draw(cursor);
            prevCursor.x = cursor.x;
            prevCursor.y = cursor.y;
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        paint = false;
    });

    canvas.addEventListener('mouseleave', function(e) {
        paint = false;
    });

    function getCursor(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function draw(cursor) {
        context.strokeStyle = "red";
        context.lineJoin = "round";
        context.lineWidth = 5;
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
}
