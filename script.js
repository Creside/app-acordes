// ==========================================
// FASE 1: O MOTOR HARMÔNICO (O CÉREBRO DO APP)
// ==========================================

const notasCromaticas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const formulaEscalaMaior = [0, 2, 4, 5, 7, 9, 11];
const formulaEscalaMenor = [0, 2, 3, 5, 7, 8, 10];
const qualidadesCampoMaior = ["", "m", "m", "", "", "m", "dim"];
const qualidadesCampoMenor = ["m", "dim", "", "m", "m", "", ""];

function getNotaIndex(notaStr) {
    const eq = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};
    return notasCromaticas.indexOf(eq[notaStr] || notaStr);
}
function somarSemitons(base, semi) { return (base + semi) % 12; }

function gerarCampoHarmonicoMaior(tonicaStr) {
    const idx = getNotaIndex(tonicaStr);
    if (idx === -1) return null;
    return formulaEscalaMaior.map((v, i) => notasCromaticas[somarSemitons(idx, v)] + qualidadesCampoMaior[i]);
}
// MELHORIA 3: campo harmônico menor natural
function gerarCampoHarmonicoMenor(tonicaStr) {
    const idx = getNotaIndex(tonicaStr);
    if (idx === -1) return null;
    return formulaEscalaMenor.map((v, i) => notasCromaticas[somarSemitons(idx, v)] + qualidadesCampoMenor[i]);
}

let notasEscalaAtual = [];

