var _isDown, _points, _r, _g, _rc;

$(document).ready(function() {

    $('video').removeAttr('controls'); // remove default video UI
    _points = new Array();
    _r = new DollarRecognizer();

    var canvas = document.getElementById('canvas');
    _g = canvas.getContext('2d');

    // make canvas size of window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    _g.fillStyle = "rgb(47,149,237)";
    _g.strokeStyle = "rgb(47,149,237)";
    _g.lineWidth = 3;
    _rc = getCanvasRect(canvas);
    _isDown = false;

    var $msg = $('#last-command');
    var video = document.getElementById('video');

    $('#canvas').mousedown(function(e) {
        var x = e.clientX;
        var y = e.clientY;
        document.onselectstart = function() { return false; } // disable drag-select
        document.onmousedown = function() { return false; } // disable drag-select
        _isDown = true;
        x -= _rc.x;
        y -= _rc.y - getScrollY();
        if (_points.length > 0)
            _g.clearRect(0, 0, _rc.width, _rc.height);
        _points.length = 1; // clear
        _points[0] = new Point(x, y);
        _g.fillRect(x - 4, y - 3, 9, 9);
    });

    $('#canvas').mousemove(function(e) {
        var x = e.clientX;
        var y = e.clientY;
        if (_isDown) {
            x -= _rc.x;
            y -= _rc.y - getScrollY();
            _points[_points.length] = new Point(x, y); // append
            drawConnectedPoint(_points.length - 2, _points.length - 1);
        }
    });

    $('#canvas').mouseup(function(e) {
        var x = e.clientX;
        var y = e.clientY;
        document.onselectstart = function() { return true; } // enable drag-select
        document.onmousedown = function() { return true; } // enable drag-select
        if (_isDown)
        {
            _isDown = false;

            if (_points.length >= 10)
            {
                var result = _r.Recognize(_points, false);

                // play/pause
                if(result.Name == 'play-pause') {
                    if(video.paused == true) {
                        $msg.text('PLAY');
                        video.play();
                    }
                    else {
                        $msg.text('PAUSE');
                        video.pause();
                    }
                }

                // seek forward
                else if(result.Name == 'seek-forward') {
                    $msg.text('SEEK FORWARD');
                    video.currentTime+=10;
                }

                // seek backward
                else if(result.Name == 'seek-backward') {
                    $msg.text('SEEK BACKWARD');
                    video.currentTime-=10;
                }

                // speed increase
                else if(result.Name == 'speed-increase') {
                    $msg.text('SPEED INCREASED');
                    if(video.playbackRate < 1) {
                        video.playbackRate *= 2;
                    }
                    else {
                        video.playbackRate += 0.5;
                    }
                    $('#speed').text(video.playbackRate.toFixed(2));
                }

                // speed decrease
                else if(result.Name == 'speed-decrease') {
                    $msg.text('SPEED DECREASED');
                    if(video.playbackRate < 1) {
                        video.playbackRate /= 2;
                    }
                    else {
                        video.playbackRate -= 0.5;
                    }
                    $('#speed').text(video.playbackRate.toFixed(2));
                }

                // volume increase
                else if(result.Name == 'volume-increase') {
                    if(video.volume <= 0.9) {
                        $msg.text('VOLUME INCREASED');
                        video.volume+=0.1;
                    }
                    else {
                        $msg.text('VOLUME INCREASED (MAX)');
                        video.volume = 1;
                    }
                    if(video.muted == false) {
                        $('#volume').text(video.volume.toFixed(1));
                    }
                }

                // volume decrease
                else if(result.Name == 'volume-decrease') {
                    if(video.volume >= 0.1) {
                        $msg.text('VOLUME DECREASED');
                        video.volume-=0.1;
                    }
                    else {
                        $msg.text('VOLUME DECREASED (MIN)');
                        video.volume = 0;
                    }
                    if(video.muted == false) {
                        $('#volume').text(video.volume.toFixed(1));
                    }
                }

                // mute/unmute
                else if(result.Name == 'mute-unmute') {
                    if(video.muted == true) {
                        $msg.text('UNMUTED');
                        video.muted = false;
                        $('#volume').text(video.volume.toFixed(1));
                    }
                    else {
                        $msg.text('MUTED');
                        video.muted = true;
                        $('#volume').text('MUTED');
                    }
                }

                // size increase
                else if(result.Name == 'size-increase') {
                    if(video.offsetHeight < 230) {
                        $msg.text('SIZE INCREASED');
                        video.style.width = '605px';
                        video.style.height = '340px';
                    }
                    else if(video.offsetHeight < 345) {
                        $msg.text('SIZE INCREASED (MAX)');
                        video.style.width = '854px';
                        video.style.height = '480px';
                    }
                    else {
                        $msg.text('SIZE INCREASED (MAX)');
                    }
                }

                // size decrease
                else if(result.Name == 'size-decrease') {
                    if(video.offsetHeight > 475) {
                        $msg.text('SIZE DECREASED');
                        video.style.width = '605px';
                        video.style.height = '340px';
                    }
                    else if(video.offsetHeight > 335) {
                        $msg.text('SIZE DECREASED (MIN)');
                        video.style.width = '400px';
                        video.style.height = '225px';
                    }
                    else {
                        $msg.text('SIZE DECREASED (MIN)');
                    }
                }

                // seek to start
                else if(result.Name == 'seek-to-start') {
                    $msg.text('SEEK TO START');
                    video.currentTime = 0;
                }

                // speed reset
                else if(result.Name == 'speed-reset') {
                    $msg.text('SPEED RESET');
                    video.playbackRate = 1;
                    $('#speed').text(video.playbackRate.toFixed(2));
                }
            }
            else // fewer than 10 points were inputted
            {
                $msg.text('NONE');
            }
        }
    });

    setInterval(function() {
        var time = video.currentTime;
        $('#time').text(Math.round(time));
    }, 250);
});

function getCanvasRect(canvas)
{
    var w = canvas.width;
    var h = canvas.height;

    var cx = canvas.offsetLeft;
    var cy = canvas.offsetTop;
    while (canvas.offsetParent != null)
    {
        canvas = canvas.offsetParent;
        cx += canvas.offsetLeft;
        cy += canvas.offsetTop;
    }
    return {x: cx, y: cy, width: w, height: h};
}

function getScrollY()
{
    var scrollY = 0;
    if (typeof(document.body.parentElement) != 'undefined')
    {
        scrollY = document.body.parentElement.scrollTop; // IE
    }
    else if (typeof(window.pageYOffset) != 'undefined')
    {
        scrollY = window.pageYOffset; // FF
    }
    return scrollY;
}

function drawText(str)
{
    _g.fillStyle = "rgb(255,255,136)";
    _g.fillRect(0, 0, _rc.width, 20);
    _g.fillStyle = "rgb(0,0,255)";
    _g.fillText(str, 1, 14);
}

function drawConnectedPoint(from, to)
{
    _g.beginPath();
    _g.moveTo(_points[from].X, _points[from].Y);
    _g.lineTo(_points[to].X, _points[to].Y);
    _g.closePath();
    _g.stroke();
}

function round(n, d) // round 'n' to 'd' decimals
{
    d = Math.pow(10, d);
    return Math.round(n * d) / d
}