'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('edited');
const original = $('original');
const stage = $('stage');
const photo = $('photo');
const panel = $('panel');
const iconPaths = {
  aperture:'<circle cx="12" cy="12" r="9"/><path d="m8 4 5 8m7-5H10m10 9-5-8m1 12-5-8m-7 5h10M4 8l5 8"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-4 3 2 4-5 6 6"/>',
  undo:'<path d="M9 5 4 10l5 5m-5-5h10a5 5 0 0 1 0 10h-3"/>',
  redo:'<path d="m15 5 5 5-5 5m5-5H10a5 5 0 0 0 0 10h3"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  download:'<path d="M12 4v12m-5-5 5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  dumbbell:'<path d="m6 18 12-12M4 14l6 6m4-16 6 6M2 17l5 5m10-20 5 5M4 20l2-2M18 6l2-2"/>',
  sliders:'<path d="M4 6h8m4 0h4M4 12h3m4 0h9M4 18h11m4 0h1"/><circle cx="14" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  sparkles:'<path d="M12 3c0 5 2 7 7 7-5 0-7 2-7 7 0-5-2-7-7-7 5 0 7-2 7-7ZM5 14v6m-3-3h6m12-2v6m-3-3h6"/>',
  effects:'<circle cx="8.5" cy="10" r="5"/><circle cx="15.5" cy="10" r="5"/><circle cx="12" cy="15" r="5"/>',
  crop:'<path d="M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13"/>',
  text:'<path d="M4 7V4h16v3M12 4v16m-4 0h8"/>',
  compare:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 3v18m-4-11-2 2 2 2m8-4 2 2-2 2"/>',
  arrows:'<path d="M4 12h16m-5-4 5 4-5 4m-6-8-5 4 5 4"/>',
  minus:'<path d="M5 12h14"/>', plus:'<path d="M5 12h14m-7-7v14"/>',
  maximize:'<path d="M9 4H4v5m11-5h5v5m0 6v5h-5M4 15v5h5"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 7m-1-7V4m0 6h6"/>',
  rotate:'<path d="M4 10a8 8 0 1 1 1 7m-1-7V4m0 6h6"/><rect x="9" y="10" width="6" height="6" rx="1"/>',
  flip:'<path d="M12 3v18M8 6l-5 12h5zm8 0 5 12h-5z"/>',
};
function icon(name) {
  return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + iconPaths[name] + '</svg>';
}
document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