// ==========================================
// IDENTIFICADOR DE TOM — MELHORIA 3: Detecta modo menor
// ==========================================
function identificarTom() {
    const input = document.getElementById('inputAcordes').value;
    const acordesRaw = input.split(',').map(a => a.trim()).filter(a => a !== "");
    const acordes = acordesRaw.map(a => {
        if (a.length >= 2 && a[1] === '#') return a[0].toUpperCase() + '#' + a.slice(2).toLowerCase();
        return a[0].toUpperCase() + a.slice(1).toLowerCase();
    });
    const resultadoDiv = document.getElementById('resultado');

    if (acordes.length === 0) {
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = "Por favor, digite os acordes.";
        return;
    }

    let resultado = null;

    for (let i = 0; i < 12; i++) {
        const tonica = notasCromaticas[i];
        const campo = gerarCampoHarmonicoMaior(tonica);
        if (acordes.every(a => campo.map(c => c.toLowerCase()).includes(a.toLowerCase()))) {
            resultado = { modo: "maior", tonica, campo };
            break;
        }
    }
    if (!resultado) {
        for (let i = 0; i < 12; i++) {
            const tonica = notasCromaticas[i];
            const campo = gerarCampoHarmonicoMenor(tonica);
            if (acordes.every(a => campo.map(c => c.toLowerCase()).includes(a.toLowerCase()))) {
                resultado = { modo: "menor", tonica, campo };
                break;
            }
        }
    }

    if (resultado) {
        const { modo, tonica, campo } = resultado;
        const ti = getNotaIndex(tonica);
        let pentaLabel, pentaNotas, relLabel, relNotas, labelTom, labelCampo;

        if (modo === "maior") {
            pentaNotas = [0,2,4,7,9].map(s => notasCromaticas[somarSemitons(ti, s)]);
            const menorRel = notasCromaticas[somarSemitons(ti, 9)];
            relNotas = `${menorRel}, ${pentaNotas[0]}, ${pentaNotas[1]}, ${pentaNotas[2]}, ${pentaNotas[3]}`;
            pentaLabel = "Pentatônica Maior";
            relLabel = `Pentatônica Menor Relativa (${menorRel}m)`;
            labelTom = `${tonica} Maior`;
            labelCampo = `Campo Harmônico (${tonica} Maior)`;
            notasEscalaAtual = pentaNotas;
        } else {
            pentaNotas = [0,3,5,7,10].map(s => notasCromaticas[somarSemitons(ti, s)]);
            const maiorRel = notasCromaticas[somarSemitons(ti, 3)];
            const maiorRelIdx = getNotaIndex(maiorRel);
            relNotas = [0,2,4,7,9].map(s => notasCromaticas[somarSemitons(maiorRelIdx, s)]).join(", ");
            pentaLabel = "Pentatônica Menor";
            relLabel = `Pentatônica Maior Relativa (${maiorRel})`;
            labelTom = `${tonica} menor`;
            labelCampo = `Campo Harmônico (${tonica} menor natural)`;
            notasEscalaAtual = pentaNotas;
        }

        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = `
            <div class="resultado-tom">🎵 A música está em:<br><b>${labelTom}</b></div>
            <div class="resultado-detalhes">
                <p><b>🎸 ${pentaLabel}:</b><br>${pentaNotas.join(", ")}</p>
                <hr class="resultado-hr">
                <p><b>🎸 ${relLabel}:</b><br>${relNotas}</p>
                <hr class="resultado-hr">
                <p style="margin-bottom:0"><b>🛤️ ${labelCampo}:</b><br>${campo.join(" - ")}</p>
            </div>`;

        desenharBraco();
        gerarBotoesDeVariacao(mapearNomeParaBanco(tonica, modo));
    } else {
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = "Tom não identificado. Tente digitar outros acordes da música (ex: Am, F, C).";
        ['fretboard-container','variacoes-container','chord-diagram-container'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        notasEscalaAtual = [];
    }
}

// MELHORIA 1: mapear todos os 12 tons maiores e menores
function mapearNomeParaBanco(tonicaSigla, modo = "maior") {
    const mapaMaior = {
        "C":"Dó Maior (C)","D":"Ré Maior (D)","E":"Mi Maior (E)","F":"Fá Maior (F)",
        "G":"Sol Maior (G)","A":"Lá Maior (A)","B":"Si Maior (B)","C#":"Dó# Maior (C#)",
        "F#":"Fá# Maior (F#)","G#":"Sol# Maior (G#)","A#":"Lá# Maior (A#)","D#":"Ré# Maior (D#)"
    };
    const mapaMenor = {
        "A":"Lá menor (Am)","E":"Mi menor (Em)","D":"Ré menor (Dm)","G":"Sol menor (Gm)",
        "B":"Si menor (Bm)","C":"Dó menor (Cm)","F":"Fá menor (Fm)","C#":"Dó# menor (C#m)",
        "F#":"Fá# menor (F#m)","G#":"Sol# menor (G#m)","A#":"Lá# menor (A#m)","D#":"Ré# menor (D#m)"
    };
    return modo === "menor" ? (mapaMenor[tonicaSigla] || tonicaSigla+"m") : (mapaMaior[tonicaSigla] || tonicaSigla);
}

function atualizarBraco() {
    if (notasEscalaAtual.length > 0) desenharBraco();
}

function desenharBraco() {
    const fretboard = document.getElementById('fretboard');
    const instrumento = document.getElementById('seletorInstrumento').value;
    fretboard.innerHTML = '';
    const afinacao = instrumento === 'guitarra' ? ['E','B','G','D','A','E'] : ['G','D','A','E'];

    for (let c = 0; c < afinacao.length; c++) {
        const cordaDiv = document.createElement('div');
        cordaDiv.className = 'corda';
        let ni = notasCromaticas.indexOf(afinacao[c]);
        for (let t = 0; t <= 12; t++) {
            const trasteDiv = document.createElement('div');
            trasteDiv.className = 'traste';
            if (t === 0) trasteDiv.classList.add('corda-solta');
            if (t === 1) trasteDiv.classList.add('pestana');
            if (t > 0 && [3,5,7,9,12].includes(t) && c === Math.floor((afinacao.length-1)/2)) {
                const m = document.createElement('div'); m.className = 'marcador-fundo';
                trasteDiv.appendChild(m);
            }
            const nota = notasCromaticas[(ni + t) % 12];
            if (notasEscalaAtual.includes(nota)) {
                const cls = t === 0 ? 'bolinha-nota nota-solta-destaque' : 'bolinha-nota';
                trasteDiv.innerHTML += `<div class="${cls}">${nota}</div>`;
            }
            cordaDiv.appendChild(trasteDiv);
        }
        fretboard.appendChild(cordaDiv);
    }
    const regua = document.createElement('div');
    regua.className = 'regua-casas';
    for (let t = 0; t <= 12; t++) {
        const n = document.createElement('div');
        n.className = 'numero-casa';
        if (t === 0) n.classList.add('corda-solta-num'); else n.innerText = t;
        regua.appendChild(n);
    }
    fretboard.appendChild(regua);
    document.getElementById('fretboard-container').style.display = 'block';
}

// ==========================================
// AFINADOR POR MICROFONE (com smoothing)
// ==========================================
let audioContext, analyser, microphone, isListening = false, animationId;
const notasStrings = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const pitchHistory = [];
const PITCH_HISTORY_SIZE = 5;

async function iniciarAfinador() {
    const btn = document.getElementById('btnAfinador');
    if (isListening) {
        isListening = false; audioContext.close(); cancelAnimationFrame(animationId);
        btn.innerText = "Ligar Microfone"; btn.style.backgroundColor = "#e67e22";
        document.getElementById('notaDetectada').innerText = "--";
        document.getElementById('frequenciaDetectada').innerText = "-- Hz";
        pitchHistory.length = 0; return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser(); analyser.fftSize = 2048;
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        isListening = true; btn.innerText = "Desligar Microfone"; btn.style.backgroundColor = "#e74c3c";
        detectarPitch();
    } catch (err) { alert("Erro ao acessar o microfone."); console.error(err); }
}

function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length, rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
    rms = Math.sqrt(rms/SIZE);
    if (rms < 0.02) return -1;
    let r1=0, r2=SIZE-1, thres=0.2;
    for (let i=0; i<SIZE/2; i++) if (Math.abs(buf[i])<thres){r1=i;break;}
    for (let i=1; i<SIZE/2; i++) if (Math.abs(buf[SIZE-i])<thres){r2=SIZE-i;break;}
    buf=buf.slice(r1,r2); SIZE=buf.length;
    let c=new Array(SIZE).fill(0);
    for (let i=0;i<SIZE;i++) for (let j=0;j<SIZE-i;j++) c[i]+=buf[j]*buf[j+i];
    let d=0; while(c[d]>c[d+1])d++;
    let maxval=-1,maxpos=-1;
    for (let i=d;i<SIZE;i++) if(c[i]>maxval){maxval=c[i];maxpos=i;}
    let T0=maxpos, x1=c[T0-1],x2=c[T0],x3=c[T0+1];
    let a=(x1+x3-2*x2)/2,b=(x3-x1)/2;
    if(a) T0=T0-b/(2*a);
    return sampleRate/T0;
}
function notaDeFrequencia(f) { return Math.round(12*(Math.log(f/440)/Math.log(2)))+69; }

