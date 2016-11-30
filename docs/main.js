window.MediaStream = window.MediaStream || window.webkitMediaStream;
let cnv = document.createElement('canvas');
let ctx = cnv.getContext('2d');
cnv.style.position = 'absolute'
cnv.style.top = '-10000px';
cnv.width = 320;
cnv.height = 240;
//document.body.appendChild(cnv);
let video = document.createElement('video');
video.captureStream = video.captureStream || video.mozCaptureStream;
video.width = 320;
video.height = 240;
let renderStreamId;


btnFromURL.onclick = function () {
    let tracks = [];
    fetch('a.mp3')
        .then(res => res.blob())
        .then(blob => createStreamTrack(blob, 'audio'))
        .then(track => {
            tracks.concat(track);
        }).then(_ => {
            return fetch('v.mp4')
                .then(res => res.blob())
                .then(blob => createStreamTrack(blob, 'video'))
        }).then(track => {
            tracks.concat(track);
            preview.srcObject = new MediaStream(tracks);
        });
}

function createStreamTrack(blob, kind) {
    return new Promise((resolve, reject) => {
        video.onloadeddata = function () {
            video.muted = true;
            video.play();
            if (video.captureStream) {
                videoStream = video.captureStream();
            } else if (video.videoWidth) {
                videoStream = cnv.captureStream();
                if (!renderStreamId) {
                    renderStreamId = requestAnimationFrame(render);
                }
            }
            let tracks = videoStream.getTracks();
            if(kind) {
                resolve(tracks.filter(track => track.kind === kind));
            } else {
                resolve(tracks);
            }
        }
        video.src = URL.createObjectURL(blob);
    });
}

function render(renderVideoTrack) {
    renderStreamId = requestAnimationFrame(render);
    let ratio = Math.min(cnv.width / video.videoWidth, cnv.height / video.videoHeight);
    let width = video.videoWidth * ratio;
    let height = video.videoHeight * ratio;
    let left = (cnv.width - width) / 2;
    let top = (cnv.height - height) / 2;
    ctx.drawImage(video, left, top, width, height);
}