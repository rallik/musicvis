const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');


const context = new AudioContext()
const analyserNode = new AnalyserNode(context, {fftSize: 256})
const gainNode = new GainNode(context, {gain: volume.value})
const bassEQ = new BiquadFilterNode(context, {
    type: 'lowshelf',
    frequency: 500,
    gain: bass.value
})

const midEQ = new BiquadFilterNode(context, {
    type: 'peaking',
    Q: Math.SQRT1_2,
    frequency: 1500,
    gain: mid.value
})

const trebleEQ = new BiquadFilterNode(context, {
    type: 'highshelf',
    frequency: 3000,
    gain: treble.value
})
// console.log(analyserNode)

setupContext()
resize()
setUpEventListeners()
drawVisualizer()

function setUpEventListeners() {
    window.addEventListener('resize', resize)

    volume.addEventListener('input', e => {
        const value = parseFloat(e.target.value)
        gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01)
    })

    volume.addEventListener('dblclick', e => {
        volume.value = e.target.max / 2;
    })

    bass.addEventListener('input', e => {
        const value = parseFloat(e.target.value)
        bassEQ.gain.setTargetAtTime(value, context.currentTime, 0.01)
    })
    bass.addEventListener('dblclick', e => {
        bass.value = 0;
    })

    mid.addEventListener('input', e => {
        const value = parseFloat(e.target.value)
        midEQ.gain.setTargetAtTime(value, context.currentTime, 0.01)
    })
    mid.addEventListener('dblclick', e => {
        mid.value = 0;
    })

    treble.addEventListener('input', e => {
        const value = parseFloat(e.target.value)
        trebleEQ.gain.setTargetAtTime(value, context.currentTime, 0.01)
    })
    treble.addEventListener('dblclick', e => {
        treble.value = 0;
    })
}

async function setupContext() {
    const sound = await getSound()
    if (context.state === 'suspended') {
        await context.resume()
    }
    const source = context.createMediaStreamSource(sound)
    source
        .connect(gainNode)
        .connect(bassEQ)
        .connect(midEQ)
        .connect(analyserNode)
        .connect(context.destination)
}

function getSound() {
    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0
        }
    })
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer)

    const bufferLength = analyserNode.frequencyBinCount;
    const dataAray = new Uint8Array(bufferLength);
    // console.log(dataAray)



    analyserNode.getByteFrequencyData(dataAray)
    const width = visualizer.width;
    const height = visualizer.height;
    const barWidth = width / bufferLength;

    const canvasContext = visualizer.getContext('2d')
    canvasContext.clearRect(0, 0, width, height)

    dataAray.forEach((item, index) => {
        const y = item / 255 * (height/1.25);
        const x = (barWidth * index);
        

        // y / height * 400 is value relative to screen (red --> blue)
        canvasContext.fillStyle = `hsl(${y / height * 375}, 100%, 50%)`;
        // canvasContext.strokeStyle = 
        canvasContext.fillRect(x, height - y, barWidth, y)
    })
}

function resize() {
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
    console.log(visualizer.width)
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
    console.log(visualizer.height)
}