function detectarPitch() {
    if (!isListening) return;
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    const freq = autoCorrelate(buffer, audioContext.sampleRate);
    if (freq !== -1) {
        pitchHistory.push(freq);
        if (pitchHistory.length > PITCH_HISTORY_SIZE) pitchHistory.shift();
        const media = pitchHistory.reduce((a,b)=>a+b,0)/pitchHistory.length;
        document.getElementById('notaDetectada').innerText = notasStrings[notaDeFrequencia(media)%12];
        document.getElementById('frequenciaDetectada').innerText = Math.round(media)+" Hz";
    }
    animationId = requestAnimationFrame(detectarPitch);
}

// ==========================================
// MELHORIA 1: BANCO DE ACORDES — 12 TONS MAIORES + 12 MENORES
// ==========================================
const bancoDeAcordes = {
    "Dó Maior (C)":     ["C","C7M","C9","F","F7M","G","G7"],
    "Ré Maior (D)":     ["D","D7M","D9","G","G7M","A","A7"],
    "Mi Maior (E)":     ["E","E7M","E9","A","A7M","B","B7"],
    "Fá Maior (F)":     ["F","F7M","C","C7M","G","G7","Am"],
    "Sol Maior (G)":    ["G","G7M","G9","C","C7M","D","D7"],
    "Lá Maior (A)":     ["A","A7M","A9","D","D7M","E","E7"],
    "Si Maior (B)":     ["B","B7M","E","E7M","F#7","F#m","G#m"],
    "Dó# Maior (C#)":   ["C#","F#","F#7M","G#7","G#m","A#m","C#7M"],
    "Fá# Maior (F#)":   ["F#","F#7M","B","B7M","C#7","C#m","D#m"],
    "Sol# Maior (G#)":  ["G#","G#7M","C#","C#7M","D#7","D#m","Fm"],
    "Lá# Maior (A#)":   ["A#","A#7M","D#","D#7M","F7","Fm","Gm"],
    "Ré# Maior (D#)":   ["D#","D#7M","G#","G#7M","A#7","A#m","Cm"],
    "Lá menor (Am)":    ["Am","Am7","Dm","Dm7","E7","G","C"],
    "Mi menor (Em)":    ["Em","Em7","Am","Am7","B7","D","G"],
    "Ré menor (Dm)":    ["Dm","Dm7","Gm","Gm7","A7","C","F"],
    "Sol menor (Gm)":   ["Gm","Gm7","Cm","Cm7","D7","F","A#"],
    "Si menor (Bm)":    ["Bm","Bm7","Em","Em7","F#7","A","D"],
    "Dó menor (Cm)":    ["Cm","Cm7","Fm","Fm7","G7","A#","D#"],
    "Fá menor (Fm)":    ["Fm","Fm7","A#m","A#m7","C7","D#","G#"],
    "Dó# menor (C#m)":  ["C#m","C#m7","F#m","F#m7","G#7","B","E"],
    "Fá# menor (F#m)":  ["F#m","F#m7","Bm","Bm7","C#7","A","D"],
    "Sol# menor (G#m)": ["G#m","G#m7","C#m","C#m7","D#7","B","E"],
    "Lá# menor (A#m)":  ["A#m","A#m7","D#m","D#m7","F7","C#","F#"],
    "Ré# menor (D#m)":  ["D#m","D#m7","G#m","G#m7","A#7","F#","B"],
};