const sections = {
  gym:['dumbbell','Modo Academia','Ajustes para fotos de treino'],
  adjust:['sliders','Ajustes','Controle a luz, a cor e os detalhes'],
  retouch:['sparkles','Retoque','Pele, textura e redução de ruído'],
  effects:['effects','Efeitos visuais','Escolha um filtro e dose a intensidade'],
  crop:['crop','Corte e rotação','Ajuste o enquadramento e o horizonte'],
  text:['text','Texto na foto','Adicione uma frase ou assinatura'],
};
const presets = {
  none:{label:'Original', values:{}},
  focus:{label:'Definição', values:{brightness:12,contrast:17,shadows:16,highlights:-9,clarity:32,sharpness:20,warmth:5,vignette:18}},
  dark:{label:'Gym Dark', values:{brightness:-9,contrast:33,shadows:-16,highlights:-12,clarity:24,saturation:-22,vignette:42}},
  warm:{label:'Golden Hour', values:{brightness:7,contrast:11,shadows:12,warmth:35,saturation:12,fade:15,vignette:12}},
  mono:{label:'Preto e branco', short:'P&B', values:{saturation:-100,contrast:24,clarity:23,sharpness:12,vignette:25}},
  cinema:{label:'Cinemático', values:{brightness:-2,contrast:16,warmth:12,tint:-17,saturation:-19,fade:22,vignette:25,grain:8}},
  clean:{label:'Natural', values:{brightness:8,shadows:12,highlights:-10,saturation:7,clarity:9,sharpness:6}},
  cool:{label:'Luz fria', values:{brightness:6,contrast:17,warmth:-30,shadows:10,saturation:-10,clarity:13,tint:10}},
};
const fields = {
  brightness:['Brilho',-100,100], exposure:['Exposição',-100,100], contrast:['Contraste',-100,100],
  highlights:['Realces',-100,100], shadows:['Sombras',-100,100], saturation:['Saturação',-100,100],
  warmth:['Temperatura',-100,100], tint:['Matiz verde / magenta',-100,100], clarity:['Definição',-60,100],
  sharpness:['Nitidez',0,100], smooth:['Suavizar pele',0,100], denoise:['Redução de ruído',0,100], skinLight:['Iluminar pele',-60,100],
  vignette:['Vinheta',0,100], fade:['Efeito fosco',0,100], grain:['Grão',0,100], intensity:['Intensidade do filtro',0,100],
  cropScale:['Área do corte',25,100,'%'], cropX:['Posição horizontal',0,100,'%'], cropY:['Posição vertical',0,100,'%'], straighten:['Endireitar',-45,45,'°'],
  textSize:['Tamanho do texto',2,18,'%'], textOpacity:['Opacidade',10,100,'%'],
};
const defaults = Object.fromEntries(Object.keys(fields).map((key) => [key, 0]));
Object.assign(defaults, {preset:'none',intensity:100,ratio:'original',cropScale:100,cropX:50,cropY:50,rotation:0,flipX:false,flipY:false,text:'',textSize:6,textColor:'#ffffff',textOpacity:100,textPosition:'bottom'});
let state = {...defaults, preset:'focus', smooth:14};
let history = [state];
let historyIndex = 0;
let section = 'gym';
let source = null;
let filename = 'Treino em foco.jpg';
let sample = true;
let imageLoad = 0;
let zoom = 1;
let compare = true;
let frame = 0;
let toastTimer;
let renderKey = '';
let rawPixels = null;
let tipsTimer;
const clamp = (n, low, high) => Math.max(low, Math.min(high,n));
const signed = (n) => n > 0 ? '+' + n : String(n);
function formatValue(key, value) {
  return fields[key][3] ? value + fields[key][3] : fields[key][1] < 0 ? signed(value) : String(value);
}
function fillRange(input) {
  input.style.setProperty('--fill', (100 * (input.value - input.min) / (input.max - input.min)) + '%');
}
function notify(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
}
function updateHistory() {
  $('undo').disabled = historyIndex <= 0;
  $('redo').disabled = historyIndex + 1 >= history.length;
}
function commit() {
  if (JSON.stringify(state) === JSON.stringify(history[historyIndex])) return;
  history = history.slice(0, historyIndex + 1).concat(state).slice(-65);
  historyIndex = history.length - 1;
  updateHistory();
}
function traverse(offset) {
  const next = historyIndex + offset;
  if (next < 0 || next >= history.length) return;
  historyIndex = next;
  state = history[next];
  sync();
}
function change(values, save = true) {
  state = {...state, ...values};
  if (save) commit();
  schedule();
  updateGuide();
}
function sync() {
  renderPanel();
  highlightPresets();
  updateGuide();
  updateHistory();
  schedule();
}

