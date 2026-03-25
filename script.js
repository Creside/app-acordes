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
            // Aceita também V7 como substituto do Vm (menor harmônico)
            // Ex: Em → E7 em La menor
            const campoExpandido = [...campo];
            const grauV = campo[4]; // 5º grau (ex: "Em")
            if (grauV && grauV.endsWith('m')) {
                campoExpandido.push(grauV.replace('m', '7')); // adiciona E7
            }
            if (acordes.every(a => campoExpandido.map(c => c.toLowerCase()).includes(a.toLowerCase()))) {
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

        // Salva para compartilhar
        ultimoResultado = { labelTom, campo, pentaNotas };
        const btnComp = document.getElementById('btnCompartilhar');
        if (btnComp) btnComp.style.display = 'flex';

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
        analyser = audioContext.createAnalyser(); analyser.fftSize = 8192; // buffer maior = mais precisão de pitch
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        isListening = true; btn.innerText = "Desligar Microfone"; btn.style.backgroundColor = "#e74c3c";
        detectarPitch();
    } catch (err) { alert("Erro ao acessar o microfone."); console.error(err); }
}

function autoCorrelate(buf, sampleRate) {
    // Buffer maior + threshold mais alto = mais preciso
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
    rms = Math.sqrt(rms/SIZE);
    if (rms < 0.015) return -1; // silêncio

    // Trim silêncio nas bordas
    let r1=0, r2=SIZE-1;
    for (let i=0; i<SIZE/2; i++) if (Math.abs(buf[i])>0.1){r1=i;break;}
    for (let i=1; i<SIZE/2; i++) if (Math.abs(buf[SIZE-i])>0.1){r2=SIZE-i;break;}
    const trimmed = buf.slice(r1, r2);
    const N = trimmed.length;
    if (N < 32) return -1;

    // Autocorrelação normalizada (mais precisa que a simples)
    const corr = new Float32Array(N);
    for (let lag=0; lag<N; lag++) {
        let sum=0, norm1=0, norm2=0;
        for (let j=0; j<N-lag; j++) {
            sum   += trimmed[j] * trimmed[j+lag];
            norm1 += trimmed[j] * trimmed[j];
            norm2 += trimmed[j+lag] * trimmed[j+lag];
        }
        corr[lag] = sum / (Math.sqrt(norm1*norm2) + 1e-10);
    }

    // Pula o primeiro pico (lag=0) e acha o maior pico depois
    let d=1;
    while(d<N-1 && corr[d]>corr[d+1]) d++;
    let maxVal=-1, maxPos=-1;
    // Busca apenas na faixa de frequências musicais (60Hz–1200Hz)
    const lagMin = Math.floor(sampleRate/1200);
    const lagMax = Math.floor(sampleRate/60);
    for (let i=Math.max(d,lagMin); i<Math.min(N-1,lagMax); i++) {
        if (corr[i]>maxVal) { maxVal=corr[i]; maxPos=i; }
    }
    if (maxPos < 1 || maxVal < 0.6) return -1; // confiança baixa

    // Interpolação parabólica para maior precisão
    const y1=corr[maxPos-1], y2=corr[maxPos], y3=corr[maxPos+1];
    const a=(y1+y3-2*y2)/2, b=(y3-y1)/2;
    const T0 = a ? maxPos - b/(2*a) : maxPos;
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
    // Formato: { posicoes: [ {label, barra, g_frets, g_fingers}, ... ], piano: [] }
    // barra: { casa, de, ate } — indica pestana/cejilha
    "C":    { posicoes: [
                { label:"Aberta",  g_frets:[null,3,2,0,1,0],    g_fingers:[null,3,2,null,1,null] },
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[3,5,5,4,3,3],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,9,8,8],  g_fingers:[1,3,4,2,1,1] },
              ], piano:[0,4,7] },
    "C#":   { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[4,6,6,5,4,4],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,10,9,9], g_fingers:[1,3,4,2,1,1] },
              ], piano:[1,5,8] },
    "D":    { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,3,2], g_fingers:[null,null,null,1,3,2] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,7,7,6,5,5],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 10ª",barra:{casa:10,de:0,ate:4},g_frets:[10,12,12,11,10,10],g_fingers:[1,3,4,2,1,1]},
              ], piano:[2,6,9] },
    "D#":   { posicoes: [
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,8,8,7,6,6],    g_fingers:[1,3,4,2,1,1] },
                { label:"Aberta",  g_frets:[null,null,1,3,4,3],g_fingers:[null,null,1,2,4,3] },
              ], piano:[3,7,10] },
    "E":    { posicoes: [
                { label:"Aberta",  g_frets:[0,2,2,1,0,0],      g_fingers:[null,2,3,1,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,8,7,7],    g_fingers:[1,3,4,2,1,1] },
              ], piano:[4,8,11] },
    "F":    { posicoes: [
                { label:"Barra 1ª",barra:{casa:1,de:0,ate:4}, g_frets:[1,3,3,2,1,1],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,9,8,8],  g_fingers:[1,3,4,2,1,1] },
                { label:"Simples", g_frets:[null,null,3,2,1,1],g_fingers:[null,null,3,2,1,1] },
              ], piano:[5,9,12] },
    "F#":   { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,4,3,2,2],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,10,9,9], g_fingers:[1,3,4,2,1,1] },
              ], piano:[6,10,13] },
    "G":    { posicoes: [
                { label:"Aberta",  g_frets:[3,2,0,0,0,3],      g_fingers:[2,1,null,null,null,3] },
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[3,5,5,4,3,3],    g_fingers:[1,3,4,2,1,1] },
                { label:"Aberta 2",g_frets:[3,2,0,0,0,3],      g_fingers:[3,2,null,null,null,4] },
              ], piano:[7,11,14] },
    "G#":   { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[4,6,6,5,4,4],    g_fingers:[1,3,4,2,1,1] },
                { label:"Barra 11ª",barra:{casa:11,de:0,ate:4},g_frets:[11,13,13,12,11,11],g_fingers:[1,3,4,2,1,1]},
              ], piano:[8,12,15] },
    "A":    { posicoes: [
                { label:"Aberta",  g_frets:[null,0,2,2,2,0],   g_fingers:[null,null,1,2,3,null] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,7,7,6,5,5],    g_fingers:[1,3,4,2,1,1] },
                { label:"Aberta 2",g_frets:[null,0,2,2,2,0],   g_fingers:[null,null,2,3,4,null] },
              ], piano:[9,13,16] },
    "A#":   { posicoes: [
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,8,8,7,6,6],    g_fingers:[1,3,4,2,1,1] },
                { label:"Aberta",  g_frets:[null,1,3,3,3,1],   g_fingers:[null,1,2,3,4,1] },
              ], piano:[10,14,17] },
    "B":    { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[null,2,4,4,4,2], g_fingers:[null,1,2,3,4,1] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,8,7,7],    g_fingers:[1,3,4,2,1,1] },
              ], piano:[11,15,18] },
    "Am":   { posicoes: [
                { label:"Aberta",  g_frets:[null,0,2,2,1,0],   g_fingers:[null,null,2,3,1,null] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,7,7,5,5,5],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[0,3,7] },
    "A#m":  { posicoes: [
                { label:"Barra 1ª",barra:{casa:1,de:0,ate:4}, g_frets:[null,1,3,3,2,1], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,8,8,6,6,6],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[1,4,8] },
    "Bm":   { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[null,2,4,4,3,2], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,7,7,7],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[2,5,9] },
    "Cm":   { posicoes: [
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[null,3,5,5,4,3], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,8,8,8],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[3,6,10] },
    "C#m":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,6,5,4], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,9,9,9],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[4,7,11] },
    "Dm":   { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,3,1],g_fingers:[null,null,null,2,3,1] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,6,7,7,5,5],    g_fingers:[1,2,3,4,1,1] },
              ], piano:[5,8,12] },
    "D#m":  { posicoes: [
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,7,8,8,6,6],    g_fingers:[1,2,3,4,1,1] },
                { label:"Aberta",  g_frets:[null,null,1,3,4,2],g_fingers:[null,null,1,3,4,2] },
              ], piano:[6,9,13] },
    "Em":   { posicoes: [
                { label:"Aberta",  g_frets:[0,2,2,0,0,0],      g_fingers:[null,2,3,null,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,7,7,7],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[7,10,14] },
    "Fm":   { posicoes: [
                { label:"Barra 1ª",barra:{casa:1,de:0,ate:4}, g_frets:[1,3,3,1,1,1],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,8,8,8],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[8,11,15] },
    "F#m":  { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,4,2,2,2],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,9,9,9],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[9,12,16] },
    "Gm":   { posicoes: [
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[3,5,5,3,3,3],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 10ª",barra:{casa:10,de:0,ate:4},g_frets:[10,12,12,10,10,10],g_fingers:[1,3,4,1,1,1]},
              ], piano:[10,13,17] },
    "G#m":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[4,6,6,4,4,4],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 11ª",barra:{casa:11,de:0,ate:4},g_frets:[11,13,13,11,11,11],g_fingers:[1,3,4,1,1,1]},
              ], piano:[11,14,18] },
    "E7":   { posicoes: [
                { label:"Aberta",  g_frets:[0,2,0,1,0,0],      g_fingers:[null,2,null,1,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,7,8,7,7],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[4,8,11,14] },
    "A7":   { posicoes: [
                { label:"Aberta",  g_frets:[null,0,2,0,2,0],   g_fingers:[null,null,2,null,3,null] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,7,5,6,5,5],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[9,13,16,19] },
    "D7":   { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,1,2],g_fingers:[null,null,null,2,1,3] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:3}, g_frets:[null,5,7,5,7,5], g_fingers:[null,1,3,1,4,1] },
              ], piano:[2,6,9,12] },
    "G7":   { posicoes: [
                { label:"Aberta",  g_frets:[3,2,0,0,0,1],      g_fingers:[3,2,null,null,null,1] },
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[3,5,3,4,3,3],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[7,11,14,17] },
    "C7":   { posicoes: [
                { label:"Aberta",  g_frets:[null,3,2,3,1,0],   g_fingers:[null,3,2,4,1,null] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,8,9,8,8],   g_fingers:[1,3,1,2,1,1] },
              ], piano:[0,4,7,10] },
    "B7":   { posicoes: [
                { label:"Aberta",  g_frets:[null,2,1,2,0,2],   g_fingers:[null,2,1,3,null,4] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,7,8,7,7],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[11,15,18,21] },
    "Am7":  { posicoes: [
                { label:"Aberta",  g_frets:[null,0,2,0,1,0],   g_fingers:[null,null,2,null,1,null] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,7,5,5,5,5],    g_frets:[5,7,5,5,5,5],  g_fingers:[1,3,1,1,1,1] },
              ], piano:[0,3,7,10] },
    "Em7":  { posicoes: [
                { label:"Aberta",  g_frets:[0,2,0,0,0,0],      g_fingers:[null,1,null,null,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,7,7,7,7],    g_fingers:[1,3,1,1,1,1] },
              ], piano:[7,10,14,17] },
    "Dm7":  { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,1,1],g_fingers:[null,null,null,3,1,2] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[null,5,7,5,6,5], g_fingers:[null,1,3,1,2,1] },
              ], piano:[5,8,12,15] },
    "C7M":  { posicoes: [
                { label:"Aberta",  g_frets:[null,3,2,0,0,0],   g_fingers:[null,3,2,null,null,null] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[null,8,10,9,8,null],g_fingers:[null,1,3,2,1,null] },
              ], piano:[0,4,7,11] },
    "G7M":  { posicoes: [
                { label:"Aberta",  g_frets:[3,null,0,0,0,2],   g_fingers:[2,null,null,null,null,1] },
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[null,3,5,4,3,null],g_fingers:[null,1,3,2,1,null] },
              ], piano:[7,11,14,18] },
    "F7M":  { posicoes: [
                { label:"Aberta",  g_frets:[null,null,3,2,1,0],g_fingers:[null,null,3,2,1,null] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[null,8,10,9,8,null],g_fingers:[null,1,3,2,1,null] },
              ], piano:[5,9,12,16] },
    "Bm7":  { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[null,2,4,2,3,2], g_fingers:[null,1,3,1,2,1] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,7,7,7,7],    g_fingers:[1,3,1,1,1,1] },
              ], piano:[2,5,9,12] },
    "F#m7": { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,2,2,2,2],    g_fingers:[1,3,1,1,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,9,9,9,9],   g_fingers:[1,3,1,1,1,1] },
              ], piano:[9,12,16,19] },
    "C#7":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,4,5,4], g_fingers:[null,1,3,1,2,1] },
              ], piano:[1,5,8,11] },
    "F#7":  { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,2,3,2,2],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[6,10,13,16] },
    "C9":   { posicoes: [
                { label:"Aberta",  g_frets:[null,3,2,3,3,null],g_fingers:[null,2,1,3,4,null] },
              ], piano:[0,4,7,10,14] },
    "Edim": { posicoes: [
                { label:"Aberta",  g_frets:[null,null,2,3,2,3],g_fingers:[null,null,1,3,2,4] },
              ], piano:[4,7,10] },
    "Bdim": { posicoes: [
                { label:"Aberta",  g_frets:[null,2,3,4,3,null],g_fingers:[null,1,2,4,3,null] },
              ], piano:[11,14,17] },
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
    const wrapper = document.createElement('div');
    wrapper.className = 'teclado-wrapper';
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
    wrapper.appendChild(teclado);
    area.appendChild(wrapper);
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

