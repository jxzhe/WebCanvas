window.onload = function () {
    var date = new Date();
    var footer = document.querySelector('footer');
    footer.innerHTML = footer.innerHTML.replace('2000', date.getFullYear());

    // var canvas = document.querySelector('canvas');
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerWidth > 600 ? 600 : window.innerWidth;

    // var ctx = canvas.getContext("2d");
    // ctx.beginPath();
    // ctx.arc(window.innerWidth / 2, 100, 50, 0, 2 * Math.PI);
    // ctx.stroke();

    var arrow = document.querySelector('header i');
    arrow.onclick = function () {
        document.querySelector('main').scrollIntoView({
            behavior: 'smooth'
        });
    }
}