// MELHORIA 1: Dicionário de shapes expandido
const dicionarioShapes = {
    "C":    {g_frets:[null,3,2,0,1,0],   g_fingers:[null,3,2,null,1,null], piano:[0,4,7]},
    "C#":   {g_frets:[null,4,3,1,2,1],   g_fingers:[null,3,2,1,null,1],   piano:[1,5,8]},
    "D":    {g_frets:[null,null,0,2,3,2],g_fingers:[null,null,null,1,3,2], piano:[2,6,9]},
    "D#":   {g_frets:[null,null,1,3,4,3],g_fingers:[null,null,1,2,4,3],   piano:[3,7,10]},
    "E":    {g_frets:[0,2,2,1,0,0],      g_fingers:[null,2,3,1,null,null], piano:[4,8,11]},
    "F":    {g_frets:[1,3,3,2,1,1],      g_fingers:[1,3,4,2,1,1],         piano:[5,9,12]},
    "F#":   {g_frets:[2,4,4,3,2,2],      g_fingers:[1,3,4,2,1,1],         piano:[6,10,13]},
    "G":    {g_frets:[3,2,0,0,0,3],      g_fingers:[2,1,null,null,null,3], piano:[7,11,14]},
    "G#":   {g_frets:[4,3,1,1,1,4],      g_fingers:[4,3,1,1,1,4],         piano:[8,12,15]},
    "A":    {g_frets:[null,0,2,2,2,0],   g_fingers:[null,null,1,2,3,null], piano:[9,13,16]},
    "A#":   {g_frets:[null,1,3,3,3,1],   g_fingers:[null,1,2,3,4,1],      piano:[10,14,17]},
    "B":    {g_frets:[null,2,4,4,4,2],   g_fingers:[null,1,2,3,4,1],      piano:[11,15,18]},
    "Am":   {g_frets:[null,0,2,2,1,0],   g_fingers:[null,null,2,3,1,null], piano:[0,3,7]},
    "A#m":  {g_frets:[null,1,3,3,2,1],   g_fingers:[null,1,3,4,2,1],      piano:[1,4,8]},
    "Bm":   {g_frets:[null,2,4,4,3,2],   g_fingers:[null,1,3,4,2,1],      piano:[2,5,9]},
    "Cm":   {g_frets:[null,3,5,5,4,3],   g_fingers:[null,1,3,4,2,1],      piano:[3,6,10]},
    "C#m":  {g_frets:[null,4,6,6,5,4],   g_fingers:[null,1,3,4,2,1],      piano:[4,7,11]},
    "Dm":   {g_frets:[null,null,0,2,3,1],g_fingers:[null,null,null,2,3,1], piano:[5,8,12]},
    "D#m":  {g_frets:[null,null,1,3,4,2],g_fingers:[null,null,1,3,4,2],   piano:[6,9,13]},
    "Em":   {g_frets:[0,2,2,0,0,0],      g_fingers:[null,2,3,null,null,null],piano:[7,10,14]},
    "Fm":   {g_frets:[1,3,3,1,1,1],      g_fingers:[1,3,4,1,1,1],         piano:[8,11,15]},
    "F#m":  {g_frets:[2,4,4,2,2,2],      g_fingers:[1,3,4,1,1,1],         piano:[9,12,16]},
    "Gm":   {g_frets:[3,5,5,3,3,3],      g_fingers:[1,3,4,1,1,1],         piano:[10,13,17]},
    "G#m":  {g_frets:[4,6,6,4,4,4],      g_fingers:[1,3,4,1,1,1],         piano:[11,14,18]},
    "C7":   {g_frets:[null,3,2,3,1,0],   g_fingers:[null,3,2,4,1,null],   piano:[0,4,7,10]},
    "C#7":  {g_frets:[null,4,3,4,2,1],   g_fingers:[null,3,2,4,1,null],   piano:[1,5,8,11]},
    "D7":   {g_frets:[null,null,0,2,1,2],g_fingers:[null,null,null,2,1,3], piano:[2,6,9,12]},
    "D#7":  {g_frets:[null,null,1,3,2,3],g_fingers:[null,null,1,3,2,4],   piano:[3,7,10,13]},
    "E7":   {g_frets:[0,2,0,1,0,0],      g_fingers:[null,2,null,1,null,null],piano:[4,8,11,14]},
    "F7":   {g_frets:[1,3,1,2,1,1],      g_fingers:[1,3,1,2,1,1],         piano:[5,9,12,15]},
    "F#7":  {g_frets:[2,4,2,3,2,2],      g_fingers:[1,3,1,2,1,1],         piano:[6,10,13,16]},
    "G7":   {g_frets:[3,2,0,0,0,1],      g_fingers:[3,2,null,null,null,1], piano:[7,11,14,17]},
    "G#7":  {g_frets:[4,3,1,1,1,2],      g_fingers:[4,3,1,1,1,2],         piano:[8,12,15,18]},
    "A7":   {g_frets:[null,0,2,0,2,0],   g_fingers:[null,null,2,null,3,null],piano:[9,13,16,19]},
    "A#7":  {g_frets:[null,1,3,1,3,1],   g_fingers:[null,1,3,1,4,1],      piano:[10,14,17,20]},
    "B7":   {g_frets:[null,2,1,2,0,2],   g_fingers:[null,2,1,3,null,4],   piano:[11,15,18,21]},
    "C7M":  {g_frets:[null,3,2,0,0,0],   g_fingers:[null,3,2,null,null,null],piano:[0,4,7,11]},
    "D7M":  {g_frets:[null,null,0,2,2,2],g_fingers:[null,null,null,1,2,3], piano:[2,6,9,13]},
    "E7M":  {g_frets:[0,2,1,1,0,0],      g_fingers:[null,3,1,2,null,null], piano:[4,8,11,15]},
    "F7M":  {g_frets:[null,null,3,2,1,0],g_fingers:[null,null,3,2,1,null], piano:[5,9,12,16]},
    "G7M":  {g_frets:[3,null,0,0,0,2],   g_fingers:[2,null,null,null,null,1],piano:[7,11,14,18]},
    "A7M":  {g_frets:[null,0,2,1,2,0],   g_fingers:[null,null,3,1,2,null], piano:[9,13,16,20]},
    "B7M":  {g_frets:[null,2,4,3,4,null],g_fingers:[null,1,3,2,4,null],   piano:[11,15,18,22]},
    "F#7M": {g_frets:[2,4,3,3,2,null],   g_fingers:[1,4,2,3,1,null],      piano:[6,10,13,17]},
    "Am7":  {g_frets:[null,0,2,0,1,0],   g_fingers:[null,null,2,null,1,null],piano:[0,3,7,10]},
    "Bm7":  {g_frets:[null,2,4,2,3,2],   g_fingers:[null,1,3,1,2,1],      piano:[2,5,9,12]},
    "Cm7":  {g_frets:[null,3,5,3,4,3],   g_fingers:[null,1,3,1,2,1],      piano:[3,6,10,13]},
    "C#m7": {g_frets:[null,4,6,4,5,4],   g_fingers:[null,1,3,1,2,1],      piano:[4,7,11,14]},
    "Dm7":  {g_frets:[null,null,0,2,1,1],g_fingers:[null,null,null,3,1,2], piano:[5,8,12,15]},
    "D#m7": {g_frets:[null,null,1,3,2,2],g_fingers:[null,null,1,3,1,2],   piano:[6,9,13,16]},
    "Em7":  {g_frets:[0,2,0,0,0,0],      g_fingers:[null,1,null,null,null,null],piano:[7,10,14,17]},
    "Fm7":  {g_frets:[1,3,1,1,1,1],      g_fingers:[1,3,1,1,1,1],         piano:[8,11,15,18]},
    "F#m7": {g_frets:[2,4,2,2,2,2],      g_fingers:[1,3,1,1,1,1],         piano:[9,12,16,19]},
    "Gm7":  {g_frets:[3,5,3,3,3,3],      g_fingers:[1,3,1,1,1,1],         piano:[10,13,17,20]},
    "G#m7": {g_frets:[4,6,4,4,4,4],      g_fingers:[1,3,1,1,1,1],         piano:[11,14,18,21]},
    "A#m7": {g_frets:[null,1,3,1,2,1],   g_fingers:[null,1,3,1,2,1],      piano:[1,4,8,11]},
    "D#m7": {g_frets:[null,null,1,3,2,2],g_fingers:[null,null,1,3,1,2],   piano:[6,9,13,16]},
    "C#7M": {g_frets:[null,4,3,1,1,null],g_fingers:[null,3,2,1,1,null],   piano:[1,5,8,12]},
    "A#7M": {g_frets:[null,1,3,2,3,null],g_fingers:[null,1,3,2,4,null],   piano:[10,14,17,21]},
    "D#7M": {g_frets:[null,null,1,3,3,3],g_fingers:[null,null,1,2,3,4],   piano:[3,7,10,14]},
    "C9":   {g_frets:[null,3,2,3,3,null],g_fingers:[null,2,1,3,4,null],   piano:[0,4,7,10,14]},
    "D9":   {g_frets:[null,5,4,5,5,null],g_fingers:[null,2,1,3,4,null],   piano:[2,6,9,12,16]},
    "G9":   {g_frets:[3,null,0,2,0,3],   g_fingers:[2,null,null,1,null,3], piano:[7,11,14,17,21]},
    "A9":   {g_frets:[null,0,2,0,0,0],   g_fingers:[null,null,2,null,null,null],piano:[9,13,16,19,23]},
    "Edim": {g_frets:[null,null,2,3,2,3],g_fingers:[null,null,1,3,2,4],   piano:[4,7,10]},
    "Bdim": {g_frets:[null,2,3,4,3,null],g_fingers:[null,1,2,4,3,null],   piano:[11,14,17]},
};

