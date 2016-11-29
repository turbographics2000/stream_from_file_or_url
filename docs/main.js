let cnv = document.createElement('canvas');
let ctx = cnv.getContext('2d');
cnv.style.position = 'absolute'
cnv.style.top = '-10000px';
cnv.width = 320;
cnv.height = 240;
document.body.appendChild(cnv);
let video = document.createElement('video');
video.width = 320;
video.height = 240;
let renderStreamId;


btnFromURL.onclick = function() {
    Promise.all([
        fetch('a.mp3').then(res => res.blob()).then(blob => createStreamTrack(blob)),
        fetch('v.webm').then(res => res.blob()).then(blob => createStreamTrack(blob)),
    ]).then(([tracksA, tracksB]) => {
        preview.srcObject = MediaStream([tracksA.audioTrack || tracksB.audioTrack, tracksB.videoTrack]);
        preview.play();
    });
}

function createStreamTrack(blob) {
    return new Promise((resolve, reject) => {
        let video = document.createElement('video');
        video.src = URL.createObjectURL(blob);
        video.onloadeddata = function() {
            let tracks = {};
            if (video.captureStream) {
                videoStream = video.captureStream();
            } else if (video.videoWidth) {
                videoStream = cnv.captureStream();
                if (!renderStreamId) {
                    renderStreamId = requestAnimationFrame(render);
                }
            }
            if (videoStream.getAudioTracks().length) {
                tracks.audioTrack = stream.getAudioTracks()[0];
            } else if (videoStream.getVideoTracks().length) {
                tracks.videoTrack = stream.getVideoTracks()[0];
            }
            videoStream = null;
            resolve(tracks);
        }
    });
}

function render(renderVideoTrack) {
    renderStreamId = requestAnimationFrame(renderVideoTrack);
    let ratio = Math.min(cnv.width / video.videoWidth, cnv.height / video.videoHeight);
    let width = video.videoWidth * ratio;
    let height = video.videoHeight * ratio;
    let left = (cnv.width - width) / 2;
    let top = (cnv.height - height) / 2;
    ctx.drawImage(video, left, top, width, height);
}