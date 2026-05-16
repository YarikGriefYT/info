const audio = new Audio('ss6.mp3');
audio.loop = true;

const ctx = new AudioContext();
const src = ctx.createMediaElementSource(audio);

const analyser = ctx.createAnalyser();
analyser.fftSize = 256;

src.connect(analyser);
analyser.connect(ctx.destination);

const dataArray = new Uint8Array(analyser.frequencyBinCount);

document.addEventListener('click', async () => {
  await ctx.resume();
  audio.play();
}, { once: true });

const vizBar = document.getElementById('vizBar');

const BAR_N = 32;
const barEls = [];

for (let i = 0; i < BAR_N; i++) {
  const el = document.createElement('div');

  el.className = 'bar-col';

  const t = i / (BAR_N - 1);

  const r = Math.round(80 + t * 80);
  const g = Math.round(40 + t * 60);
  const b = Math.round(180 + t * 75);

  el.style.background = rgb(${r},${g},${b});
  el.style.boxShadow = 0 0 6px rgba(${r},${g},${b},0.6);

  vizBar.appendChild(el);
  barEls.push(el);
}

function updateBars() {
  requestAnimationFrame(updateBars);

  analyser.getByteFrequencyData(dataArray);

  for (let i = 0; i < BAR_N; i++) {
    const idx = (i / BAR_N * dataArray.length) | 0;

    const value = dataArray[idx] / 255;

    const height = 4 + value * 32;

    barEls[i].style.height = height + 'px';
    barEls[i].style.opacity = 0.4 + value;
  }
}

updateBars();