let acordeAtualSelecionado = "";
let visaoDiagramaAtual = "guitarra";

function gerarBotoesDeVariacao(nomeDoTom) {
    const container = document.getElementById('variacoes-container');
    const grade = document.getElementById('gradeVariacoes');
    grade.innerHTML = '';
    const lista = bancoDeAcordes[nomeDoTom];
    if (!lista) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    lista.forEach((acorde, idx) => {
        const btn = document.createElement('button');
        btn.className = 'botao-variacao';
        btn.innerText = acorde;
        btn.onclick = () => {
            document.querySelectorAll('.botao-variacao').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            acordeAtualSelecionado = acorde;
            renderizarVisualizacao();
        };
        grade.appendChild(btn);
        if (idx === 0) { btn.classList.add('ativo'); acordeAtualSelecionado = acorde; renderizarVisualizacao(); }
    });
}

function mudarVisaoDiagrama(visao) {
    visaoDiagramaAtual = visao;
    document.getElementById('tab-guitarra').classList.remove('ativo');
    document.getElementById('tab-teclado').classList.remove('ativo');
    document.getElementById(`tab-${visao}`).classList.add('ativo');
    renderizarVisualizacao();
}
function renderizarVisualizacao() {
    if (visaoDiagramaAtual === 'guitarra') desenharDiagramaAcorde(acordeAtualSelecionado);
    else desenharTeclado(acordeAtualSelecionado);
}