function slider(key) {
  const [label, min, max] = fields[key];
  return '<div class="slider"><label for="f-' + key + '">' + label + '<output id="v-' + key + '">' + formatValue(key,state[key]) + '</output></label><input type="range" id="f-' + key + '" data-field="' + key + '" min="' + min + '" max="' + max + '" value="' + state[key] + '"></div>';
}
function group(title, ...keys) {
  return '<section class="group"><h3>' + title + '</h3>' + keys.map(slider).join('') + '</section>';
}
function action(id, name, glyph, style = 'secondary') {
  return '<button type="button" class="button ' + style + '" id="' + id + '">' + (glyph ? icon(glyph) : '') + name + '</button>';
}
function options(key, label, choices) {
  const list = Object.entries(choices).map(([value,text]) => '<option value="' + value + '"' + (state[key] === value ? ' selected' : '') + '>' + text + '</option>').join('');
  return '<label class="field">' + label + '<select data-field="' + key + '" id="f-' + key + '">' + list + '</select></label>';
}
function renderPanel() {
  const [glyph,title,description] = sections[section];
  $('panelIcon').innerHTML = icon(glyph);
  $('panelTitle').textContent = title;
  $('panelDescription').textContent = description;
  document.querySelectorAll('.tool').forEach((button) => {
    const active = button.dataset.section === section;
    button.classList.toggle('selected',active);
    button.setAttribute('aria-pressed',active);
  });
  const views = {
    gym:() => action('auto','Melhorar automaticamente','sparkles','auto') +
      group('Definição e luz','clarity','contrast','shadows','highlights') +
      group('Acabamento','smooth','warmth','vignette'),
    adjust:() => action('auto','Melhorar automaticamente','sparkles','auto') +
      group('Luz','exposure','brightness','contrast','highlights','shadows') +
      group('Cor','saturation','warmth','tint') + group('Detalhes','clarity','sharpness'),
    retouch:() => group('Pele','smooth','skinLight') + group('Textura','denoise','sharpness'),
    effects:() => '<section class="group"><h3>Filtros</h3><div class="preset-grid">' +
      Object.entries(presets).map(([key, look]) => '<button type="button" class="button secondary" data-preset="' + key + '">' + look.label + '</button>').join('') +
      '</div></section>' + group('Acabamento','intensity','vignette','fade','grain'),
    crop:() => '<section class="group">' +
      options('ratio','Proporção', {original:'Original','1:1':'1:1 · Quadrado','4:5':'4:5 · Feed vertical','9:16':'9:16 · Stories e Reels','16:9':'16:9 · Paisagem','3:2':'3:2 · Fotografia'}) +
      '<div class="buttons-grid">' + action('rotateLeft','−90°','rotate') + action('rotateRight','+90°','rotate') + action('flipH','Espelhar','flip') + action('flipV','Virar vertical','flip') + '</div></section>' +
      group('Enquadramento','cropScale','cropX','cropY','straighten'),
    text:() => '<section class="group"><label class="field">Texto<input type="text" maxlength="100" data-field="text" id="f-text" placeholder="Digite uma frase"></label><label class="field">Cor do texto<input type="color" data-field="textColor" id="f-textColor"></label>' +
      options('textPosition','Posição',{top:'Topo',center:'Centro',bottom:'Rodapé'}) + '</section>' + group('Aparência','textSize','textOpacity'),
  };
  panel.innerHTML = views[section]();
  if ($('f-text')) {
    $('f-text').value = state.text;
    $('f-textColor').value = state.textColor;
  }
  panel.querySelectorAll('input[type=range]').forEach(fillRange);
}

function selectSection(next, fromShortcut = false) {
  section = next;
  renderPanel();
  highlightPresets();
  updateGuide();
  if (fromShortcut && window.matchMedia('(max-width:760px)').matches) document.querySelector('.inspector').scrollIntoView({block:'start'});
}
function highlightPresets() {
  document.querySelectorAll('[data-preset]').forEach((button) => {
    const active = button.dataset.preset === state.preset;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active);
  });
}
function selectPreset(key) {
  change({preset:key, intensity:100});
  if ($('f-intensity')) {
    $('f-intensity').value = 100;
    $('v-intensity').textContent = '100';
    fillRange($('f-intensity'));
  }
  highlightPresets();
}
function renderLooks() {
  $('looks').innerHTML = Object.entries(presets).map(([key,look]) =>
    '<button class="look" type="button" data-preset="' + key + '" aria-label="' + look.label + '"><canvas aria-hidden="true" width="190" height="80"></canvas><span>' + (look.short || look.label) + '</span></button>').join('');
  highlightPresets();
}
function updateLooks() {
  if (!source) return;
  const shared = document.createElement('canvas');
  shared.width = 190;
  shared.height = 80;
  const ctx = shared.getContext('2d',{willReadFrequently:true});
  const scale = Math.max(190/source.naturalWidth,80/source.naturalHeight);
  const w = scale * source.naturalWidth;
  const h = scale * source.naturalHeight;
  ctx.drawImage(source,(190-w)/2,(80-h)*.39,w,h);
  const data = ctx.getImageData(0,0,190,80);
  document.querySelectorAll('.look').forEach((button) => {
    renderEdit(button.firstElementChild, data, {...defaults,preset:button.dataset.preset});
  });
}