// ==========================================
// MÓDULO: TRANSPOSITOR DE TOM
// ==========================================

let semitonsTransposicao = 0;

function alterarSemitons(delta) {
    semitonsTransposicao += delta;
    const display = document.getElementById('semitonsDisplay');
    if (semitonsTransposicao === 0) display.innerText = "0 semitons";
    else if (semitonsTransposicao > 0) display.innerText = `+${semitonsTransposicao} semitom${Math.abs(semitonsTransposicao) > 1 ? 's' : ''}`;
    else display.innerText = `${semitonsTransposicao} semitom${Math.abs(semitonsTransposicao) > 1 ? 's' : ''}`;
}

/**
 * Transpõe um único acorde N semitons.
 * Ex: transpor("Am7", 2) → "Bm7"
 */
function transporAcorde(acorde, semitons) {
    // Extrai a tônica (ex: "C#", "Bb", "G")
    const match = acorde.match(/^([A-G][#b]?)(.*)/);
    if (!match) return acorde; // não é um acorde reconhecível, devolve igual
    const tonica = match[1];
    const sufixo = match[2]; // "m7", "dim", "7M", etc.

    const equivalencias = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};
    const tonicaNorm = equivalencias[tonica] || tonica;
    const idx = notasCromaticas.indexOf(tonicaNorm);
    if (idx === -1) return acorde;

    const novoIdx = ((idx + semitons) % 12 + 12) % 12;
    return notasCromaticas[novoIdx] + sufixo;
}

function transpor() {
    const input = document.getElementById('inputTranspor').value.trim();
    if (!input) {
        alert("Digite os acordes para transpor.");
        return;
    }
    if (semitonsTransposicao === 0) {
        alert("Ajuste o número de semitons antes de transpor.");
        return;
    }

    // Separa por vírgula ou espaço
    const acordes = input.split(/[\s,]+/).filter(a => a.trim() !== "");
    const transpostos = acordes.map(a => transporAcorde(a.trim(), semitonsTransposicao));

    const container = document.getElementById('resultadoTransposicao');
    container.style.display = 'block';
    container.innerHTML = transpostos.map(a =>
        `<span class="acorde-transposto" onclick="mostrarDiagramaPopup('${a}', event)">${a}</span>`
    ).join(' ');
}

// ==========================================
// MÓDULO: CIFRA COMPLETA (LETRA + ACORDES)
// ==========================================

/**
 * Detecta se uma linha é de acordes (maioria das palavras são acordes válidos)
 */
function linhaEhAcordes(linha) {
    const tokens = linha.trim().split(/\s+/).filter(t => t !== "");
    if (tokens.length === 0) return false;
    const acordesValidos = tokens.filter(t => /^[A-G][#b]?(m|dim|aug|7M|7|m7|m7b5|maj7|sus2|sus4|add9)?$/.test(t));
    return acordesValidos.length / tokens.length >= 0.6;
}

function renderizarCifra() {
    const texto = document.getElementById('inputCifra').value;
    const linhas = texto.split('\n');
    const container = document.getElementById('cifraRenderizada');
    container.style.display = 'block';
    container.innerHTML = '';

    linhas.forEach(linha => {
        const span = document.createElement('span');

        if (linha.trim() === '') {
            span.className = 'cifra-linha-vazia';
        } else if (linhaEhAcordes(linha)) {
            span.className = 'cifra-linha-acordes';
            // Cada token que for acorde vira clicável
            const tokens = linha.split(/(\s+)/);
            tokens.forEach(token => {
                if (/^[A-G][#b]?(m|dim|aug|7M|7|m7|m7b5|maj7|sus2|sus4|add9)?$/.test(token.trim()) && token.trim() !== '') {
                    const a = document.createElement('span');
                    a.className = 'cifra-acorde-inline';
                    a.innerText = token;
                    a.onclick = (e) => mostrarDiagramaPopup(token.trim(), e);
                    span.appendChild(a);
                } else {
                    span.appendChild(document.createTextNode(token));
                }
            });
        } else {
            span.className = 'cifra-linha-letra';
            span.innerText = linha;
        }

        container.appendChild(span);
    });
}

// ==========================================
// POPUP FLUTUANTE DE DIAGRAMA
// ==========================================
// Fecha popup ao clicar fora
document.addEventListener('click', (e) => {
    const popup = document.getElementById('cifra-popup');
    if (!popup) return;
    if (!popup.contains(e.target) &&
        !e.target.classList.contains('cifra-acorde-inline') &&
        !e.target.classList.contains('acorde-transposto')) {
        fecharPopup();
    }
});

function mostrarDiagramaPopup(nomeAcorde, event) {
    const popup = document.getElementById('cifra-popup');
    if (!popup) return;

    document.getElementById('popup-nome').innerText = nomeAcorde;
    popupNomeAtual = nomeAcorde;
    popupTabAtual = 'violao';
    document.getElementById('popup-tab-violao').classList.add('ativo');
    document.getElementById('popup-tab-teclado').classList.remove('ativo');
    _renderPopupConteudo();

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    } else {
        popup.style.transform = '';
        const popupW = 340;
        const x = Math.min(Math.max(event.clientX, popupW/2), window.innerWidth - popupW/2 - 10);
        const y = Math.min(event.clientY + 15, window.innerHeight - 300);
        popup.style.left = (x - popupW/2) + 'px';
        popup.style.top = (y + window.scrollY) + 'px';
    }
    popup.style.display = 'block';
    event.stopPropagation();
}

function fecharPopup() {
    const popup = document.getElementById('cifra-popup');
    if (popup) popup.style.display = 'none';
}

let popupNomeAtual = '';
let popupTabAtual = 'violao';

function popupMudarTab(tab) {
    popupTabAtual = tab;
    document.getElementById('popup-tab-violao').classList.toggle('ativo', tab === 'violao');
    document.getElementById('popup-tab-teclado').classList.toggle('ativo', tab === 'teclado');
    _renderPopupConteudo();
}

function _renderPopupConteudo() {
    const svgArea = document.getElementById('popup-svg');
    if (!svgArea) return;
    svgArea.innerHTML = '';
    if (popupTabAtual === 'violao') {
        svgArea.appendChild(criarSVGAcorde(popupNomeAtual, 1));
    } else {
        // Render mini teclado no popup
        const tmp = document.createElement('div');
        tmp.id = 'chord-visual-area';
        tmp.style.display = 'none';
        document.body.appendChild(tmp);
        desenharTecladoEm(popupNomeAtual, svgArea);
        tmp.remove();
    }
}

function desenharTecladoEm(nomeAcorde, targetArea) {
    const piano = getPiano(nomeAcorde);
    if (!piano) { targetArea.innerHTML = '<p class="diagrama-indisponivel">Sem dados de teclado.</p>'; return; }
    const notasAtivas = piano;
    const nomesTeclasBrancas = ["C","D","E","F","G","A","B","C","D","E","F","G","A","B"];
    const nomesTeclasPretasIdx = {1:"C#",3:"D#",6:"F#",8:"G#",10:"A#",13:"C#",15:"D#",18:"F#",20:"G#",22:"A#"};
    const offsetPretas = [1,3,null,6,8,10,null,13,15,null,18,20,22,null];
    const total = 14;
    let counter = 0, posX = 0;
    const largura = 100/total;
    const wrapperTe = document.createElement('div');
    wrapperTe.className = 'teclado-wrapper';
    const teclado = document.createElement('div');
    teclado.className = 'teclado-container';
    for (let i=0; i<total; i++) {
        const branca = document.createElement('div');
        branca.className = 'tecla-branca';
        if (notasAtivas.includes(counter)) branca.innerHTML = '<div class="marca-tecla"></div>';
        const lb = document.createElement('div'); lb.className = 'nota-tecla-label'; lb.textContent = nomesTeclasBrancas[i]||''; branca.appendChild(lb);
        teclado.appendChild(branca);
        if (offsetPretas[i] !== null && offsetPretas[i] !== undefined) {
            const preta = document.createElement('div');
            preta.className = 'tecla-preta';
            preta.style.left = `calc(${posX+largura}% - 8px)`;
            if (notasAtivas.includes(offsetPretas[i])) preta.innerHTML = '<div class="marca-tecla"></div>';
            const lp = document.createElement('div'); lp.className = 'nota-tecla-label'; lp.textContent = nomesTeclasPretasIdx[offsetPretas[i]]||''; preta.appendChild(lp);
            teclado.appendChild(preta);
            counter += 2;
        } else { counter += 1; }
        posX += largura;
    }
    wrapperTe.appendChild(teclado);
    targetArea.appendChild(wrapperTe);
}

// ==========================================
// MÓDULO: CÍRCULO DE QUINTAS
// ==========================================

const N_CIRCULO = 12;
const circuloMaior = ["C","G","D","A","E","B","F#","C#","G#","D#","A#","F"];
const circuloMenor = ["Am","Em","Bm","F#m","C#m","G#m","D#m","A#m","Fm","Cm","Gm","Dm"];
const circuloNomeMaior = ["Dó","Sol","Ré","Lá","Mi","Si","Fá#","Dó#","Sol#","Ré#","Lá#","Fá"];
const circuloNomeMenor = ["Lám","Mim","Sim","Fá#m","Dó#m","Sol#m","Ré#m","Lá#m","Fám","Dóm","Solm","Rém"];

let circuloSegmentoAtivo = null;

function desenharCirculoDeQuintas() {
    const wrapper = document.getElementById('circulo-svg-wrapper');
    const SIZE = 340;
    const cx = SIZE / 2, cy = SIZE / 2;
    const RAIO_EXT = 155, RAIO_MED = 108, RAIO_INT = 62, RAIO_CENTRO = 30;
    const N = N_CIRCULO;
    const angInicio = -Math.PI / 2; // começa no topo

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute("width", SIZE);
    svg.setAttribute("height", SIZE);

    function arco(raioOuter, raioInner, i, total) {
        const a1 = angInicio + (i / total) * 2 * Math.PI;
        const a2 = angInicio + ((i + 1) / total) * 2 * Math.PI;
        const gap = 0.018; // espaço entre fatias
        const a1g = a1 + gap, a2g = a2 - gap;
        const x1 = cx + raioOuter * Math.cos(a1g), y1 = cy + raioOuter * Math.sin(a1g);
        const x2 = cx + raioOuter * Math.cos(a2g), y2 = cy + raioOuter * Math.sin(a2g);
        const x3 = cx + raioInner * Math.cos(a2g), y3 = cy + raioInner * Math.sin(a2g);
        const x4 = cx + raioInner * Math.cos(a1g), y4 = cy + raioInner * Math.sin(a1g);
        return `M ${x1} ${y1} A ${raioOuter} ${raioOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${raioInner} ${raioInner} 0 0 0 ${x4} ${y4} Z`;
    }

    function textoPosicao(raio, i, total) {
        const ang = angInicio + ((i + 0.5) / total) * 2 * Math.PI;
        return { x: cx + raio * Math.cos(ang), y: cy + raio * Math.sin(ang) };
    }

    // Paleta de cores para tons maiores (anel externo)
    const coresMaior = [
        "#c0392b","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db",
        "#2980b9","#9b59b6","#8e44ad","#d35400","#e74c3c","#27ae60"
    ];

    for (let i = 0; i < N; i++) {
        const corBase = coresMaior[i];
        const corMenor = corBase + "88"; // menor transparência

        // --- Anel externo: tons maiores ---
        const pathMaior = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathMaior.setAttribute("d", arco(RAIO_EXT, RAIO_MED, i, N));
        pathMaior.setAttribute("fill", corBase);
        pathMaior.setAttribute("opacity", "0.85");
        pathMaior.setAttribute("cursor", "pointer");
        pathMaior.setAttribute("data-idx", i);
        pathMaior.setAttribute("data-tipo", "maior");
        pathMaior.style.transition = "opacity 0.2s";
        pathMaior.addEventListener("mouseenter", () => { pathMaior.setAttribute("opacity","1"); });
        pathMaior.addEventListener("mouseleave", () => { pathMaior.setAttribute("opacity","0.85"); });
        pathMaior.addEventListener("click", () => selecionarTomCirculo(i, "maior"));
        svg.appendChild(pathMaior);

        // Texto tom maior
        const posMaior = textoPosicao(RAIO_MED + (RAIO_EXT - RAIO_MED) / 2, i, N);
        const txtMaior = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtMaior.setAttribute("x", posMaior.x); txtMaior.setAttribute("y", posMaior.y);
        txtMaior.setAttribute("fill", "#fff"); txtMaior.setAttribute("font-size", "13px");
        txtMaior.setAttribute("font-weight", "bold"); txtMaior.setAttribute("text-anchor", "middle");
        txtMaior.setAttribute("dominant-baseline", "central");
        txtMaior.setAttribute("pointer-events", "none");
        txtMaior.textContent = circuloMaior[i];
        svg.appendChild(txtMaior);

        // --- Anel interno: tons menores ---
        const pathMenor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathMenor.setAttribute("d", arco(RAIO_MED, RAIO_INT, i, N));
        pathMenor.setAttribute("fill", corMenor);
        pathMenor.setAttribute("cursor", "pointer");
        pathMenor.setAttribute("data-idx", i);
        pathMenor.setAttribute("data-tipo", "menor");
        pathMenor.style.transition = "opacity 0.2s";
        pathMenor.addEventListener("mouseenter", () => { pathMenor.setAttribute("opacity","1.2"); });
        pathMenor.addEventListener("click", () => selecionarTomCirculo(i, "menor"));
        svg.appendChild(pathMenor);

        // Texto tom menor
        const posMenor = textoPosicao(RAIO_INT + (RAIO_MED - RAIO_INT) / 2, i, N);
        const txtMenor = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtMenor.setAttribute("x", posMenor.x); txtMenor.setAttribute("y", posMenor.y);
        txtMenor.setAttribute("fill", "#fff"); txtMenor.setAttribute("font-size", "10px");
        txtMenor.setAttribute("font-weight", "bold"); txtMenor.setAttribute("text-anchor", "middle");
        txtMenor.setAttribute("dominant-baseline", "central");
        txtMenor.setAttribute("pointer-events", "none");
        txtMenor.textContent = circuloMenor[i];
        svg.appendChild(txtMenor);
    }

    // Centro decorativo
    const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circulo.setAttribute("cx", cx); circulo.setAttribute("cy", cy);
    circulo.setAttribute("r", RAIO_INT - 2);
    circulo.setAttribute("fill", "#1a1a24"); circulo.setAttribute("stroke", "#333");
    circulo.setAttribute("stroke-width","2");
    svg.appendChild(circulo);

    const txtCentro = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtCentro.setAttribute("x", cx); txtCentro.setAttribute("y", cy);
    txtCentro.setAttribute("fill", "#666"); txtCentro.setAttribute("font-size", "9px");
    txtCentro.setAttribute("text-anchor", "middle"); txtCentro.setAttribute("dominant-baseline", "central");
    txtCentro.textContent = "♩";
    svg.appendChild(txtCentro);

    wrapper.innerHTML = '';
    wrapper.appendChild(svg);
}

function selecionarTomCirculo(idx, tipo) {
    const tonica = tipo === "maior" ? circuloMaior[idx] : circuloMenor[idx].replace("m","");
    const modo = tipo;
    const nomeDisplay = tipo === "maior" ? circuloMaior[idx] + " Maior" : circuloMenor[idx];

    const campo = tipo === "maior"
        ? gerarCampoHarmonicoMaior(tonica)
        : gerarCampoHarmonicoMenor(tonica);

    // Quintas vizinhas
    const idxAnterior = (idx + N_CIRCULO - 1) % N_CIRCULO;
    const idxProximo  = (idx + 1) % N_CIRCULO;
    const vizMaior = [circuloMaior[idxAnterior], circuloMaior[idxProximo]];

    const infoDiv = document.getElementById('circulo-info');
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="circulo-info-tom">🎵 ${nomeDisplay}</div>
        <b>Campo Harmônico:</b> ${campo.join(" — ")}<br>
        <b>Quintas vizinhas:</b> ${vizMaior[0]} ◀ ${circuloMaior[idx]} ▶ ${vizMaior[1]}
    `;

    // Preenche o input do identificador com os acordes do campo para facilitar
    document.getElementById('inputAcordes').value = campo.slice(0,4).join(", ");
}

// Inicializa o círculo quando a página carrega
window.addEventListener('DOMContentLoaded', desenharCirculoDeQuintas);// ==========================================
// FUNÇÃO SVG UNIFICADA — COM MÚLTIPLAS POSIÇÕES E BARRA
// ==========================================

/**
 * Retorna o shape a usar: suporta formato antigo e novo (posicoes[])
 */
function getShapeData(nomeAcorde, posicaoIdx) {
    const entry = dicionarioShapes[nomeAcorde];
    if (!entry) return null;
    // Novo formato: { posicoes: [...], piano: [] }
    if (entry.posicoes) return entry.posicoes[posicaoIdx || 0];
    // Formato legado: { g_frets, g_fingers, piano }
    return entry;
}

function getNumPosicoes(nomeAcorde) {
    const entry = dicionarioShapes[nomeAcorde];
    if (!entry) return 0;
    if (entry.posicoes) return entry.posicoes.length;
    return 1;
}

function getPiano(nomeAcorde) {
    const entry = dicionarioShapes[nomeAcorde];
    return entry ? entry.piano : null;
}

/**
 * Cria um SVG de diagrama de acorde para violão.
 * @param {string} nomeAcorde
 * @param {number} escala - 1 normal, 0.5 miniatura
 * @param {number} posicaoIdx - qual posição do acorde mostrar
 */
function criarSVGAcorde(nomeAcorde, escala, posicaoIdx) {
    escala = escala || 1;
    posicaoIdx = posicaoIdx || 0;
    const W=140, H=170, FRETS=5, ML=20, MT=30;
    const strSp = (W - 2*ML) / 5;
    const fretSp = (H - MT - 10) / FRETS;

    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W*escala);
    svg.setAttribute("height", H*escala);
    svg.style.display = "block";
    if (escala >= 1) svg.style.margin = "0 auto";

    const data = getShapeData(nomeAcorde, posicaoIdx);
    if (!data) {
        const t = document.createElementNS("http://www.w3.org/2000/svg","text");
        t.setAttribute("x", W/2); t.setAttribute("y", H/2);
        t.setAttribute("fill","#888"); t.setAttribute("font-size","40px");
        t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
        t.textContent = "?"; svg.appendChild(t); return svg;
    }

    // Indicador de casa (ex: "5fr") quando há barra em casa > 1
    if (data.barra && data.barra.casa > 1) {
        const casaLabel = document.createElementNS("http://www.w3.org/2000/svg","text");
        casaLabel.setAttribute("x", W - ML + 4);
        casaLabel.setAttribute("y", MT + fretSp * 0.5);
        casaLabel.setAttribute("fill","#aaa");
        casaLabel.setAttribute("font-size","10px");
        casaLabel.setAttribute("dominant-baseline","central");
        casaLabel.textContent = `${data.barra.casa}fr`;
        svg.appendChild(casaLabel);
    }

    // Pestana (nut) — mais grossa se casa 0, linha fina se barra em casa >1
    const nut = document.createElementNS("http://www.w3.org/2000/svg","line");
    nut.setAttribute("x1", ML); nut.setAttribute("y1", MT);
    nut.setAttribute("x2", W-ML); nut.setAttribute("y2", MT);
    nut.setAttribute("stroke", data.barra && data.barra.casa > 1 ? "#555" : "#fff");
    nut.setAttribute("stroke-width", data.barra && data.barra.casa > 1 ? "1" : "4");
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

    // BARRA (cejilha) — retângulo arredondado
    if (data.barra) {
        const xDe = ML + data.barra.de * strSp;
        const xAte = ML + data.barra.ate * strSp;
        const yBarra = MT + (1 - 0.5) * fretSp;
        const barraRect = document.createElementNS("http://www.w3.org/2000/svg","rect");
        barraRect.setAttribute("x", xDe - 6);
        barraRect.setAttribute("y", yBarra - 9);
        barraRect.setAttribute("width", (xAte - xDe) + 12);
        barraRect.setAttribute("height", 18);
        barraRect.setAttribute("rx", 9);
        barraRect.setAttribute("fill", "#f1c40f");
        svg.appendChild(barraRect);

        // Número da casa dentro da barra
        if (escala >= 1) {
            const barraText = document.createElementNS("http://www.w3.org/2000/svg","text");
            barraText.setAttribute("x", (xDe + xAte) / 2);
            barraText.setAttribute("y", yBarra);
            barraText.setAttribute("fill","#000");
            barraText.setAttribute("font-size","10px");
            barraText.setAttribute("font-weight","bold");
            barraText.setAttribute("text-anchor","middle");
            barraText.setAttribute("dominant-baseline","central");
            barraText.textContent = "B";
            svg.appendChild(barraText);
        }
    }

    // Notas e dedos
    for (let i=0; i<6; i++) {
        const casa = data.g_frets[i], dedo = data.g_fingers ? data.g_fingers[i] : null;
        const x = ML + i*strSp;
        if (casa === null || casa === 0) {
            const t = document.createElementNS("http://www.w3.org/2000/svg","text");
            t.setAttribute("x",x); t.setAttribute("y", MT - 10);
            t.setAttribute("fill", escala<1?"#aaa":"#888");
            t.setAttribute("font-size", escala<1?"14px":"12px");
            t.setAttribute("font-weight","bold"); t.setAttribute("text-anchor","middle");
            t.textContent = casa===null?"X":"O"; svg.appendChild(t);
        } else if (casa > 0) {
            // Normaliza casa relativa quando há barra
            const casaRel = data.barra ? casa - data.barra.casa + 1 : casa;
            if (casaRel < 1 || casaRel > FRETS) continue; // fora da janela
            const y = MT + (casaRel - 0.5) * fretSp;
            // Não desenha bolinha onde já tem a barra (dedo 1)
            // Só oculta bolinhas que estão cobertas pela barra (dedo 1 na 1ª casa relativa)
            const cobertaPelaBarra = data.barra && dedo === 1 && casaRel === 1;
            if (!cobertaPelaBarra) {
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
    }
    return svg;
}

// ==========================================
// DESENHO DO VIOLÃO — COM SELETOR DE POSIÇÕES
// ==========================================
let posicaoAtual = 0;

function desenharDiagramaAcorde(nomeAcorde) {
    posicaoAtual = 0;
    _renderDiagramaComPosicao(nomeAcorde, 0);
}

function _renderDiagramaComPosicao(nomeAcorde, posIdx) {
    const container = document.getElementById('chord-diagram-container');
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';
    document.getElementById('nomeAcordeDestaque').innerText = nomeAcorde;
    container.style.display = 'block';

    const numPos = getNumPosicoes(nomeAcorde);
    if (numPos === 0) {
        area.innerHTML = `<p class="diagrama-indisponivel">Diagrama para <b>${nomeAcorde}</b> não disponível.</p>`;
        return;
    }

    // Seletor de posições (tabs de posição)
    if (numPos > 1) {
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'posicao-tabs';
        for (let p = 0; p < numPos; p++) {
            const shape = getShapeData(nomeAcorde, p);
            const btn = document.createElement('button');
            btn.className = 'posicao-btn' + (p === posIdx ? ' ativo' : '');
            btn.innerText = shape.label || `Posição ${p+1}`;
            btn.onclick = () => {
                posicaoAtual = p;
                _renderDiagramaComPosicao(nomeAcorde, p);
            };
            tabsDiv.appendChild(btn);
        }
        area.appendChild(tabsDiv);
    }

    area.appendChild(criarSVGAcorde(nomeAcorde, 1, posIdx));
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
    wrapper.appendChild(teclado);
    area.appendChild(wrapper);
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

// ==========================================
// MÓDULO: TRANSPOSITOR DE TOM
// ==========================================


function alterarSemitons(delta) {
    semitonsTransposicao += delta;
    const display = document.getElementById('semitonsDisplay');
    if (semitonsTransposicao === 0) display.innerText = "0 semitons";
    else if (semitonsTransposicao > 0) display.innerText = `+${semitonsTransposicao} semitom${Math.abs(semitonsTransposicao) > 1 ? 's' : ''}`;
    else display.innerText = `${semitonsTransposicao} semitom${Math.abs(semitonsTransposicao) > 1 ? 's' : ''}`;
}

/**
 * Transpõe um único acorde N semitons.
 * Ex: transpor("Am7", 2) → "Bm7"
 */
function transporAcorde(acorde, semitons) {
    // Extrai a tônica (ex: "C#", "Bb", "G")
    const match = acorde.match(/^([A-G][#b]?)(.*)/);
    if (!match) return acorde; // não é um acorde reconhecível, devolve igual
    const tonica = match[1];
    const sufixo = match[2]; // "m7", "dim", "7M", etc.

    const equivalencias = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};
    const tonicaNorm = equivalencias[tonica] || tonica;
    const idx = notasCromaticas.indexOf(tonicaNorm);
    if (idx === -1) return acorde;

    const novoIdx = ((idx + semitons) % 12 + 12) % 12;
    return notasCromaticas[novoIdx] + sufixo;
}

function transpor() {
    const input = document.getElementById('inputTranspor').value.trim();
    if (!input) {
        alert("Digite os acordes para transpor.");
        return;
    }
    if (semitonsTransposicao === 0) {
        alert("Ajuste o número de semitons antes de transpor.");
        return;
    }

    // Separa por vírgula ou espaço
    const acordes = input.split(/[\s,]+/).filter(a => a.trim() !== "");
    const transpostos = acordes.map(a => transporAcorde(a.trim(), semitonsTransposicao));

    const container = document.getElementById('resultadoTransposicao');
    container.style.display = 'block';
    container.innerHTML = transpostos.map(a =>
        `<span class="acorde-transposto" onclick="mostrarDiagramaPopup('${a}', event)">${a}</span>`
    ).join(' ');
}

// ==========================================
// MÓDULO: CIFRA COMPLETA (LETRA + ACORDES)
// ==========================================

/**
 * Detecta se uma linha é de acordes (maioria das palavras são acordes válidos)
 */
function linhaEhAcordes(linha) {
    const tokens = linha.trim().split(/\s+/).filter(t => t !== "");
    if (tokens.length === 0) return false;
    const acordesValidos = tokens.filter(t => /^[A-G][#b]?(m|dim|aug|7M|7|m7|m7b5|maj7|sus2|sus4|add9)?$/.test(t));
    return acordesValidos.length / tokens.length >= 0.6;
}


// ==========================================
// POPUP FLUTUANTE DE DIAGRAMA
// ==========================================
// Fecha popup ao clicar fora
document.addEventListener('click', (e) => {
    const popup = document.getElementById('cifra-popup');
    if (!popup) return;
    if (!popup.contains(e.target) &&
        !e.target.classList.contains('cifra-acorde-inline') &&
        !e.target.classList.contains('acorde-transposto')) {
        fecharPopup();
    }
});

function mostrarDiagramaPopup(nomeAcorde, event) {
    const popup = document.getElementById('cifra-popup');
    if (!popup) return;

    document.getElementById('popup-nome').innerText = nomeAcorde;
    popupNomeAtual = nomeAcorde;
    popupTabAtual = 'violao';
    document.getElementById('popup-tab-violao').classList.add('ativo');
    document.getElementById('popup-tab-teclado').classList.remove('ativo');
    _renderPopupConteudo();

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    } else {
        popup.style.transform = '';
        const popupW = 340;
        const x = Math.min(Math.max(event.clientX, popupW/2), window.innerWidth - popupW/2 - 10);
        const y = Math.min(event.clientY + 15, window.innerHeight - 300);
        popup.style.left = (x - popupW/2) + 'px';
        popup.style.top = (y + window.scrollY) + 'px';
    }
    popup.style.display = 'block';
    event.stopPropagation();
}

function fecharPopup() {
    const popup = document.getElementById('cifra-popup');
    if (popup) popup.style.display = 'none';
}

// dup removed: let popupNomeAtual = '';
// dup removed: let popupTabAtual = 'violao';

function popupMudarTab(tab) {
    popupTabAtual = tab;
    document.getElementById('popup-tab-violao').classList.toggle('ativo', tab === 'violao');
    document.getElementById('popup-tab-teclado').classList.toggle('ativo', tab === 'teclado');
    _renderPopupConteudo();
}

function _renderPopupConteudo() {
    const svgArea = document.getElementById('popup-svg');
    if (!svgArea) return;
    svgArea.innerHTML = '';
    if (popupTabAtual === 'violao') {
        svgArea.appendChild(criarSVGAcorde(popupNomeAtual, 1));
    } else {
        // Render mini teclado no popup
        const tmp = document.createElement('div');
        tmp.id = 'chord-visual-area';
        tmp.style.display = 'none';
        document.body.appendChild(tmp);
        desenharTecladoEm(popupNomeAtual, svgArea);
        tmp.remove();
    }
}

function desenharTecladoEm(nomeAcorde, targetArea) {
    const piano = getPiano(nomeAcorde);
    if (!piano) { targetArea.innerHTML = '<p class="diagrama-indisponivel">Sem dados de teclado.</p>'; return; }
    const notasAtivas = piano;
    const nomesTeclasBrancas = ["C","D","E","F","G","A","B","C","D","E","F","G","A","B"];
    const nomesTeclasPretasIdx = {1:"C#",3:"D#",6:"F#",8:"G#",10:"A#",13:"C#",15:"D#",18:"F#",20:"G#",22:"A#"};
    const offsetPretas = [1,3,null,6,8,10,null,13,15,null,18,20,22,null];
    const total = 14;
    let counter = 0, posX = 0;
    const largura = 100/total;
    const wrapperTe = document.createElement('div');
    wrapperTe.className = 'teclado-wrapper';
    const teclado = document.createElement('div');
    teclado.className = 'teclado-container';
    for (let i=0; i<total; i++) {
        const branca = document.createElement('div');
        branca.className = 'tecla-branca';
        if (notasAtivas.includes(counter)) branca.innerHTML = '<div class="marca-tecla"></div>';
        const lb = document.createElement('div'); lb.className = 'nota-tecla-label'; lb.textContent = nomesTeclasBrancas[i]||''; branca.appendChild(lb);
        teclado.appendChild(branca);
        if (offsetPretas[i] !== null && offsetPretas[i] !== undefined) {
            const preta = document.createElement('div');
            preta.className = 'tecla-preta';
            preta.style.left = `calc(${posX+largura}% - 8px)`;
            if (notasAtivas.includes(offsetPretas[i])) preta.innerHTML = '<div class="marca-tecla"></div>';
            const lp = document.createElement('div'); lp.className = 'nota-tecla-label'; lp.textContent = nomesTeclasPretasIdx[offsetPretas[i]]||''; preta.appendChild(lp);
            teclado.appendChild(preta);
            counter += 2;
        } else { counter += 1; }
        posX += largura;
    }
    wrapperTe.appendChild(teclado);
    targetArea.appendChild(wrapperTe);
}

// ==========================================
// MÓDULO: CÍRCULO DE QUINTAS
// ==========================================


// removed duplicate: let circuloSegmentoAtivo = null;

function desenharCirculoDeQuintas() {
    const wrapper = document.getElementById('circulo-svg-wrapper');
    const SIZE = 340;
    const cx = SIZE / 2, cy = SIZE / 2;
    const RAIO_EXT = 155, RAIO_MED = 108, RAIO_INT = 62, RAIO_CENTRO = 30;
    const N = N_CIRCULO;
    const angInicio = -Math.PI / 2; // começa no topo

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute("width", SIZE);
    svg.setAttribute("height", SIZE);

    function arco(raioOuter, raioInner, i, total) {
        const a1 = angInicio + (i / total) * 2 * Math.PI;
        const a2 = angInicio + ((i + 1) / total) * 2 * Math.PI;
        const gap = 0.018; // espaço entre fatias
        const a1g = a1 + gap, a2g = a2 - gap;
        const x1 = cx + raioOuter * Math.cos(a1g), y1 = cy + raioOuter * Math.sin(a1g);
        const x2 = cx + raioOuter * Math.cos(a2g), y2 = cy + raioOuter * Math.sin(a2g);
        const x3 = cx + raioInner * Math.cos(a2g), y3 = cy + raioInner * Math.sin(a2g);
        const x4 = cx + raioInner * Math.cos(a1g), y4 = cy + raioInner * Math.sin(a1g);
        return `M ${x1} ${y1} A ${raioOuter} ${raioOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${raioInner} ${raioInner} 0 0 0 ${x4} ${y4} Z`;
    }

    function textoPosicao(raio, i, total) {
        const ang = angInicio + ((i + 0.5) / total) * 2 * Math.PI;
        return { x: cx + raio * Math.cos(ang), y: cy + raio * Math.sin(ang) };
    }

    // Paleta de cores para tons maiores (anel externo)
    const coresMaior = [
        "#c0392b","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db",
        "#2980b9","#9b59b6","#8e44ad","#d35400","#e74c3c","#27ae60"
    ];

    for (let i = 0; i < N; i++) {
        const corBase = coresMaior[i];
        const corMenor = corBase + "88"; // menor transparência

        // --- Anel externo: tons maiores ---
        const pathMaior = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathMaior.setAttribute("d", arco(RAIO_EXT, RAIO_MED, i, N));
        pathMaior.setAttribute("fill", corBase);
        pathMaior.setAttribute("opacity", "0.85");
        pathMaior.setAttribute("cursor", "pointer");
        pathMaior.setAttribute("data-idx", i);
        pathMaior.setAttribute("data-tipo", "maior");
        pathMaior.style.transition = "opacity 0.2s";
        pathMaior.addEventListener("mouseenter", () => { pathMaior.setAttribute("opacity","1"); });
        pathMaior.addEventListener("mouseleave", () => { pathMaior.setAttribute("opacity","0.85"); });
        pathMaior.addEventListener("click", () => selecionarTomCirculo(i, "maior"));
        svg.appendChild(pathMaior);

        // Texto tom maior
        const posMaior = textoPosicao(RAIO_MED + (RAIO_EXT - RAIO_MED) / 2, i, N);
        const txtMaior = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtMaior.setAttribute("x", posMaior.x); txtMaior.setAttribute("y", posMaior.y);
        txtMaior.setAttribute("fill", "#fff"); txtMaior.setAttribute("font-size", "13px");
        txtMaior.setAttribute("font-weight", "bold"); txtMaior.setAttribute("text-anchor", "middle");
        txtMaior.setAttribute("dominant-baseline", "central");
        txtMaior.setAttribute("pointer-events", "none");
        txtMaior.textContent = circuloMaior[i];
        svg.appendChild(txtMaior);

        // --- Anel interno: tons menores ---
        const pathMenor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathMenor.setAttribute("d", arco(RAIO_MED, RAIO_INT, i, N));
        pathMenor.setAttribute("fill", corMenor);
        pathMenor.setAttribute("cursor", "pointer");
        pathMenor.setAttribute("data-idx", i);
        pathMenor.setAttribute("data-tipo", "menor");
        pathMenor.style.transition = "opacity 0.2s";
        pathMenor.addEventListener("mouseenter", () => { pathMenor.setAttribute("opacity","1.2"); });
        pathMenor.addEventListener("click", () => selecionarTomCirculo(i, "menor"));
        svg.appendChild(pathMenor);

        // Texto tom menor
        const posMenor = textoPosicao(RAIO_INT + (RAIO_MED - RAIO_INT) / 2, i, N);
        const txtMenor = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtMenor.setAttribute("x", posMenor.x); txtMenor.setAttribute("y", posMenor.y);
        txtMenor.setAttribute("fill", "#fff"); txtMenor.setAttribute("font-size", "10px");
        txtMenor.setAttribute("font-weight", "bold"); txtMenor.setAttribute("text-anchor", "middle");
        txtMenor.setAttribute("dominant-baseline", "central");
        txtMenor.setAttribute("pointer-events", "none");
        txtMenor.textContent = circuloMenor[i];
        svg.appendChild(txtMenor);
    }

    // Centro decorativo
    const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circulo.setAttribute("cx", cx); circulo.setAttribute("cy", cy);
    circulo.setAttribute("r", RAIO_INT - 2);
    circulo.setAttribute("fill", "#1a1a24"); circulo.setAttribute("stroke", "#333");
    circulo.setAttribute("stroke-width","2");
    svg.appendChild(circulo);

    const txtCentro = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtCentro.setAttribute("x", cx); txtCentro.setAttribute("y", cy);
    txtCentro.setAttribute("fill", "#666"); txtCentro.setAttribute("font-size", "9px");
    txtCentro.setAttribute("text-anchor", "middle"); txtCentro.setAttribute("dominant-baseline", "central");
    txtCentro.textContent = "♩";
    svg.appendChild(txtCentro);

    wrapper.innerHTML = '';
    wrapper.appendChild(svg);
}

function selecionarTomCirculo(idx, tipo) {
    const tonica = tipo === "maior" ? circuloMaior[idx] : circuloMenor[idx].replace("m","");
    const modo = tipo;
    const nomeDisplay = tipo === "maior" ? circuloMaior[idx] + " Maior" : circuloMenor[idx];

    const campo = tipo === "maior"
        ? gerarCampoHarmonicoMaior(tonica)
        : gerarCampoHarmonicoMenor(tonica);

    // Quintas vizinhas
    const idxAnterior = (idx + N_CIRCULO - 1) % N_CIRCULO;
    const idxProximo  = (idx + 1) % N_CIRCULO;
    const vizMaior = [circuloMaior[idxAnterior], circuloMaior[idxProximo]];

    const infoDiv = document.getElementById('circulo-info');
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="circulo-info-tom">🎵 ${nomeDisplay}</div>
        <b>Campo Harmônico:</b> ${campo.join(" — ")}<br>
        <b>Quintas vizinhas:</b> ${vizMaior[0]} ◀ ${circuloMaior[idx]} ▶ ${vizMaior[1]}
    `;

    // Preenche o input do identificador com os acordes do campo para facilitar
    document.getElementById('inputAcordes').value = campo.slice(0,4).join(", ");
}

// Inicializa o círculo quando a página carrega
window.addEventListener('DOMContentLoaded', desenharCirculoDeQuintas);

// ==========================================
// MODO CLARO / ESCURO
// ==========================================
function alternarTema() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('btnTema').textContent = isDark ? '🌑' : '🌙';
    localStorage.setItem('tema', isDark ? 'light' : 'dark');
}

// Aplica tema salvo ao carregar
(function() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo) {
        document.documentElement.setAttribute('data-theme', temaSalvo);
        const btn = document.getElementById('btnTema');
        if (btn) btn.textContent = temaSalvo === 'light' ? '🌑' : '🌙';
    }
})();

// ==========================================
// COMPARTILHAR RESULTADO
// ==========================================
let ultimoResultado = null;

function compartilharResultado() {
    if (!ultimoResultado) return;
    const { labelTom, campo, pentaNotas } = ultimoResultado;
    const texto = `🎵 Tom: ${labelTom}\n🛤️ Campo Harmônico: ${campo.join(' - ')}\n🎸 Pentatônica: ${pentaNotas.join(', ')}\n\n🎸 App de Acordes`;

    const overlay = document.getElementById('share-overlay');
    const conteudo = document.getElementById('share-conteudo');
    conteudo.innerHTML = `
        <div class="share-texto">${texto}</div>
        <div class="share-opcoes">
            <button class="btn-copy" onclick="copiarTextoShare()">📋 Copiar texto</button>
            <button class="btn-share" onclick="compartilharWhatsApp()">💬 Compartilhar no WhatsApp</button>
        </div>
    `;
    overlay.classList.add('aberto');
    window._shareTexto = texto;
}

function fecharShare() {
    document.getElementById('share-overlay').classList.remove('aberto');
}

function copiarTextoShare() {
    navigator.clipboard.writeText(window._shareTexto || '').then(() => {
        const btn = document.querySelector('.btn-copy');
        btn.textContent = '✅ Copiado!';
        setTimeout(() => btn.textContent = '📋 Copiar texto', 2000);
    });
}

function compartilharWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(window._shareTexto || '')}`;
    window.open(url, '_blank');
}

// ==========================================
// ONBOARDING / TOOLTIPS
// ==========================================
const glossario = {
    'campo-harmonico': {
        titulo: '🛤️ Campo Harmônico',
        texto: 'O campo harmônico é o conjunto de 7 acordes que "pertencem" a um determinado tom. São os acordes que soam bem juntos naturalmente.\n\nExemplo: no tom de C Maior, os acordes do campo são C, Dm, Em, F, G, Am e Bdim. Qualquer música que use só esses acordes provavelmente está em C Maior.'
    },
    'pentatonica': {
        titulo: '🎸 Escala Pentatônica',
        texto: 'A escala pentatônica tem apenas 5 notas (penta = cinco). É a escala mais usada em solos de guitarra e improvisação.\n\nA pentatônica maior soa alegre e brilhante. A pentatônica menor soa mais blues e emotiva. Toda pentatônica menor é relativa de uma maior (e vice-versa).'
    },
    'afinador': {
        titulo: '🎤 Afinador',
        texto: 'O afinador usa o microfone do seu dispositivo para detectar a frequência do som e identificar qual nota musical está sendo tocada.\n\nComo usar: clique em "Ligar Microfone", permita o acesso e toque uma corda ou cante uma nota. O app mostrará a nota detectada e sua frequência em Hz.\n\nDica: toque a nota limpa e sustentada para melhor precisão.'
    },
    'transpositor': {
        titulo: '🔀 Transpositor',
        texto: 'Transpor significa mover uma música para outro tom. O transpositor faz isso automaticamente para cada acorde.\n\nExemplo: se uma música está em Am (Lá menor) mas está grave demais para sua voz, você pode transpor +2 semitons para Bm (Si menor) e ficará mais agudo.\n\n1 semitom = 1 casa no violão. 12 semitons = 1 oitava.'
    },
    'circulo': {
        titulo: '⭕ Círculo de Quintas',
        texto: 'O círculo de quintas organiza os 12 tons musicais em um círculo. Tons vizinhos no círculo são harmonicamente próximos — compartilham muitos acordes em comum.\n\nAnel externo = tons maiores. Anel interno = tons menores relativos.\n\nUsabilidade: tons próximos são ótimos para modulação (mudança de tom) durante uma música.'
    },
    'cifra': {
        titulo: '📄 Cifra Completa',
        texto: 'Cole aqui uma cifra no formato padrão brasileiro: linha de acordes seguida pela linha da letra.\n\nO app detecta automaticamente quais linhas são acordes e quais são letra. Os acordes ficam destacados em amarelo e são clicáveis — ao clicar, aparece o diagrama de como tocá-los.\n\nExemplo de formato:\nAm    Dm    G\nHoje eu quero te dizer'
    },
    'gps': {
        titulo: '🧭 GPS Harmônico',
        texto: 'O GPS Harmônico sugere caminhos para ir de um acorde a outro de forma musical.\n\nCada "rota" é uma técnica diferente:\n• Dominante Secundário: acorde V7 do destino\n• Substituto Trítono: acorde que substitui o V7 por simetria\n• Preparação II-V: progressão clássica do jazz\n• Diminuto de Passagem: acorde diminuto que cria tensão\n\nClique em qualquer acorde da rota para ver o diagrama.'
    }
};

function mostrarTooltip(chave) {
    const info = glossario[chave];
    if (!info) return;
    const conteudo = document.getElementById('tooltip-conteudo');
    conteudo.innerHTML = `
        <div class="tooltip-secao">
            <h4 style="font-size:18px;margin-bottom:10px">${info.titulo}</h4>
            <p style="white-space:pre-line">${info.texto}</p>
        </div>
    `;
    document.getElementById('tooltip-overlay').classList.add('aberto');
}

function abrirAjuda() {
    const conteudo = document.getElementById('tooltip-conteudo');
    conteudo.innerHTML = `
        <h3 style="color:var(--accent);margin-top:0">❓ Guia do App</h3>
        ${Object.values(glossario).map(g => `
            <div class="tooltip-secao">
                <h4>${g.titulo}</h4>
                <p style="white-space:pre-line">${g.texto}</p>
            </div>
        `).join('<hr style="border-color:var(--border);margin:14px 0">')}
    `;
    document.getElementById('tooltip-overlay').classList.add('aberto');
}

function fecharTooltip() {
    document.getElementById('tooltip-overlay').classList.remove('aberto');
}