// ==========================================
// MELHORIA 2: FUNÇÃO SVG UNIFICADA
// escala=1 → tamanho normal, escala=0.5 → miniatura
// ==========================================
function criarSVGAcorde(nomeAcorde, escala) {
    escala = escala || 1;
    const W=140, H=160, FRETS=5, ML=20, MT=25;
    const strSp = (W - 2*ML) / 5;
    const fretSp = (H - MT - 10) / FRETS;

    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W*escala);
    svg.setAttribute("height", H*escala);
    svg.style.display = "block";
    if (escala >= 1) svg.style.margin = "0 auto";

    const data = dicionarioShapes[nomeAcorde];
    if (!data) {
        const t = document.createElementNS("http://www.w3.org/2000/svg","text");
        t.setAttribute("x", W/2); t.setAttribute("y", H/2);
        t.setAttribute("fill","#888"); t.setAttribute("font-size","40px");
        t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
        t.textContent = "?"; svg.appendChild(t); return svg;
    }

    // Pestana
    const nut = document.createElementNS("http://www.w3.org/2000/svg","line");
    nut.setAttribute("x1",ML); nut.setAttribute("y1",MT);
    nut.setAttribute("x2",W-ML); nut.setAttribute("y2",MT);
    nut.setAttribute("stroke","#fff"); nut.setAttribute("stroke-width","4");
    svg.appendChild(nut);

    // Trastes
    for (let i=1; i<=FRETS; i++) {
        const y = MT + i*fretSp;
        const l = document.createElementNS("http://www.w3.org/2000/svg","line");
        l.setAttribute("x1",ML); l.setAttribute("y1",y);
        l.setAttribute("x2",W-ML); l.setAttribute("y2",y);
        l.setAttribute("stroke","#666"); l.setAttribute("stroke-width", escala<1?"2":"1");
        svg.appendChild(l);
    }

    // Cordas
    for (let i=0; i<6; i++) {
        const x = ML + i*strSp;
        const l = document.createElementNS("http://www.w3.org/2000/svg","line");
        l.setAttribute("x1",x); l.setAttribute("y1",MT);
        l.setAttribute("x2",x); l.setAttribute("y2",H-10);
        l.setAttribute("stroke","#666"); l.setAttribute("stroke-width", escala<1?"2":"1");
        svg.appendChild(l);
    }

    // Notas
    for (let i=0; i<6; i++) {
        const casa = data.g_frets[i], dedo = data.g_fingers[i];
        const x = ML + i*strSp;
        if (casa === null || casa === 0) {
            const t = document.createElementNS("http://www.w3.org/2000/svg","text");
            t.setAttribute("x",x); t.setAttribute("y",MT-8);
            t.setAttribute("fill", escala<1?"#aaa":"#888");
            t.setAttribute("font-size", escala<1?"14px":"12px");
            t.setAttribute("font-weight","bold"); t.setAttribute("text-anchor","middle");
            t.textContent = casa===null?"X":"O"; svg.appendChild(t);
        } else if (casa > 0) {
            const y = MT + (casa-0.5)*fretSp;
            const dot = document.createElementNS("http://www.w3.org/2000/svg","circle");
            dot.setAttribute("cx",x); dot.setAttribute("cy",y);
            dot.setAttribute("r","9"); dot.setAttribute("fill","#f1c40f");
            if (escala>=1) { dot.setAttribute("stroke","#d4a017"); dot.setAttribute("stroke-width","1"); }
            svg.appendChild(dot);
            if (dedo !== null) {
                const t = document.createElementNS("http://www.w3.org/2000/svg","text");
                t.setAttribute("x",x); t.setAttribute("y",y);
                t.setAttribute("fill","#000"); t.setAttribute("font-size","11px");
                t.setAttribute("font-weight","bold"); t.setAttribute("text-anchor","middle");
                t.setAttribute("dominant-baseline","central");
                t.textContent = dedo; svg.appendChild(t);
            }
        }
    }
    return svg;
}