function geometry(settings) {
  const swapped = settings.rotation % 180 !== 0;
  const fullWidth = swapped ? source.naturalHeight : source.naturalWidth;
  const fullHeight = swapped ? source.naturalWidth : source.naturalHeight;
  const [a,b] = settings.ratio.split(':').map(Number);
  const ratio = b ? a / b : fullWidth / fullHeight;
  const factor = settings.cropScale / 100;
  const width = Math.max(1,Math.round(Math.min(fullWidth,fullHeight*ratio)*factor));
  const height = Math.max(1,Math.round(Math.min(fullHeight,fullWidth/ratio)*factor));
  return {width,height,fullWidth,fullHeight,x:(fullWidth-width)*settings.cropX/100,y:(fullHeight-height)*settings.cropY/100};
}
function drawBase(target, settings, maxEdge) {
  const g = geometry(settings);
  const scale = Math.min(1, maxEdge ? maxEdge / Math.max(g.width,g.height) : 1, Math.sqrt(24000000/(g.width*g.height)));
  target.width = Math.max(1, Math.round(g.width * scale));
  target.height = Math.max(1, Math.round(g.height * scale));
  const ctx = target.getContext('2d',{willReadFrequently:true});
  ctx.save();
  ctx.scale(target.width/g.width,target.height/g.height);
  ctx.translate(-g.x,-g.y);
  ctx.translate(g.fullWidth/2,g.fullHeight/2);
  const angle = settings.straighten * Math.PI / 180;
  if (angle) {
    const c = Math.cos(angle);
    const s = Math.abs(Math.sin(angle));
    const cover = Math.max(c + s*g.fullHeight/g.fullWidth,c + s*g.fullWidth/g.fullHeight);
    ctx.scale(cover,cover);
  }
  ctx.rotate(angle);
  ctx.scale(settings.flipX ? -1 : 1, settings.flipY ? -1 : 1);
  ctx.rotate(settings.rotation*Math.PI/180);
  ctx.drawImage(source,-source.naturalWidth/2,-source.naturalHeight/2);
  ctx.restore();
  return ctx.getImageData(0,0,target.width,target.height);
}

