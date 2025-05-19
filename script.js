const baseColorInput = document.getElementById('baseColor');
const schemeSelect = document.getElementById('colorScheme');
const resultColors = document.getElementById('resultColors');
const btnClear = document.getElementById('btnClear');
const btnExport = document.getElementById('btnExport');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const descEl = document.getElementById('relationDescription');

const descriptions = {
  complementar: "Usa cores opostas no círculo cromático, criando alto contraste.",
  analogous: "Usa cores vizinhas no círculo cromático para harmonia suave.",
  monochromatic: "Variações de saturação e luminosidade de uma única cor.",
  triad: "Três cores equidistantes, formando um triângulo no círculo cromático.",
  splitComplementary: "A cor oposta e as duas vizinhas da complementar.",
  rectangle: "Quatro cores em pares complementares, formando um retângulo.",
  square: "Quatro cores equidistantes, formando um quadrado no círculo cromático."
};

function hexToHSL(H) {
  let r = parseInt(H.slice(1, 3), 16) / 255;
  let g = parseInt(H.slice(3, 5), 16) / 255;
  let b = parseInt(H.slice(5, 7), 16) / 255;

  let cmax = Math.max(r, g, b), cmin = Math.min(r, g, b), delta = cmax - cmin;
  let h = 0, s = 0, l = (cmax + cmin) / 2;

  if (delta !== 0) {
    if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return { h, s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c/2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return "#" + [r, g, b].map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('');
}

function adjustHue(h, degree) {
  return (h + degree + 360) % 360;
}

function generateColors(baseHex, scheme) {
  const { h, s, l } = hexToHSL(baseHex);
  switch (scheme) {
    case 'complementar': return [baseHex, hslToHex(adjustHue(h, 180), s, l)];
    case 'analogous': return [hslToHex(adjustHue(h, -30), s, l), baseHex, hslToHex(adjustHue(h, 30), s, l)];
    case 'monochromatic': return [hslToHex(h, s, Math.min(l + 20, 100)), baseHex, hslToHex(h, s, Math.max(l - 20, 0))];
    case 'triad': return [baseHex, hslToHex(adjustHue(h, 120), s, l), hslToHex(adjustHue(h, 240), s, l)];
    case 'splitComplementary': return [baseHex, hslToHex(adjustHue(h, 150), s, l), hslToHex(adjustHue(h, 210), s, l)];
    case 'rectangle': return [baseHex, hslToHex(adjustHue(h, 60), s, l), hslToHex(adjustHue(h, 180), s, l), hslToHex(adjustHue(h, 240), s, l)];
    case 'square': return [baseHex, hslToHex(adjustHue(h, 90), s, l), hslToHex(adjustHue(h, 180), s, l), hslToHex(adjustHue(h, 270), s, l)];
    default: return [baseHex];
  }
}

function getTextColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const luminance = 0.2126*r + 0.7152*g + 0.0722*b;
  return luminance > 180 ? '#000' : '#fff';
}

function updateDisplay() {
  const base = baseColorInput.value;
  const scheme = schemeSelect.value;
  const colors = generateColors(base, scheme);

  resultColors.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-box';
    div.style.backgroundColor = color;
    div.style.color = getTextColor(color);
    div.innerText = color.toUpperCase();
    resultColors.appendChild(div);
  });

  descEl.textContent = descriptions[scheme] || '';
}

btnClear.addEventListener('click', () => {
  baseColorInput.value = '#ff0000';
  schemeSelect.value = 'complementar';
  resultColors.innerHTML = '';
  descEl.textContent = '';
});

btnExport.addEventListener('click', () => {
  if (!resultColors.hasChildNodes()) {
    alert("Gere uma paleta antes de exportar.");
    return;
  }
  html2canvas(resultColors).then(canvas => {
    const link = document.createElement('a');
    link.download = 'paleta.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

toggleDarkMode.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

baseColorInput.addEventListener('input', updateDisplay);
schemeSelect.addEventListener('change', updateDisplay);

// Inicial
updateDisplay();