// ==========================================
// DESENHO DO VIOLÃO (usa função unificada)
// ==========================================
function desenharDiagramaAcorde(nomeAcorde) {
    const container = document.getElementById('chord-diagram-container');
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';
    document.getElementById('nomeAcordeDestaque').innerText = nomeAcorde;
    container.style.display = 'block';
    if (!dicionarioShapes[nomeAcorde]) {
        area.innerHTML = `<p class="diagrama-indisponivel">O diagrama para <b>${nomeAcorde}</b> ainda não foi adicionado ao banco.</p>`;
        return;
    }
    area.appendChild(criarSVGAcorde(nomeAcorde, 1));
}

// ==========================================
// DESENHO DO TECLADO
// ==========================================
function desenharTeclado(nomeAcorde) {
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';
    const data = dicionarioShapes[nomeAcorde];
    if (!data || !data.piano) {
        area.innerHTML = `<p class="diagrama-indisponivel">O teclado para <b>${nomeAcorde}</b> ainda não foi adicionado ao banco.</p>`;
        return;
    }
    const notasAtivas = data.piano, total = 14;
    const offsetPretas = [1,3,null,6,8,10,null,13,15,null,18,20,22,null];
    let counter = 0, posX = 0;
    const largura = 100/total;
    const teclado = document.createElement('div');
    teclado.className = 'teclado-container';
    for (let i=0; i<total; i++) {
        const branca = document.createElement('div');
        branca.className = 'tecla-branca';
        if (notasAtivas.includes(counter)) branca.innerHTML = '<div class="marca-tecla"></div>';
        teclado.appendChild(branca);
        if (offsetPretas[i] !== null && offsetPretas[i] !== undefined) {
            const preta = document.createElement('div');
            preta.className = 'tecla-preta';
            preta.style.left = `calc(${posX+largura}% - 8px)`;
            if (notasAtivas.includes(offsetPretas[i])) preta.innerHTML = '<div class="marca-tecla"></div>';
            teclado.appendChild(preta);
            counter += 2;
        } else { counter += 1; }
        posX += largura;
    }
    area.appendChild(teclado);
}