function renderEdit(target, base, settings) {
  const {width,height,data} = base;
  const preset = presets[settings.preset].values;
  const intensity = settings.intensity / 100;
  const value = (name) => clamp(settings[name] + (preset[name] || 0) * intensity,-100,100) / 100;
  const exposure = Math.pow(2,value('exposure')*1.35);
  const brightness = value('brightness') * 70;
  const contrast = value('contrast') * .87 + 1;
  const highlights = value('highlights') * 100;
  const shadows = value('shadows') * 110;
  const saturation = value('saturation') + 1;
  const warmth = value('warmth') * 38;
  const tint = value('tint') * 31;
  const clarity = value('clarity') * .56;
  const sharpness = value('sharpness') * 1.18;
  const smooth = value('smooth') * .95;
  const denoise = value('denoise') * .8;
  const skinLight = value('skinLight') * 67;
  const vignette = value('vignette') * .79;
  const fade = value('fade') * .25;
  const grain = value('grain') * 46;
  const local = clarity || sharpness || smooth || denoise;
  const skin = smooth || skinLight;
  const d = Math.max(1, Math.round(Math.max(width,height)/450));
  const stride = width*4;
  if (target.width !== width || target.height !== height) {
    target.width = width;
    target.height = height;
  }
  const ctx = target.getContext('2d');
  const output = ctx.createImageData(width,height);
  const out = output.data;
  for (let y = 0, i = 0; y < height; y++) {
    const dy = (y / Math.max(1,height-1) * 2 - 1);
    const above = Math.max(0,y-d)*stride;
    const below = Math.min(height-1,y+d)*stride;
    for (let x = 0; x < width; x++, i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2];
      const lum = .2126*r + .7152*g + .0722*b;
      const l = lum/255;
      const mask = skin && r > g && g > b
        ? clamp((r-g-6)/18,0,1)*clamp((g-b)/15,0,1)*clamp((lum-22)/40,0,1)*clamp((245-lum)/25,0,1)
        : 0;
      if (local) {
        const left = Math.max(0,x-d)*4+y*stride;
        const right = Math.min(width-1,x+d)*4+y*stride;
        const up = above+x*4;
        const down = below+x*4;
        const avgR = (data[left]+data[right]+data[up]+data[down])*.25;
        const avgG = (data[left+1]+data[right+1]+data[up+1]+data[down+1])*.25;
        const avgB = (data[left+2]+data[right+2]+data[up+2]+data[down+2])*.25;
        const edge = lum - (.2126*avgR + .7152*avgG + .0722*avgB);
        const preserve = clamp(1-Math.abs(edge)/34,0,1);
        const detail = clarity * (1-Math.abs(l-.5)) + sharpness * .62 - (smooth*mask + denoise)*preserve;
        r += (r-avgR)*detail;
        g += (g-avgG)*detail;
        b += (b-avgB)*detail;
      }
      const tone = (lum*exposure-127.5)*contrast + 127.5 + brightness - lum +
        shadows*(1-l)*(1-l)*Math.min(1,l*9) + highlights*l*l*Math.min(1,(1-l)*9) + skinLight*mask;
      r = lum+(r-lum)*saturation+tone+warmth*.74+tint*.5;
      g = lum+(g-lum)*saturation+tone+warmth*.11-tint*.58;
      b = lum+(b-lum)*saturation+tone-warmth+tint*.39;
      let shade = 1;
      if (vignette) {
        const dx = x / Math.max(1,width-1) * 2 - 1;
        shade -= clamp((dx*dx+dy*dy-.22)*.56,0,1)*vignette;
      }
      const noise = grain ? (((Math.imul(x+7919,1597334677)^Math.imul(y+8191,3812015801)) >>> 16)/65535-.5)*grain : 0;
      out[i] = (r*(1-fade)+fade*58)*shade+noise;
      out[i+1] = (g*(1-fade)+fade*58)*shade+noise;
      out[i+2] = (b*(1-fade)+fade*58)*shade+noise;
      out[i+3] = data[i+3];
    }
  }
  ctx.putImageData(output,0,0);
  const text = settings.text.trim();
  if (text) {
    const em = Math.max(8,Math.round(Math.min(width,height) * settings.textSize / 100));
    const positions = {top:.13,center:.5,bottom:.87};
    ctx.save();
    ctx.globalAlpha = settings.textOpacity / 100;
    ctx.font = '800 ' + em + 'px system-ui';
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000c';
    ctx.shadowBlur = em*.12;
    ctx.shadowOffsetY = em*.05;
    ctx.fillText(text,width*.5,height*positions[settings.textPosition],width*.88);
    ctx.restore();
  }
}
function updateSize() {
  if (!rawPixels) return;
  const scroller = $('scroller');
  const availableWidth = Math.max(1,scroller.clientWidth-24);
  const availableHeight = Math.max(1,scroller.clientHeight-24);
  const ratio = rawPixels.width/rawPixels.height;
  const width = Math.min(availableWidth, availableHeight*ratio)*zoom;
  photo.style.width = width + 'px';
  photo.style.height = width/ratio + 'px';
  $('zoomReset').textContent = Math.round(zoom*100) + '%';
  $('zoomIn').disabled = zoom >= 3;
  $('zoomOut').disabled = zoom <= .5;
}
function updateGuide(show = false) {
  const guide = $('cropGuide');
  clearTimeout(tipsTimer);
  guide.hidden = section !== 'crop' || !show;
  if (!guide.hidden) {
    guide.style.inset = '0';
    tipsTimer = setTimeout(() => { guide.hidden = true; }, 550);
  }
}
function schedule() {
  if (frame || !source) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const g = geometry(state);
    const key = [g.width,g.height,g.x,g.y,state.rotation,state.straighten,state.flipX,state.flipY].join(',');
    if (key !== renderKey || !rawPixels) {
      rawPixels = drawBase(original,state,1050);
      renderKey = key;
      $('dimensions').textContent = g.width.toLocaleString('pt-BR') + ' × ' + g.height.toLocaleString('pt-BR');
    }
    renderEdit(canvas,rawPixels,state);
    updateSize();
  });
}
function loadImage(url, name, demonstration = false) {
  const ticket = ++imageLoad;
  const image = new Image();
  image.onload = () => {
    if (!demonstration) URL.revokeObjectURL(url);
    if (ticket !== imageLoad) return;
    source = image;
    renderKey = '';
    rawPixels = null;
    sample = demonstration;
    filename = name;
    $('filename').textContent = name;
    $('document-meta').textContent = sample ? 'Foto de demonstração' : 'Foto local';
    state = demonstration ? {...defaults,preset:'focus',smooth:14} : {...defaults};
    history = [state];
    historyIndex = 0;
    zoom = 1;
    updateLooks();
    sync();
    if (!demonstration) notify('Foto aberta.');
  };
  image.onerror = () => {
    if (!demonstration) URL.revokeObjectURL(url);
    if (ticket === imageLoad) notify('Não foi possível abrir a imagem. Tente um arquivo JPG, PNG ou WebP.');
  };
  image.src = url;
}
function openFile(file) {
  if (!file) return;
  if (file.type && !file.type.startsWith('image/')) {
    notify('Escolha um arquivo de imagem.');
    return;
  }
  loadImage(URL.createObjectURL(file),file.name);
}
function autoEnhance() {
  if (!source) return;
  const thumb = document.createElement('canvas');
  const data = drawBase(thumb,state,140).data;
  let luminance = 0, count = 0, dark = 0, bright = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] < 125) continue;
    const lum = .2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
    luminance += lum;
    count++;
    if (lum < 64) dark++;
    if (lum > 215) bright++;
  }
  if (!count) return;
  const average = luminance / count;
  change({
    preset:'none', exposure:0, brightness:Math.round(clamp((111-average)*.31,-14,21)),
    contrast:dark/count > .58 ? 7 : 13, shadows:Math.round(9+dark/count*32),
    highlights:Math.round(-7-bright/count*36), saturation:7, clarity:section === 'gym' ? 24 : 11,
    sharpness:13, smooth:Math.max(state.smooth,section === 'gym' ? 18 : 0),
  });
  sync();
  notify('Melhoria automática aplicada.');
}

