// ===== ВИЗУАЛИЗАТОР =====
const audio = document.getElementById('bg-music');
const vizBar = document.getElementById('vizBar');

// Создаём полоски
const BAR_N = 32;
const barEls = [];

for (let i = 0; i < BAR_N; i++) {
  const el = document.createElement('div');
  el.className = 'bar-col';
  
  const t = i / (BAR_N - 1);
  const r = Math.round(80 + t * 80);
  const g = Math.round(40 + t * 60);
  const b = Math.round(180 + t * 75);
  
  el.style.background = `rgb(${r},${g},${b})`;
  el.style.boxShadow = `0 0 6px rgba(${r},${g},${b},0.6)`;
  
  vizBar.appendChild(el);
  barEls.push(el);
}

let audioContext, analyser, dataArray, source;
let isVisualizerActive = false;
let animationId = null;

function initVisualizer() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    vizBar.classList.add('visible');
    isVisualizerActive = true;
    drawVisualizer();
  } catch (e) {
    console.log('Визуализатор не поддерживается:', e);
  }
}

function drawVisualizer() {
  if (!isVisualizerActive) return;
  
  animationId = requestAnimationFrame(drawVisualizer);
  
  analyser.getByteFrequencyData(dataArray);
  
  for (let i = 0; i < BAR_N; i++) {
    const idx = (i / BAR_N * dataArray.length) | 0;
    const value = dataArray[idx] / 255;
    const height = 4 + value * 32;
    barEls[i].style.height = height + 'px';
    barEls[i].style.opacity = 0.4 + value;
  }
}

// Запускаем визуализатор при старте музыки
audio.addEventListener('play', () => {
  if (!audioContext) {
    initVisualizer();
  } else if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  isVisualizerActive = true;
  drawVisualizer();
});

audio.addEventListener('pause', () => {
  isVisualizerActive = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  // Сбрасываем полоски
  barEls.forEach(bar => {
    bar.style.height = '4px';
    bar.style.opacity = '0.4';
  });
});

// Показываем визуализатор при клике на экран входа
enterScreen.addEventListener('click', () => {
  setTimeout(() => {
    vizBar.classList.add('visible');
  }, 500);
});