// ==========================================
// GPS HARMÔNICO
// ==========================================
function extrairTonica(acordeStr) {
    const m = acordeStr.match(/^[A-G][#b]?/);
    return m ? m[0] : null;
}

function gerarRotas() {
    const origem = document.getElementById('acordeOrigem').value.trim();
    const destino = document.getElementById('acordeDestino').value.trim();
    const resultDiv = document.getElementById('resultado-rotas');
    if (!origem || !destino) {
        resultDiv.innerHTML = "<p class='erro-rota'>Digite o acorde de origem e o destino!</p>";
        return;
    }
    const origemT = origem[0].toUpperCase() + origem.slice(1);
    const destinoT = destino[0].toUpperCase() + destino.slice(1);
    const raiz = extrairTonica(destinoT);
    const idx = getNotaIndex(raiz);
    if (idx === -1) {
        resultDiv.innerHTML = "<p class='erro-rota'>Acorde de destino não reconhecido.</p>";
        return;
    }
    resultDiv.innerHTML = "";
    const V7   = notasCromaticas[somarSemitons(idx,7)]+"7";
    const SubV7= notasCromaticas[somarSemitons(idx,1)]+"7";
    const IIm7 = notasCromaticas[somarSemitons(idx,2)]+"m7";
    const Dim  = notasCromaticas[somarSemitons(idx,11)]+"dim";

    adicionarRotaVisual("Dominante Secundário (V7)",  [origemT, V7, destinoT]);
    adicionarRotaVisual("Substituto Trítono (SubV7)", [origemT, SubV7, destinoT]);
    adicionarRotaVisual("Preparação II-V",            [origemT, IIm7, V7, destinoT]);
    adicionarRotaVisual("Aproximação Diminuta",       [origemT, Dim, destinoT]);
}

function adicionarRotaVisual(nome, lista) {
    const resultDiv = document.getElementById('resultado-rotas');
    const card = document.createElement('div');
    card.className = 'rota-card';
    const titulo = document.createElement('h3');
    titulo.className = 'rota-titulo';
    titulo.innerText = nome;
    card.appendChild(titulo);
    const caminho = document.createElement('div');
    caminho.className = 'rota-caminho';
    lista.forEach((acorde, i) => {
        const box = document.createElement('div');
        box.className = 'mini-chord-box';
        const label = document.createElement('div');
        label.className = 'mini-chord-name';
        label.innerText = acorde;
        box.appendChild(label);
        // MELHORIA 2: usa a função unificada com escala 0.5
        box.appendChild(criarSVGAcorde(acorde, 0.5));
        box.onclick = () => {
            acordeAtualSelecionado = acorde;
            document.getElementById('chord-diagram-container').style.display = 'block';
            renderizarVisualizacao();
            document.getElementById('chord-diagram-container').scrollIntoView({behavior:'smooth',block:'center'});
        };
        caminho.appendChild(box);
        if (i < lista.length-1) {
            const seta = document.createElement('div');
            seta.className = 'rota-seta';
            seta.innerText = "➔";
            caminho.appendChild(seta);
        }
    });
    card.appendChild(caminho);
    resultDiv.appendChild(card);
}