document.querySelector('.rail').addEventListener('click', (event) => {
  const button = event.target.closest('[data-section]');
  if (button) selectSection(button.dataset.section);
});
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-preset]');
  if (button) selectPreset(button.dataset.preset);
});
$('allEffects').addEventListener('click', () => selectSection('effects',true));
panel.addEventListener('input', (event) => {
  const input = event.target;
  const key = input.dataset.field;
  if (!key) return;
  const ranged = input.type === 'range';
  const value = ranged ? input.valueAsNumber : input.value;
  change({[key]:value},false);
  if (ranged) {
    $('v-' + key).textContent = formatValue(key,value);
    fillRange(input);
  }
  if (section === 'crop') updateGuide(true);
});
panel.addEventListener('change', (event) => {
  if (event.target.dataset.field) commit();
});
panel.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const operations = {
    auto:autoEnhance,
    rotateLeft:() => change({rotation:(state.rotation+270)%360}),
    rotateRight:() => change({rotation:(state.rotation+90)%360}),
    flipH:() => change({flipX:!state.flipX}),
    flipV:() => change({flipY:!state.flipY}),
  };
  operations[button.id]?.();
});
function undo() { commit(); traverse(-1); }
function redo() { traverse(1); }
$('undo').addEventListener('click',undo);
$('redo').addEventListener('click',redo);
$('reset').addEventListener('click', () => {
  change(defaults);
  sync();
  notify('Ajustes restaurados.');
});
document.addEventListener('keydown', (event) => {
  if (event.target.closest('input, select, textarea, dialog')) return;
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'z' || key === 'y') {
    event.preventDefault();
    if (key === 'y' || event.shiftKey) redo();
    else undo();
  }
});
$('compare').addEventListener('click', () => {
  compare = !compare;
  photo.classList.toggle('no-compare',!compare);
  $('compare').setAttribute('aria-pressed',compare);
});
$('split').addEventListener('input', (event) => photo.style.setProperty('--split',event.target.value + '%'));
function zoomBy(delta) {
  zoom = clamp(Math.round((zoom+delta)*100)/100,.5,3);
  updateSize();
  const scroller = $('scroller');
  scroller.scrollLeft = (scroller.scrollWidth-scroller.clientWidth)/2;
  scroller.scrollTop = (scroller.scrollHeight-scroller.clientHeight)/2;
}
$('zoomOut').addEventListener('click',()=>zoomBy(-.25));
$('zoomIn').addEventListener('click',()=>zoomBy(.25));
$('zoomReset').addEventListener('click',()=>zoomBy(1-zoom));
$('fit').addEventListener('click',()=>zoomBy(1-zoom));
new ResizeObserver(updateSize).observe($('scroller'));

$('open').addEventListener('click',()=>$('file').click());
$('file').addEventListener('change',(event) => {
  openFile(event.target.files[0]);
  event.target.value = '';
});
let dragDepth = 0;
stage.addEventListener('dragenter',(event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  dragDepth++;
  stage.querySelector('.drop-message').hidden = false;
});
stage.addEventListener('dragover',(event) => {
  if (event.dataTransfer.types.includes('Files')) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }
});
stage.addEventListener('dragleave',() => {
  dragDepth = Math.max(0,dragDepth-1);
  if (!dragDepth) stage.querySelector('.drop-message').hidden = true;
});
stage.addEventListener('drop',(event) => {
  event.preventDefault();
  dragDepth = 0;
  stage.querySelector('.drop-message').hidden = true;
  openFile(event.dataTransfer.files[0]);
});
document.addEventListener('paste',(event) => {
  const image = Array.from(event.clipboardData?.items || []).find((item) => item.type.startsWith('image/'));
  if (image) openFile(image.getAsFile());
});

const dialog = $('exportDialog');
$('export').addEventListener('click',() => {
  if (!source) {
    notify('Abra uma foto para exportar.');
    return;
  }
  $('exportName').value = (filename.replace(/\.[^.]+$/,'') || 'foto') + '-editada';
  dialog.showModal();
});
$('closeExport').addEventListener('click',() => dialog.close());
$('format').addEventListener('change',() => { $('qualityRow').hidden = $('format').value === 'image/png'; });
$('quality').addEventListener('input',() => {
  $('qualityValue').textContent = $('quality').value + '%';
  fillRange($('quality'));
});
$('exportForm').addEventListener('submit',async (event) => {
  event.preventDefault();
  const button = $('download');
  const name = $('exportName').value.trim().replace(/[\\/:*?"<>|]/g,'-') || 'foto-editada';
  const type = $('format').value;
  const maxEdge = Number($('size').value);
  const quality = Number($('quality').value)/100;
  const settings = state;
  button.disabled = true;
  button.textContent = 'Preparando foto…';
  await new Promise((resolve) => setTimeout(resolve,30));
  try {
    const image = document.createElement('canvas');
    const pixels = drawBase(image,settings,maxEdge);
    renderEdit(image,pixels,settings);
    if (type === 'image/jpeg') {
      const ctx = image.getContext('2d');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0,0,image.width,image.height);
      ctx.restore();
    }
    const blob = await new Promise((resolve) => image.toBlob(resolve,type,quality));
    if (!blob) throw new Error('Exportação vazia');
    const suffix = {'image/jpeg':'jpg','image/webp':'webp','image/png':'png'}[blob.type] || 'png';
    const link = document.createElement('a');
    link.download = name.replace(/\.(jpe?g|png|webp)$/i,'') + '.' + suffix;
    link.href = URL.createObjectURL(blob);
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href),30000);
    dialog.close();
    notify('Foto exportada.');
  } catch {
    dialog.close();
    notify('A exportação falhou. Tente um tamanho menor.');
  } finally {
    button.disabled = false;
    button.innerHTML = icon('download') + ' Baixar foto';
  }
});

renderPanel();
renderLooks();
updateHistory();
fillRange($('quality'));
loadImage('treino.jpg',filename,true);
