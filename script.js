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

        // Sugestão de solo
        mostrarSugestoesSolo(tonica, modo);

        // Graus do campo harmônico
        mostrarGraus(campo);

        // Progressões por gênero com campo real
        campoHarmonicoAtual = campo;
        tonicaAtual = tonica;
        inicializarProgressoes();

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

        tonicaBracoAtual = tonica;
modoBracoAtual = modo;
// Seleciona escala padrão baseada no modo
escalaBracoAtual = modo === "menor" ? "penta_menor" : "penta_maior";
document.querySelectorAll(".escala-btn").forEach((b,i) => b.classList.toggle("ativo", i === (modo === "menor" ? 1 : 0)));
desenharBracoMelhorado();
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
    // Works even if notasEscalaAtual is empty — uses current tonica
    if (tonicaBracoAtual) {
        atualizarBracoComEscala();
    } else if (notasEscalaAtual.length > 0) {
        desenharBracoMelhorado();
    }
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
    "Dó Maior (C)":     ["C","Cm","C7","C7M","C9","F","F7M","G","G7","Am","Am7","Em7"],
    "Ré Maior (D)":     ["D","Dm","D7","D7M","D9","G","G7M","A","A7","Bm","Bm7","F#m7"],
    "Mi Maior (E)":     ["E","Em","E7","E7M","E9","A","A7M","B","B7","C#m","C#m7","G#m7"],
    "Fá Maior (F)":     ["F","Fm","F7","F7M","C","C7M","G","G7","Am","Am7","Dm","Dm7"],
    "Sol Maior (G)":    ["G","Gm","G7","G7M","G9","C","C7M","D","D7","Em","Em7","Bm7"],
    "Lá Maior (A)":     ["A","Am","A7","A7M","A9","D","D7M","E","E7","F#m","F#m7","C#m7"],
    "Si Maior (B)":     ["B","Bm","B7","B7M","E","E7M","F#7","F#m","F#m7","G#m","G#m7","C#m7"],
    "Dó# Maior (C#)":   ["C#","F#","F#7M","G#7","G#m","A#m","C#7M"],
    "Fá# Maior (F#)":   ["F#","F#7M","B","B7M","C#7","C#m","D#m"],
    "Sol# Maior (G#)":  ["G#","G#7M","C#","C#7M","D#7","D#m","Fm"],
    "Lá# Maior (A#)":   ["A#","A#7M","D#","D#7M","F7","Fm","Gm"],
    "Ré# Maior (D#)":   ["D#","D#7M","G#","G#7M","A#7","A#m","Cm"],
    "Lá menor (Am)":    ["Am","Am7","Dm","Dm7","E","E7","G","G7","C","C7M","Bdim","F7M"],
    "Mi menor (Em)":    ["Em","Em7","Am","Am7","B","B7","D","D7","G","G7M","F#dim","C7M"],
    "Ré menor (Dm)":    ["Dm","Dm7","Gm","Gm7","A","A7","C","C7","F","F7M","Edim","A#7M"],
    "Sol menor (Gm)":   ["Gm","Gm7","Cm","Cm7","D","D7","F","F7","A#","A#7M","Adim","D#7M"],
    "Si menor (Bm)":    ["Bm","Bm7","Em","Em7","F#","F#7","A","A7","D","D7M","C#dim","G7M"],
    "Dó menor (Cm)":    ["Cm","Cm7","Fm","Fm7","G","G7","A#","A#7","D#","D#7M","Bdim","G#7M"],
    "Fá menor (Fm)":    ["Fm","Fm7","A#m","A#m7","C","C7","D#","D#7","G#","G#7M","Edim","C#7M"],
    "Dó# menor (C#m)":  ["C#m","C#m7","F#m","F#m7","G#","G#7","B","B7","E","E7M","D#dim","A7M"],
    "Fá# menor (F#m)":  ["F#m","F#m7","Bm","Bm7","C#","C#7","A","A7","D","D7M","A#dim","E7M"],
    "Sol# menor (G#m)": ["G#m","G#m7","C#m","C#m7","D#","D#7","B","B7","E","E7M","Fdim","B7M"],
    "Lá# menor (A#m)":  ["A#m","A#m7","D#m","D#m7","F","F7","C#","C#7","F#","F#7M","Gdim","C#7M"],
    "Ré# menor (D#m)":  ["D#m","D#m7","G#m","G#m7","A#","A#7","F#","F#7","B","B7M","Cdim","F#7M"],
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
              ], piano:[9,12,16] },
    "A#m":  { posicoes: [
                { label:"Barra 1ª",barra:{casa:1,de:0,ate:4}, g_frets:[null,1,3,3,2,1], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,8,8,6,6,6],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[10,13,17] },
    "Bm":   { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[null,2,4,4,3,2], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,7,7,7],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[11,14,18] },
    "Cm":   { posicoes: [
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[null,3,5,5,4,3], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,8,8,8],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[0,3,7] },
    "C#m":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,6,5,4], g_fingers:[null,1,3,4,2,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,9,9,9],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[1,4,8] },
    "Dm":   { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,3,1],g_fingers:[null,null,null,2,3,1] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[5,6,7,7,5,5],    g_fingers:[1,2,3,4,1,1] },
              ], piano:[2,5,9] },
    "D#m":  { posicoes: [
                { label:"Barra 6ª",barra:{casa:6,de:0,ate:4}, g_frets:[6,7,8,8,6,6],    g_fingers:[1,2,3,4,1,1] },
                { label:"Aberta",  g_frets:[null,null,1,3,4,2],g_fingers:[null,null,1,3,4,2] },
              ], piano:[3,6,10] },
    "Em":   { posicoes: [
                { label:"Aberta",  g_frets:[0,2,2,0,0,0],      g_fingers:[null,2,3,null,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,9,7,7,7],    g_fingers:[1,3,4,1,1,1] },
              ], piano:[4,7,11] },
    "Fm":   { posicoes: [
                { label:"Barra 1ª",barra:{casa:1,de:0,ate:4}, g_frets:[1,3,3,1,1,1],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 8ª",barra:{casa:8,de:0,ate:4}, g_frets:[8,10,10,8,8,8],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[5,8,12] },
    "F#m":  { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,4,2,2,2],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,11,9,9,9],  g_fingers:[1,3,4,1,1,1] },
              ], piano:[6,9,13] },
    "Gm":   { posicoes: [
                { label:"Barra 3ª",barra:{casa:3,de:0,ate:4}, g_frets:[3,5,5,3,3,3],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 10ª",barra:{casa:10,de:0,ate:4},g_frets:[10,12,12,10,10,10],g_fingers:[1,3,4,1,1,1]},
              ], piano:[7,10,14] },
    "G#m":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[4,6,6,4,4,4],    g_fingers:[1,3,4,1,1,1] },
                { label:"Barra 11ª",barra:{casa:11,de:0,ate:4},g_frets:[11,13,13,11,11,11],g_fingers:[1,3,4,1,1,1]},
              ], piano:[8,11,15] },
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
              ], piano:[9,12,16,19] },
    "Em7":  { posicoes: [
                { label:"Aberta",  g_frets:[0,2,0,0,0,0],      g_fingers:[null,1,null,null,null,null] },
                { label:"Barra 7ª",barra:{casa:7,de:0,ate:4}, g_frets:[7,9,7,7,7,7],    g_fingers:[1,3,1,1,1,1] },
              ], piano:[4,7,11,14] },
    "Dm7":  { posicoes: [
                { label:"Aberta",  g_frets:[null,null,0,2,1,1],g_fingers:[null,null,null,3,1,2] },
                { label:"Barra 5ª",barra:{casa:5,de:0,ate:4}, g_frets:[null,5,7,5,6,5], g_fingers:[null,1,3,1,2,1] },
              ], piano:[2,5,9,12] },
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
              ], piano:[11,14,18,21] },
    "F#m7": { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,2,2,2,2],    g_fingers:[1,3,1,1,1,1] },
                { label:"Barra 9ª",barra:{casa:9,de:0,ate:4}, g_frets:[9,11,9,9,9,9],   g_fingers:[1,3,1,1,1,1] },
              ], piano:[6,9,13,16] },
    "C#7":  { posicoes: [
                { label:"Barra 4ª",barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,4,5,4], g_fingers:[null,1,3,1,2,1] },
              ], piano:[1,5,8,11] },
    "F#7":  { posicoes: [
                { label:"Barra 2ª",barra:{casa:2,de:0,ate:4}, g_frets:[2,4,2,3,2,2],    g_fingers:[1,3,1,2,1,1] },
              ], piano:[6,10,13,16] },
    "C9":   { posicoes: [
                { label:"Aberta",  g_frets:[null,3,2,3,3,null],g_fingers:[null,2,1,3,4,null] },
              ], piano:[0,4,7,10,14] },

    // --- ACORDES FALTANTES ---

    // DOM7 faltantes
    "F7":   { posicoes: [
                { label:"Barra 1ª", barra:{casa:1,de:0,ate:4}, g_frets:[1,3,1,2,1,1], g_fingers:[1,3,1,2,1,1] },
              ], piano:[5,9,12,15] },
    "G#7":  { posicoes: [
                { label:"Barra 4ª", barra:{casa:4,de:0,ate:4}, g_frets:[4,6,4,5,4,4], g_fingers:[1,3,1,2,1,1] },
              ], piano:[8,12,15,18] },
    "A#7":  { posicoes: [
                { label:"Barra 6ª", barra:{casa:6,de:0,ate:4}, g_frets:[6,8,6,7,6,6], g_fingers:[1,3,1,2,1,1] },
                { label:"Aberta",   g_frets:[null,1,3,1,3,1],  g_fingers:[null,1,3,1,4,1] },
              ], piano:[10,14,17,20] },
    "D#7":  { posicoes: [
                { label:"Barra 6ª", barra:{casa:6,de:0,ate:4}, g_frets:[null,6,8,6,7,6], g_fingers:[null,1,3,1,2,1] },
              ], piano:[3,7,10,13] },

    // MAJ7 faltantes
    "A7M":  { posicoes: [
                { label:"Aberta",   g_frets:[null,0,2,1,2,0],  g_fingers:[null,null,3,1,2,null] },
              ], piano:[9,13,16,20] },
    "B7M":  { posicoes: [
                { label:"Barra 2ª", barra:{casa:2,de:0,ate:4}, g_frets:[null,2,4,3,4,null], g_fingers:[null,1,3,2,4,null] },
              ], piano:[11,15,18,22] },
    "D7M":  { posicoes: [
                { label:"Aberta",   g_frets:[null,null,0,2,2,2], g_fingers:[null,null,null,1,2,3] },
              ], piano:[2,6,9,13] },
    "E7M":  { posicoes: [
                { label:"Aberta",   g_frets:[0,2,1,1,0,0],    g_fingers:[null,3,1,2,null,null] },
              ], piano:[4,8,11,15] },
    "G#7M": { posicoes: [
                { label:"Barra 4ª", barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,5,4,null], g_fingers:[null,1,3,2,1,null] },
              ], piano:[8,12,15,19] },
    "A#7M": { posicoes: [
                { label:"Barra 1ª", barra:{casa:1,de:0,ate:4}, g_frets:[null,1,3,2,3,null], g_fingers:[null,1,3,2,4,null] },
              ], piano:[10,14,17,21] },
    "C#7M": { posicoes: [
                { label:"Barra 4ª", barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,5,4,null], g_fingers:[null,1,3,2,1,null] },
              ], piano:[1,5,8,12] },
    "D#7M": { posicoes: [
                { label:"Barra 6ª", barra:{casa:6,de:0,ate:4}, g_frets:[null,6,8,7,6,null], g_fingers:[null,1,3,2,1,null] },
              ], piano:[3,7,10,14] },
    "F#7M": { posicoes: [
                { label:"Barra 2ª", barra:{casa:2,de:0,ate:4}, g_frets:[2,4,3,3,2,null], g_fingers:[1,4,2,3,1,null] },
              ], piano:[6,10,13,17] },

    // MIN7 faltantes
    "Gm7":  { posicoes: [
                { label:"Barra 3ª", barra:{casa:3,de:0,ate:4}, g_frets:[3,5,3,3,3,3], g_fingers:[1,3,1,1,1,1] },
              ], piano:[7,10,14,17] },
    "G#m7": { posicoes: [
                { label:"Barra 4ª", barra:{casa:4,de:0,ate:4}, g_frets:[4,6,4,4,4,4], g_fingers:[1,3,1,1,1,1] },
              ], piano:[8,11,15,18] },
    "A#m7": { posicoes: [
                { label:"Barra 1ª", barra:{casa:1,de:0,ate:4}, g_frets:[null,1,3,1,2,1], g_fingers:[null,1,3,1,2,1] },
              ], piano:[10,13,17,20] },
    "Cm7":  { posicoes: [
                { label:"Barra 3ª", barra:{casa:3,de:0,ate:4}, g_frets:[null,3,5,3,4,3], g_fingers:[null,1,3,1,2,1] },
              ], piano:[0,3,7,10] },
    "C#m7": { posicoes: [
                { label:"Barra 4ª", barra:{casa:4,de:0,ate:4}, g_frets:[null,4,6,4,5,4], g_fingers:[null,1,3,1,2,1] },
              ], piano:[1,4,8,11] },
    "D#m7": { posicoes: [
                { label:"Barra 6ª", barra:{casa:6,de:0,ate:4}, g_frets:[null,6,8,6,7,6], g_fingers:[null,1,3,1,2,1] },
              ], piano:[3,6,10,13] },
    "Fm7":  { posicoes: [
                { label:"Barra 1ª", barra:{casa:1,de:0,ate:4}, g_frets:[1,3,1,1,1,1], g_fingers:[1,3,1,1,1,1] },
              ], piano:[5,8,12,15] },

    // 9ª faltantes
    "A9":   { posicoes: [
                { label:"Aberta",   g_frets:[null,0,2,0,0,0],  g_fingers:[null,null,2,null,null,null] },
              ], piano:[9,13,16,19,23] },
    "D9":   { posicoes: [
                { label:"Barra 5ª", barra:{casa:5,de:0,ate:4}, g_frets:[null,5,4,5,5,null], g_fingers:[null,2,1,3,4,null] },
              ], piano:[2,6,9,12,16] },
    "E9":   { posicoes: [
                { label:"Aberta",   g_frets:[0,2,0,1,0,2],    g_fingers:[null,2,null,1,null,4] },
              ], piano:[4,8,11,14,18] },
    "G9":   { posicoes: [
                { label:"Aberta",   g_frets:[3,null,0,2,0,3], g_fingers:[2,null,null,1,null,3] },
              ], piano:[7,11,14,17,21] },
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
    const container = document.getElementById('variacoes-container-inner') || document.getElementById('variacoes-container');
    const grade = document.getElementById('gradeVariacoes');
    if (!grade) return;
    grade.innerHTML = '';
    const lista = bancoDeAcordes[nomeDoTom];
    if (!lista) { if(container) container.style.display = 'none'; return; }
    if(container) container.style.display = 'block';
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
// desenharTeclado: ver versão completa abaixo


// ==========================================
// ESCALA NO BRAÇO — MELHORIAS
// ==========================================
let escalaBracoAtual = 'penta_maior';
let posicaoBracoAtual = 0; // 0 = todas
let tonicaBracoAtual = 'C';
let modoBracoAtual = 'maior';

const formulasEscalaBraco = {
    penta_maior:  [0,2,4,7,9],
    penta_menor:  [0,3,5,7,10],
    maior:        [0,2,4,5,7,9,11],
    menor:        [0,2,3,5,7,8,10],
    menor_harm:   [0,2,3,5,7,8,11],
    blues:        [0,3,5,6,7,10],
};

// As 5 posições clássicas da pentatônica (casa inicial de cada posição)
// Baseadas na tônica relativa no braço
function getPosicaoRange(posicao, tonicaIdx) {
    if (posicao === 0) return null; // todas
    // Posições da pentatônica: cada posição cobre 4-5 casas
    const casaInicio = ((tonicaIdx + [0, 3, 5, 7, 10, 12][posicao - 1]) % 12);
    return { inicio: casaInicio, fim: casaInicio + 4 };
}

function selecionarEscala(escala, btn) {
    escalaBracoAtual = escala;
    // Update only the clicked button's group (not all escala-btns across tabs)
    const parent = btn.closest('.escala-selector-row');
    if (parent) parent.querySelectorAll('.escala-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarBracoComEscala();
}

function selecionarPosicao(posicao, btn) {
    posicaoBracoAtual = posicao;
    document.querySelectorAll('.posicao-braco-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarBracoComEscala();
}

function atualizarBracoComEscala() {
    const formula = formulasEscalaBraco[escalaBracoAtual] || formulasEscalaBraco.penta_maior;
    const tonicaIdx = notasCromaticas.indexOf(tonicaBracoAtual);
    if (tonicaIdx === -1) return;
    notasEscalaAtual = formula.map(s => notasCromaticas[(tonicaIdx + s) % 12]);
    desenharBracoMelhorado();
}

function desenharBracoMelhorado() {
    const fretboard = document.getElementById('fretboard');
    const instrumento = document.getElementById('seletorInstrumento').value;
    fretboard.innerHTML = '';

    const afinacao = instrumento === 'guitarra'
        ? ['E','B','G','D','A','E']
        : ['G','D','A','E'];
    const espessuras = instrumento === 'guitarra'
        ? [1,1.5,2,2.5,3,3.5]
        : [1.5,2,2.5,3];

    const tonicaIdx = notasCromaticas.indexOf(tonicaBracoAtual);

    // Define range de casas se posição específica selecionada
    let casaMin = 0, casaMax = 12;
    if (posicaoBracoAtual > 0) {
        // Posições clássicas: 1=casa0-4, 2=casa2-6, 3=casa4-8, 4=casa6-10, 5=casa9-12
        const posRanges = [[0,4],[2,6],[4,8],[6,10],[9,12]];
        const range = posRanges[posicaoBracoAtual - 1];
        // Ajusta baseado na tônica
        const offset = tonicaIdx;
        casaMin = range[0];
        casaMax = range[1];
    }

    for (let c = 0; c < afinacao.length; c++) {
        const cordaDiv = document.createElement('div');
        cordaDiv.className = 'corda';
        cordaDiv.style.setProperty('--corda-espessura', espessuras[c] + 'px');
        let ni = notasCromaticas.indexOf(afinacao[c]);

        for (let t = 0; t <= 12; t++) {
            const trasteDiv = document.createElement('div');
            trasteDiv.className = 'traste';

            if (t === 0) {
                trasteDiv.classList.add('corda-solta');
                const nomeCorda = document.createElement('div');
                nomeCorda.className = 'nome-corda-solta';
                nomeCorda.textContent = afinacao[c];
                trasteDiv.appendChild(nomeCorda);
            }
            if (t === 1) trasteDiv.classList.add('pestana');

            // Inlays
            if (t > 0 && [3,5,7,9,12].includes(t)) {
                const cordaMeio = Math.floor((afinacao.length - 1) / 2);
                if (c === cordaMeio) {
                    const m = document.createElement('div');
                    m.className = 'marcador-fundo';
                    trasteDiv.appendChild(m);
                }
            }

            // Highlight de posição
            if (posicaoBracoAtual > 0 && t >= casaMin && t <= casaMax && t > 0) {
                trasteDiv.classList.add('posicao-highlight');
            }

            const nota = notasCromaticas[(ni + t) % 12];
            const ehTonica = nota === tonicaBracoAtual;
            const ehDaEscala = notasEscalaAtual.includes(nota);
            // Na posição específica, só mostra notas dentro do range
            const dentroDoRange = posicaoBracoAtual === 0 || (t >= casaMin && t <= casaMax);

            if (ehDaEscala && dentroDoRange) {
                const bolinha = document.createElement('div');
                let cls = t === 0 ? 'bolinha-nota nota-solta-destaque' : 'bolinha-nota';
                if (ehTonica) cls += ' tonica';
                bolinha.className = cls;
                bolinha.textContent = nota;
                trasteDiv.appendChild(bolinha);
            }
            cordaDiv.appendChild(trasteDiv);
        }
        fretboard.appendChild(cordaDiv);
    }

    // Régua
    const regua = document.createElement('div');
    regua.className = 'regua-casas';
    for (let t = 0; t <= 12; t++) {
        const n = document.createElement('div');
        n.className = 'numero-casa';
        if (t === 0) n.classList.add('corda-solta-num');
        else {
            n.textContent = t;
            if ([3,5,7,9,12].includes(t)) n.style.color = '#c8a850';
        }
        regua.appendChild(n);
    }
    fretboard.appendChild(regua);
    document.getElementById('fretboard-container').style.display = 'block';
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
    if (!piano) {
        const p = document.createElement('p');
        p.className = 'diagrama-indisponivel';
        p.innerHTML = `Sem dados de teclado para <b>${nomeAcorde}</b>.`;
        targetArea.appendChild(p);
        return;
    }

    // Layout fixo em pixels — 2 oitavas (C3 a B4)
    // GAP é o espaço entre teclas brancas; a tecla preta deve ficar centrada na divisa
    const WB = 28, WP = 16, HB = 110, HP = 68, GAP = 2;
    const PASSO = WB + GAP; // 30px por tecla branca

    // Mapeamento exato de cada tecla branca com seu índice e preta à direita
    const brancas = [
        {idx:0,  nome:'C',  preta:{idx:1,  nome:'C#'}},
        {idx:2,  nome:'D',  preta:{idx:3,  nome:'D#'}},
        {idx:4,  nome:'E',  preta:null},
        {idx:5,  nome:'F',  preta:{idx:6,  nome:'F#'}},
        {idx:7,  nome:'G',  preta:{idx:8,  nome:'G#'}},
        {idx:9,  nome:'A',  preta:{idx:10, nome:'A#'}},
        {idx:11, nome:'B',  preta:null},
        {idx:12, nome:'C',  preta:{idx:13, nome:'C#'}},
        {idx:14, nome:'D',  preta:{idx:15, nome:'D#'}},
        {idx:16, nome:'E',  preta:null},
        {idx:17, nome:'F',  preta:{idx:18, nome:'F#'}},
        {idx:19, nome:'G',  preta:{idx:20, nome:'G#'}},
        {idx:21, nome:'A',  preta:{idx:22, nome:'A#'}},
        {idx:23, nome:'B',  preta:null},
    ];

    // totalW: soma de todos os passos (28px tecla + 2px gap), sem gap após a última
    const totalW = brancas.length * PASSO - GAP;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;width:100%;';

    const teclado = document.createElement('div');
    teclado.style.cssText = `position:relative;width:${totalW}px;height:${HB}px;` +
        'background:#111;border:2px solid #333;border-radius:4px;box-sizing:border-box;flex-shrink:0;';

    brancas.forEach((b, i) => {
        // x: posição absoluta do lado esquerdo da tecla branca
        const x = i * PASSO;

        // Tecla branca
        const tw = document.createElement('div');
        const marcaW = piano.includes(b.idx);
        tw.style.cssText = `position:absolute;left:${x}px;top:0;width:${WB}px;height:${HB}px;` +
            'background:#f0f0f0;border:1px solid #aaa;border-radius:0 0 4px 4px;box-sizing:border-box;';
        if (marcaW) {
            const m = document.createElement('div');
            m.className = 'marca-tecla ' + getIntervaloNota(nomeAcorde, b.idx);
            m.style.cssText = `position:absolute;bottom:12px;left:50%;transform:translateX(-50%);
                width:18px;height:18px;border-radius:50%;`;
            tw.appendChild(m);
        }
        const lb = document.createElement('span');
        lb.textContent = b.nome;
        lb.style.cssText = 'position:absolute;bottom:3px;left:50%;transform:translateX(-50%);' +
            'font-size:8px;font-weight:bold;color:#555;pointer-events:none;';
        tw.appendChild(lb);
        teclado.appendChild(tw);

        // Tecla preta: centralizada na divisa entre esta tecla e a próxima
        // Divisa = x + WB + GAP/2; a tecla preta se centra aí → left = divisa - WP/2
        if (b.preta) {
            const xP = x + WB + GAP / 2 - WP / 2;
            const tp = document.createElement('div');
            const marcaP = piano.includes(b.preta.idx);
            tp.style.cssText = `position:absolute;left:${xP}px;top:0;width:${WP}px;height:${HP}px;` +
                'background:#1a1a1a;border:1px solid #000;border-radius:0 0 3px 3px;' +
                'box-sizing:border-box;z-index:2;';
            if (marcaP) {
                const m = document.createElement('div');
                m.className = 'marca-tecla ' + getIntervaloNota(nomeAcorde, b.preta.idx);
                m.style.cssText = `position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
                    width:14px;height:14px;border-radius:50%;`;
                tp.appendChild(m);
            }
            const lp = document.createElement('span');
            lp.textContent = b.preta.nome;
            lp.style.cssText = 'position:absolute;bottom:2px;left:50%;transform:translateX(-50%);' +
                'font-size:7px;color:#ccc;pointer-events:none;white-space:nowrap;';
            tp.appendChild(lp);
            teclado.appendChild(tp);
        }
    });

    wrapper.appendChild(teclado);
    targetArea.appendChild(wrapper);

    // Legenda
    const semis = piano.map(p => p % 12);
    const legendItems = [
        {nome:'Tônica',  cor:'#e74c3c', show: true},
        {nome:'Terça',   cor:'#3498db', show: semis.some(s => s===3 || s===4)},
        {nome:'Quinta',  cor:'#2ecc71', show: semis.includes(7)},
        {nome:'7ª',      cor:'#f39c12', show: semis.some(s => s===10 || s===11)},
    ].filter(it => it.show);

    if (legendItems.length) {
        const leg = document.createElement('div');
        leg.className = 'teclado-legenda';
        leg.style.marginTop = '8px';
        legendItems.forEach(it => {
            leg.innerHTML += `<span class="teclado-legenda-item">
                <span class="teclado-legenda-cor" style="background:${it.cor}"></span>${it.nome}
            </span>`;
        });
        targetArea.appendChild(leg);
    }
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
    const notaExibida = tipo === "maior" ? circuloMaior[idx] : circuloMenor[idx];

    const campo = tipo === "maior"
        ? gerarCampoHarmonicoMaior(tonica)
        : gerarCampoHarmonicoMenor(tonica);

    // Se estiver na aba Explorar, usa explorarSelecionarTom
    if (telaAtiva === 'explorar') {
        explorarSelecionarTom(tonica, modo);
        // Atualiza o input com só a nota clicada
        const inp = document.getElementById('explorInputTom');
        if (inp) inp.value = notaExibida;
        return;
    }

    // Quintas vizinhas (aba Tom)
    const idxAnterior = (idx + N_CIRCULO - 1) % N_CIRCULO;
    const idxProximo  = (idx + 1) % N_CIRCULO;
    const vizMaior = [circuloMaior[idxAnterior], circuloMaior[idxProximo]];

    const infoDiv = document.getElementById('circulo-info');
    if (infoDiv) {
        infoDiv.style.display = 'block';
        infoDiv.innerHTML = `
            <div class="circulo-info-tom">🎵 ${nomeDisplay}</div>
            <b>Campo Harmônico:</b> ${campo.join(" — ")}<br>
            <b>Quintas vizinhas:</b> ${vizMaior[0]} ◀ ${circuloMaior[idx]} ▶ ${vizMaior[1]}
        `;
    }
    // Preenche o input do identificador
    const inp = document.getElementById('inputAcordes');
    if (inp) inp.value = campo.slice(0,4).join(", ");
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
    if (!area) return;
    area.innerHTML = '';
    const nomeEl = document.getElementById('nomeAcordeDestaque');
    if (nomeEl) nomeEl.innerText = nomeAcorde;
    container.style.display = 'block';
    // Mostra toggle só no modo violão
    const toggleRow = document.getElementById('toggleRow');
    if (toggleRow) toggleRow.style.display = visaoDiagramaAtual === 'guitarra' ? 'flex' : 'none';

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

    if (visaoDiagramaAtual === 'teclado') {
        desenharTecladoEm(nomeAcorde, area);
    } else {
        area.appendChild(criarSVGAcorde(nomeAcorde, 1, posIdx));
    }
}


// ==========================================
// DESENHO DO TECLADO
// ==========================================
function desenharTeclado(nomeAcorde) {
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';
    desenharTecladoEm(nomeAcorde, area);
}


// ==========================================
// ESCALA NO BRAÇO — MELHORIAS
// ==========================================
// dup: let escalaBracoAtual = 'penta_maior';
// dup: let posicaoBracoAtual = 0; // 0 = todas
// dup: let tonicaBracoAtual = 'C';
// dup: let modoBracoAtual = 'maior';

// formulasEscalaBraco já declarada acima

// As 5 posições clássicas da pentatônica (casa inicial de cada posição)
// Baseadas na tônica relativa no braço
function getPosicaoRange(posicao, tonicaIdx) {
    if (posicao === 0) return null; // todas
    // Posições da pentatônica: cada posição cobre 4-5 casas
    const casaInicio = ((tonicaIdx + [0, 3, 5, 7, 10, 12][posicao - 1]) % 12);
    return { inicio: casaInicio, fim: casaInicio + 4 };
}

function selecionarEscala(escala, btn) {
    escalaBracoAtual = escala;
    // Update only the clicked button's group (not all escala-btns across tabs)
    const parent = btn.closest('.escala-selector-row');
    if (parent) parent.querySelectorAll('.escala-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarBracoComEscala();
}

function selecionarPosicao(posicao, btn) {
    posicaoBracoAtual = posicao;
    document.querySelectorAll('.posicao-braco-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    atualizarBracoComEscala();
}

function atualizarBracoComEscala() {
    const formula = formulasEscalaBraco[escalaBracoAtual] || formulasEscalaBraco.penta_maior;
    const tonicaIdx = notasCromaticas.indexOf(tonicaBracoAtual);
    if (tonicaIdx === -1) return;
    notasEscalaAtual = formula.map(s => notasCromaticas[(tonicaIdx + s) % 12]);
    desenharBracoMelhorado();
}

function desenharBracoMelhorado() {
    const fretboard = document.getElementById('fretboard');
    const instrumento = document.getElementById('seletorInstrumento').value;
    fretboard.innerHTML = '';

    const afinacao = instrumento === 'guitarra'
        ? ['E','B','G','D','A','E']
        : ['G','D','A','E'];
    const espessuras = instrumento === 'guitarra'
        ? [1,1.5,2,2.5,3,3.5]
        : [1.5,2,2.5,3];

    const tonicaIdx = notasCromaticas.indexOf(tonicaBracoAtual);

    // Define range de casas se posição específica selecionada
    let casaMin = 0, casaMax = 12;
    if (posicaoBracoAtual > 0) {
        // Posições clássicas: 1=casa0-4, 2=casa2-6, 3=casa4-8, 4=casa6-10, 5=casa9-12
        const posRanges = [[0,4],[2,6],[4,8],[6,10],[9,12]];
        const range = posRanges[posicaoBracoAtual - 1];
        // Ajusta baseado na tônica
        const offset = tonicaIdx;
        casaMin = range[0];
        casaMax = range[1];
    }

    for (let c = 0; c < afinacao.length; c++) {
        const cordaDiv = document.createElement('div');
        cordaDiv.className = 'corda';
        cordaDiv.style.setProperty('--corda-espessura', espessuras[c] + 'px');
        let ni = notasCromaticas.indexOf(afinacao[c]);

        for (let t = 0; t <= 12; t++) {
            const trasteDiv = document.createElement('div');
            trasteDiv.className = 'traste';

            if (t === 0) {
                trasteDiv.classList.add('corda-solta');
                const nomeCorda = document.createElement('div');
                nomeCorda.className = 'nome-corda-solta';
                nomeCorda.textContent = afinacao[c];
                trasteDiv.appendChild(nomeCorda);
            }
            if (t === 1) trasteDiv.classList.add('pestana');

            // Inlays
            if (t > 0 && [3,5,7,9,12].includes(t)) {
                const cordaMeio = Math.floor((afinacao.length - 1) / 2);
                if (c === cordaMeio) {
                    const m = document.createElement('div');
                    m.className = 'marcador-fundo';
                    trasteDiv.appendChild(m);
                }
            }

            // Highlight de posição
            if (posicaoBracoAtual > 0 && t >= casaMin && t <= casaMax && t > 0) {
                trasteDiv.classList.add('posicao-highlight');
            }

            const nota = notasCromaticas[(ni + t) % 12];
            const ehTonica = nota === tonicaBracoAtual;
            const ehDaEscala = notasEscalaAtual.includes(nota);
            // Na posição específica, só mostra notas dentro do range
            const dentroDoRange = posicaoBracoAtual === 0 || (t >= casaMin && t <= casaMax);

            if (ehDaEscala && dentroDoRange) {
                const bolinha = document.createElement('div');
                let cls = t === 0 ? 'bolinha-nota nota-solta-destaque' : 'bolinha-nota';
                if (ehTonica) cls += ' tonica';
                bolinha.className = cls;
                bolinha.textContent = nota;
                trasteDiv.appendChild(bolinha);
            }
            cordaDiv.appendChild(trasteDiv);
        }
        fretboard.appendChild(cordaDiv);
    }

    // Régua
    const regua = document.createElement('div');
    regua.className = 'regua-casas';
    for (let t = 0; t <= 12; t++) {
        const n = document.createElement('div');
        n.className = 'numero-casa';
        if (t === 0) n.classList.add('corda-solta-num');
        else {
            n.textContent = t;
            if ([3,5,7,9,12].includes(t)) n.style.color = '#c8a850';
        }
        regua.appendChild(n);
    }
    fretboard.appendChild(regua);
    document.getElementById('fretboard-container').style.display = 'block';
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

// desenharTecladoEm: definida acima

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

// selecionarTomCirculo definida acima (versão com suporte à aba Explorar)

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

// ==========================================
// HELPER: TIPO DE ACORDE → CLASSE CSS
// ==========================================
function tipoAcorde(nome) {
    if (/dim/.test(nome)) return 'tipo-dim';
    if (/m7b5/.test(nome)) return 'tipo-dim';
    if (/maj7|7M/.test(nome)) return 'tipo-maj7';
    if (/m7/.test(nome)) return 'tipo-min7';
    if (/^[A-G][#b]?7/.test(nome)) return 'tipo-dom7';
    if (/9/.test(nome)) return 'tipo-nona';
    if (/m/.test(nome)) return 'tipo-menor';
    return 'tipo-maior';
}

function corTipo(tipo) {
    const cores = {
        'tipo-maior':'#3498db','tipo-menor':'#9b59b6','tipo-dom7':'#e67e22',
        'tipo-maj7':'#2ecc71','tipo-min7':'#8e44ad','tipo-dim':'#e74c3c','tipo-nona':'#1abc9c'
    };
    return cores[tipo] || '#555';
}

// Aplica classes de tipo aos botões de variação
const _gerarBotoesOrig = gerarBotoesDeVariacao;
function gerarBotoesDeVariacao(nomeDoTom) {
    const container = document.getElementById('variacoes-container-inner') || document.getElementById('variacoes-container');
    const grade = document.getElementById('gradeVariacoes');
    if (!grade) return;
    grade.innerHTML = '';
    const lista = bancoDeAcordes[nomeDoTom];
    if (!lista) { if(container) container.style.display = 'none'; return; }
    if(container) container.style.display = 'block';

    // Legenda dos tipos presentes
    const tiposPresentes = new Map();
    lista.forEach(a => {
        const t = tipoAcorde(a);
        if (!tiposPresentes.has(t)) tiposPresentes.set(t, corTipo(t));
    });
    const legendaEl = document.getElementById('legendaTipos');
    if (legendaEl) {
        const nomes = {
            'tipo-maior':'Maior','tipo-menor':'Menor','tipo-dom7':'Dom7',
            'tipo-maj7':'Maj7','tipo-min7':'m7','tipo-dim':'Dim','tipo-nona':'Nona'
        };
        legendaEl.innerHTML = [...tiposPresentes.entries()].map(([t,c]) =>
            `<span class="legenda-item"><span class="legenda-cor" style="background:${c}"></span>${nomes[t]||t}</span>`
        ).join('');
    }

    lista.forEach((acorde, idx) => {
        const btn = document.createElement('button');
        const tipo = tipoAcorde(acorde);
        btn.className = `botao-variacao ${tipo}`;
        btn.innerText = acorde;
        btn.onclick = () => {
            document.querySelectorAll('.botao-variacao').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            acordeAtualSelecionado = acorde;
            renderizarVisualizacao();
        };
        grade.appendChild(btn);
        if (idx === 0) {
            btn.classList.add('ativo');
            acordeAtualSelecionado = acorde;
            renderizarVisualizacao();
        }
    });
}

// ==========================================
// TOGGLE NOTAS vs DEDOS no diagrama violão
// ==========================================
let modoNotas = false; // false = dedos, true = notas

function alternarModoNotas() {
    modoNotas = document.getElementById('toggleNotasDedos').checked;
    renderizarVisualizacao();
}

// Modificar criarSVGAcorde para usar modoNotas
const _criarSVGOrig = criarSVGAcorde;
criarSVGAcorde = function(nomeAcorde, escala, posicaoIdx) {
    escala = escala || 1;
    posicaoIdx = posicaoIdx || 0;
    const W=140, H=170, FRETS=7, ML=20, MT=30;  // FRETS=7 para mostrar até 7ª casa
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

    // Número da casa se barra > 1ª
    if (data.barra && data.barra.casa > 1) {
        const casaLabel = document.createElementNS("http://www.w3.org/2000/svg","text");
        casaLabel.setAttribute("x", W - ML + 4);
        casaLabel.setAttribute("y", MT + fretSp * 0.5);
        casaLabel.setAttribute("fill","#aaa"); casaLabel.setAttribute("font-size","10px");
        casaLabel.setAttribute("dominant-baseline","central");
        casaLabel.textContent = `${data.barra.casa}fr`;
        svg.appendChild(casaLabel);
    }

    // Pestana
    const nut = document.createElementNS("http://www.w3.org/2000/svg","line");
    nut.setAttribute("x1",ML); nut.setAttribute("y1",MT);
    nut.setAttribute("x2",W-ML); nut.setAttribute("y2",MT);
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

    // BARRA
    if (data.barra) {
        const xDe = ML + data.barra.de * strSp;
        const xAte = ML + data.barra.ate * strSp;
        const yBarra = MT + (1 - 0.5) * fretSp;
        const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
        rect.setAttribute("x", xDe - 6); rect.setAttribute("y", yBarra - 9);
        rect.setAttribute("width", (xAte - xDe) + 12); rect.setAttribute("height", 18);
        rect.setAttribute("rx", 9); rect.setAttribute("fill", "#f1c40f");
        svg.appendChild(rect);
        if (escala >= 1) {
            const bt = document.createElementNS("http://www.w3.org/2000/svg","text");
            bt.setAttribute("x", (xDe+xAte)/2); bt.setAttribute("y", yBarra);
            bt.setAttribute("fill","#000"); bt.setAttribute("font-size","10px");
            bt.setAttribute("font-weight","bold"); bt.setAttribute("text-anchor","middle");
            bt.setAttribute("dominant-baseline","central");
            bt.textContent = "B"; svg.appendChild(bt);
        }
    }

    // Notas das cordas soltas — para mostrar nome
    const afinacao = ['E','B','G','D','A','E'];
    const notasCrom = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const tonicaMatch = nomeAcorde.match(/^([A-G][#b]?)/);
    const tonica = tonicaMatch ? tonicaMatch[1] : null;
    const pianoData = getPiano(nomeAcorde);

    // NOTAS E DEDOS
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
            const casaRel = data.barra ? casa - data.barra.casa + 1 : casa;
            if (casaRel < 1 || casaRel > FRETS) continue;
            const y = MT + (casaRel - 0.5) * fretSp;
            const cobertaPelaBarra = data.barra && dedo === 1 && casaRel === 1;
            if (!cobertaPelaBarra) {
                // Calcula a nota desta corda+casa para colorir
                const cordaAberta = afinacao[i];
                const cordaIdx = notasCrom.indexOf(cordaAberta);
                const notaNome = notasCrom[(cordaIdx + casa) % 12];
                const dot = document.createElementNS("http://www.w3.org/2000/svg","circle");
                dot.setAttribute("cx",x); dot.setAttribute("cy",y);
                dot.setAttribute("r","9"); dot.setAttribute("fill","#f1c40f");
                if (escala>=1) { dot.setAttribute("stroke","#d4a017"); dot.setAttribute("stroke-width","1"); }
                svg.appendChild(dot);

                // Texto: notas ou dedos
                const label = (modoNotas && escala >= 1) ? notaNome : (dedo !== null ? String(dedo) : '');
                if (label) {
                    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
                    t.setAttribute("x",x); t.setAttribute("y",y);
                    t.setAttribute("fill","#000");
                    t.setAttribute("font-size", modoNotas ? "9px" : "11px");
                    t.setAttribute("font-weight","bold"); t.setAttribute("text-anchor","middle");
                    t.setAttribute("dominant-baseline","central");
                    t.textContent = label; svg.appendChild(t);
                }
            }
        }
    }
    return svg;
};

// Mostrar toggle quando modo violão
const _mudarVisaoOrig = mudarVisaoDiagrama;
mudarVisaoDiagrama = function(visao) {
    visaoDiagramaAtual = visao;
    const tg = document.getElementById('tab-guitarra');
    const tt = document.getElementById('tab-teclado');
    if (tg) tg.classList.toggle('ativo', visao==='guitarra');
    if (tt) tt.classList.toggle('ativo', visao==='teclado');
    const toggleRow = document.getElementById('toggleRow');
    if (toggleRow) toggleRow.style.display = visao === 'guitarra' ? 'flex' : 'none';
    // Re-render current chord preserving the mode
    if (acordeAtualSelecionado) {
        _renderDiagramaComPosicao(acordeAtualSelecionado, posicaoAtual || 0);
    }
};

// ==========================================
// TECLADO COM CORES POR FUNÇÃO HARMÔNICA
// ==========================================
// Fórmulas: [tônica=0, terça(M=4/m=3), quinta=7, sétima=10/11, nona=14]
function getIntervaloNota(nomeAcorde, idxTeclado) {
    const match = nomeAcorde.match(/^([A-G][#b]?)/);
    if (!match) return 'outra';
    const eq = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
    const tonicaRaw = match[1];
    const tonica = eq[tonicaRaw] || tonicaRaw;
    const notasCrom = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const tonicaIdx = notasCrom.indexOf(tonica);
    const notaIdx = idxTeclado % 12;
    const intervalo = (notaIdx - tonicaIdx + 12) % 12;
    if (intervalo === 0) return 'tonica';
    if (intervalo === 3 || intervalo === 4) return 'terca';
    if (intervalo === 7) return 'quinta';
    if (intervalo === 10 || intervalo === 11) return 'setima';
    if (intervalo === 2 || intervalo === 14) return 'nona';
    return 'outra';
}

// Override desenharTecladoEm to add colors and legend
const _desenharTecladoEmOrig = desenharTecladoEm;
desenharTecladoEm = function(nomeAcorde, targetArea) {
    const piano = getPiano(nomeAcorde);
    if (!piano) {
        const p = document.createElement('p');
        p.className = 'diagrama-indisponivel';
        p.innerHTML = `Sem dados de teclado para <b>${nomeAcorde}</b>.`;
        targetArea.appendChild(p);
        return;
    }
    const notasAtivas = piano;
    const nomesBrancas = ["C","D","E","F","G","A","B","C","D","E","F","G","A","B"];
    const nomesPretas = {1:"C#",3:"D#",6:"F#",8:"G#",10:"A#",13:"C#",15:"D#",18:"F#",20:"G#",22:"A#"};
    const offsetPretas = [1,3,null,6,8,10,null,13,15,null,18,20,22,null];
    const total = 14;
    let counter = 0, posX = 0;
    const largura = 100/total;

    const wrapper = document.createElement('div');
    wrapper.className = 'teclado-wrapper';
    const teclado = document.createElement('div');
    teclado.className = 'teclado-container';

    for (let i=0; i<total; i++) {
        const branca = document.createElement('div');
        branca.className = 'tecla-branca';
        if (notasAtivas.includes(counter)) {
            const marca = document.createElement('div');
            const intervalo = getIntervaloNota(nomeAcorde, counter);
            marca.className = `marca-tecla ${intervalo}`;
            branca.appendChild(marca);
        }
        const lb = document.createElement('div');
        lb.className = 'nota-tecla-label';
        lb.textContent = nomesBrancas[i] || '';
        branca.appendChild(lb);
        teclado.appendChild(branca);

        if (offsetPretas[i] !== null && offsetPretas[i] !== undefined) {
            const preta = document.createElement('div');
            preta.className = 'tecla-preta';
            preta.style.left = `calc(${posX+largura}% - 8px)`;
            if (notasAtivas.includes(offsetPretas[i])) {
                const marca = document.createElement('div');
                const intervalo = getIntervaloNota(nomeAcorde, offsetPretas[i]);
                marca.className = `marca-tecla ${intervalo}`;
                preta.appendChild(marca);
            }
            const lp = document.createElement('div');
            lp.className = 'nota-tecla-label';
            lp.textContent = nomesPretas[offsetPretas[i]] || '';
            preta.appendChild(lp);
            teclado.appendChild(preta);
            counter += 2;
        } else { counter += 1; }
        posX += largura;
    }

    wrapper.appendChild(teclado);
    targetArea.appendChild(wrapper);

    // Legenda de cores
    const legenda = document.createElement('div');
    legenda.className = 'teclado-legenda';
    const items = [
        {cls:'tonica',nome:'Tônica',cor:'#e74c3c'},
        {cls:'terca',nome:'Terça',cor:'#3498db'},
        {cls:'quinta',nome:'Quinta',cor:'#2ecc71'},
        {cls:'setima',nome:'7ª',cor:'#f39c12'},
        {cls:'nona',nome:'9ª',cor:'#9b59b6'},
    ];
    // Mostra só os que existem no acorde
    const semitonsAcorde = piano.map(p => p % 12);
    items.filter(it => {
        if (it.cls === 'tonica') return true;
        if (it.cls === 'terca') return semitonsAcorde.some(s => s===3||s===4);
        if (it.cls === 'quinta') return semitonsAcorde.includes(7);
        if (it.cls === 'setima') return semitonsAcorde.some(s => s===10||s===11);
        if (it.cls === 'nona') return semitonsAcorde.some(s => s===2||s===14%12);
        return false;
    }).forEach(it => {
        legenda.innerHTML += `<span class="teclado-legenda-item">
            <span class="teclado-legenda-cor" style="background:${it.cor}"></span>${it.nome}
        </span>`;
    });
    targetArea.appendChild(legenda);
};

// ==========================================
// SUGESTÃO DE SOLO / IMPROVISAÇÃO
// ==========================================
let audioCtxSolo = null;
let soloTocando = false;
let soloTimeouts = [];

const escalasParaSolo = {
    maior: [
        { nome: 'Pentatônica Maior', formula: [0,2,4,7,9], desc: 'Alegre e brilhante' },
        { nome: 'Escala Maior', formula: [0,2,4,5,7,9,11], desc: 'Clássica e completa' },
        { nome: 'Mixolídio', formula: [0,2,4,5,7,9,10], desc: 'Blues e rock' },
    ],
    menor: [
        { nome: 'Pentatônica Menor', formula: [0,3,5,7,10], desc: 'Blues e emoção' },
        { nome: 'Menor Natural', formula: [0,2,3,5,7,8,10], desc: 'Melódica e sombria' },
        { nome: 'Menor Harmônica', formula: [0,2,3,5,7,8,11], desc: 'Dramática e intensa' },
        { nome: 'Dórico', formula: [0,2,3,5,7,9,10], desc: 'Jazz e funk' },
    ]
};

function mostrarSugestoesSolo(tonica, modo) {
    const container = document.getElementById('soloContainer');
    const escalasDiv = document.getElementById('soloEscalas');
    if (!container || !escalasDiv) return;

    const notasCrom = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const eq = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
    const tonicaNorm = eq[tonica] || tonica;
    const tonicaIdx = notasCrom.indexOf(tonicaNorm);
    const escalas = escalasParaSolo[modo] || escalasParaSolo.maior;

    escalasDiv.innerHTML = '';
    escalas.forEach(escala => {
        const notas = escala.formula.map(s => notasCrom[(tonicaIdx + s) % 12]);

        const row = document.createElement('div');
        row.className = 'solo-escala-row';

        // Header com nome e descrição
        const header = document.createElement('div');
        header.className = 'solo-escala-header';
        header.innerHTML = `
            <span class="solo-escala-nome">${escala.nome}</span>
            <span class="solo-escala-desc">${escala.desc}</span>
        `;
        row.appendChild(header);

        // Notas em chips horizontais
        const chipsDiv = document.createElement('div');
        chipsDiv.className = 'solo-notas-horizontal';
        notas.forEach((nota, i) => {
            const chip = document.createElement('span');
            chip.className = 'solo-nota-chip' + (i === 0 ? ' tonica' : '');
            chip.textContent = nota;
            chipsDiv.appendChild(chip);
        });
        row.appendChild(chipsDiv);
        escalasDiv.appendChild(row);
    });

    container.style.display = 'block';
}

// tocarEscala removido (botão de play eliminado)

// ==========================================
// GRAUS DO CAMPO HARMÔNICO
// ==========================================
const numeraisRomanos = ['I','II','III','IV','V','VI','VII'];
// Funções harmônicas: I=Tônica, II=Subdominante, III=Tônica, IV=Subdominante, V=Dominante, VI=Tônica, VII=Dominante
const funcaoGrau = {
    0: {nome:'Tônica',cls:'tonica-grau'},
    1: {nome:'Subdominante',cls:'subdominante-grau'},
    2: {nome:'Tônica',cls:'tonica-grau'},
    3: {nome:'Subdominante',cls:'subdominante-grau'},
    4: {nome:'Dominante',cls:'dominante-grau'},
    5: {nome:'Tônica',cls:'tonica-grau'},
    6: {nome:'Dominante',cls:'dominante-grau'},
};

function mostrarGraus(campo) {
    const container = document.getElementById('grausContainer');
    const grid = document.getElementById('grausGrid');
    if (!container || !grid) return;
    grid.innerHTML = '';
    campo.forEach((acorde, i) => {
        const item = document.createElement('div');
        const funcao = funcaoGrau[i];
        item.className = `grau-item ${funcao.cls}`;
        item.innerHTML = `
            <div class="grau-numeral">${numeraisRomanos[i]}</div>
            <div class="grau-acorde">${acorde}</div>
            <div class="grau-funcao">${funcao.nome.substring(0,3)}</div>
        `;
        item.onclick = () => {
            acordeAtualSelecionado = acorde;
            document.getElementById('chord-diagram-container').style.display = 'block';
            renderizarVisualizacao();
            document.getElementById('chord-diagram-container').scrollIntoView({behavior:'smooth',block:'nearest'});
        };
        grid.appendChild(item);
    });
    container.style.display = 'block';
}

// ==========================================
// PROGRESSÕES POR GÊNERO
// ==========================================
const progressoesPorGenero = {
    'Gospel': {cor:'#f1c40f', prog:[
        {nome:'I - IV - V - I',  acordes:['I','IV','V','I']},
        {nome:'I - VI - IV - V', acordes:['I','VI','IV','V']},
        {nome:'I - IV - I - V',  acordes:['I','IV','I','V']},
        {nome:'II - V - I',      acordes:['II','V','I']},
        {nome:'I - III - IV - V',acordes:['I','III','IV','V']},
    ]},
    'Pop/Rock': {cor:'#e74c3c', prog:[
        {nome:'I - V - VI - IV',  acordes:['I','V','VI','IV']},
        {nome:'I - IV - V',       acordes:['I','IV','V']},
        {nome:'VI - IV - I - V',  acordes:['VI','IV','I','V']},
        {nome:'I - VI - II - V',  acordes:['I','VI','II','V']},
    ]},
    'Blues': {cor:'#3498db', prog:[
        {nome:'12 Bar Blues', acordes:['I','I','I','I','IV','IV','I','I','V','IV','I','V']},
        {nome:'I - IV - V',   acordes:['I','IV','V']},
        {nome:'I7 - IV7 - V7',acordes:['I7','IV7','V7']},
    ]},
    'Bossa Nova': {cor:'#2ecc71', prog:[
        {nome:'IIM7 - V7 - IM7',   acordes:['IIM7','V7','IM7']},
        {nome:'I - VI - II - V',   acordes:['I','VI','II','V']},
        {nome:'IM7 - IVM7 - IIM7 - V7', acordes:['IM7','IVM7','IIM7','V7']},
    ]},
    'Samba': {cor:'#e67e22', prog:[
        {nome:'I - IV - V - I', acordes:['I','IV','V','I']},
        {nome:'I - II - V - I', acordes:['I','II','V','I']},
        {nome:'VIM - II - V - I',acordes:['VIM','II','V','I']},
    ]},
    'Jazz': {cor:'#9b59b6', prog:[
        {nome:'II - V - I',      acordes:['IIm7','V7','IM7']},
        {nome:'I - VI - II - V', acordes:['IM7','VIm7','IIm7','V7']},
        {nome:'Ritmo de Coltrane',acordes:['IM7','bIIIM7','bVIM7','bVIIM7']},
    ]},
};

let generoAtivo = 'Gospel';
let campoHarmonicoAtual = [];
let tonicaAtual = 'C';

function inicializarProgressoes() {
    const tabs = document.getElementById('generoTabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    Object.entries(progressoesPorGenero).forEach(([nome, data]) => {
        const btn = document.createElement('button');
        btn.className = 'genero-btn' + (nome === generoAtivo ? ' ativo' : '');
        btn.style.background = nome === generoAtivo ? data.cor : '';
        btn.textContent = nome;
        btn.onclick = () => {
            generoAtivo = nome;
            document.querySelectorAll('.genero-btn').forEach(b => {
                b.classList.remove('ativo');
                b.style.background = '';
            });
            btn.classList.add('ativo');
            btn.style.background = data.cor;
            renderizarProgressoes();
        };
        tabs.appendChild(btn);
    });
    renderizarProgressoes();
    document.getElementById('progressoesContainer').style.display = 'block';
}

function grauParaAcorde(grauStr, campo) {
    // Mapeia numeral romano para acorde do campo
    const mapa = {
        'I':campo[0],'II':campo[1],'III':campo[2],'IV':campo[3],
        'V':campo[4],'VI':campo[5],'VII':campo[6],
        'IIM7': campo[1]?.replace('m','') + 'M7' || '',
        'IVM7': campo[3]?.replace('m','') + 'M7' || '',
        'IM7':  campo[0] + 'M7',
        'IIm7': campo[1] + '7',
        'VIm7': campo[5] + '7',
        'V7':   campo[4]?.replace('dim','') + '7',
        'IV7':  campo[3] + '7',
        'I7':   campo[0] + '7',
        'IVM7': campo[3] + '7M',
        'VIM':  campo[5],
        'VIM7': campo[5] + '7',
    };
    return mapa[grauStr] || grauStr;
}

function renderizarProgressoes() {
    const lista = document.getElementById('progressoesLista');
    if (!lista) return;
    lista.innerHTML = '';
    const generoData = progressoesPorGenero[generoAtivo];
    const campo = campoHarmonicoAtual;

    generoData.prog.forEach(prog => {
        const row = document.createElement('div');
        row.className = 'progressao-row';

        const nome = document.createElement('div');
        nome.className = 'progressao-nome';
        nome.textContent = prog.nome;

        const acordesDiv = document.createElement('div');
        acordesDiv.className = 'progressao-acordes';

        const acordesReais = prog.acordes.map(g => campo.length > 0 ? (grauParaAcorde(g, campo) || g) : g);
        acordesReais.forEach(a => {
            const chip = document.createElement('span');
            chip.className = 'prog-acorde-chip';
            chip.textContent = a;
            acordesDiv.appendChild(chip);
        });

        const btn = document.createElement('button');
        btn.className = 'btn-usar-progressao';
        btn.textContent = '← Usar';
        btn.onclick = (e) => {
            e.stopPropagation();
            // Preenche o campo
            const input = document.getElementById('inputAcordes');
            if (input) {
                input.value = acordesReais.join(', ');
                // Scroll suave até o identificador
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Destaca o input brevemente
                input.style.borderColor = 'var(--accent)';
                input.style.boxShadow = '0 0 8px var(--accent)';
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, 1000);
            }
            // Dispara o identificador automaticamente
            identificarTom();
        };

        row.appendChild(nome);
        row.appendChild(acordesDiv);
        row.appendChild(btn);
        lista.appendChild(row);
    });
}

// ==========================================
// MODO PERFORMANCE
// ==========================================
let fonteSizePerf = 18;

function abrirModoPerformance() {
    const cifraSource = document.getElementById('cifraRenderizada');
    const perfEl = document.getElementById('perfCifra');
    const overlay = document.getElementById('modoPerformance');
    const tomEl = document.getElementById('perfTom');

    if (!cifraSource || !cifraSource.innerHTML.trim()) {
        alert('Renderize a cifra primeiro!');
        return;
    }

    // Copia o conteúdo renderizado para o modo performance
    perfEl.innerHTML = cifraSource.innerHTML;
    perfEl.style.fontSize = fonteSizePerf + 'px';

    // Mostra o tom atual se disponível
    const tomResultado = document.getElementById('resultado');
    if (tomResultado && tomResultado.style.display !== 'none') {
        const tomEl2 = tomResultado.querySelector('b');
        if (tomEl2) tomEl.textContent = '🎸 ' + tomEl2.textContent;
    }

    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
}

function fecharModoPerformance() {
    document.getElementById('modoPerformance').classList.remove('ativo');
    document.body.style.overflow = '';
}

function ajustarFontePerf(delta) {
    fonteSizePerf = Math.max(12, Math.min(48, fonteSizePerf + delta));
    document.getElementById('perfCifra').style.fontSize = fonteSizePerf + 'px';
}

function atualizarScrollPerf() {
    const el = document.getElementById('perfCifra');
    const prog = document.getElementById('perfScrollProgress');
    if (!el || !prog) return;
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
    prog.style.width = Math.min(100, pct) + '%';
}

// Fechar com ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModoPerformance();
});

// ==========================================
// EXPORTAR CIFRA COMO PDF
// ==========================================
function exportarPDF() {
    const cifraEl = document.getElementById('cifraRenderizada');
    if (!cifraEl || !cifraEl.innerHTML.trim()) {
        alert('Renderize a cifra primeiro!');
        return;
    }

    const tom = (() => {
        const r = document.getElementById('resultado');
        if (r && r.style.display !== 'none') {
            const b = r.querySelector('b');
            return b ? b.textContent : 'Cifra';
        }
        return 'Cifra';
    })();

    // Gera HTML limpo para impressão
    const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${tom}</title>
<style>
  body { font-family: 'Courier New', monospace; background: white; color: #111; padding: 20px 30px; font-size: 14px; line-height: 2; }
  h1 { font-family: Arial, sans-serif; color: #333; margin-bottom: 20px; font-size: 20px; }
  .cifra-linha-acordes { display: block; color: #c07800; font-weight: bold; white-space: pre; }
  .cifra-acorde-inline { color: #c07800; font-weight: bold; }
  .cifra-linha-letra { display: block; color: #111; white-space: pre; }
  .cifra-linha-vazia { display: block; height: 8px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>🎸 ${tom}</h1>
${cifraEl.innerHTML}
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Permita popups para exportar o PDF.'); return; }
    win.document.write(printHTML);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
}

// ==========================================
// DETECTOR DE ACORDE POR MICROFONE
// ==========================================
let detectorAtivo = false;
let detectorAudioCtx = null;
let detectorAnalyser = null;
let detectorStream = null;
let detectorAnimId = null;
const notasCromDetector = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Fórmulas para identificar acordes a partir de notas detectadas
const formulasDetector = {
    '':    [0,4,7],
    'm':   [0,3,7],
    '7':   [0,4,7,10],
    'm7':  [0,3,7,10],
    '7M':  [0,4,7,11],
    'dim': [0,3,6],
};

async function toggleDetectorAcorde() {
    const btn = document.getElementById('btnDetector');
    const container = document.getElementById('detectorContainer');

    if (detectorAtivo) {
        detectorAtivo = false;
        if (detectorStream) detectorStream.getTracks().forEach(t => t.stop());
        if (detectorAudioCtx) detectorAudioCtx.close();
        cancelAnimationFrame(detectorAnimId);
        btn.textContent = '🎸 Detectar Acorde';
        btn.classList.remove('ativo');
        container.style.display = 'none';
        return;
    }

    try {
        detectorStream = await navigator.mediaDevices.getUserMedia({audio:true});
        detectorAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        detectorAnalyser = detectorAudioCtx.createAnalyser();
        detectorAnalyser.fftSize = 8192;
        const src = detectorAudioCtx.createMediaStreamSource(detectorStream);
        src.connect(detectorAnalyser);

        detectorAtivo = true;
        btn.textContent = '■ Parar Detector';
        btn.classList.add('ativo');
        container.style.display = 'block';
        detectarAcordeContinuo();
    } catch(e) {
        alert('Erro ao acessar microfone: ' + e.message);
    }
}

const notasDetectadas = [];
const JANELA = 20; // frames de histórico

function detectarAcordeContinuo() {
    if (!detectorAtivo) return;

    const buf = new Float32Array(detectorAnalyser.fftSize);
    detectorAnalyser.getFloatFrequencyData(buf);
    const sr = detectorAudioCtx.sampleRate;
    const binSize = sr / detectorAnalyser.fftSize;

    // Pega os picos de frequência mais fortes
    const picos = [];
    for (let i = 1; i < buf.length - 1; i++) {
        const freq = i * binSize;
        if (freq < 60 || freq > 1400) continue;
        if (buf[i] > buf[i-1] && buf[i] > buf[i+1] && buf[i] > -50) {
            picos.push({freq, amp: buf[i]});
        }
    }

    // Ordena por amplitude e pega top 6
    picos.sort((a,b) => b.amp - a.amp);
    const topPicos = picos.slice(0, 6);

    // Converte frequências em notas
    const notasFrame = new Set();
    topPicos.forEach(p => {
        const midi = Math.round(12 * Math.log2(p.freq / 440) + 69);
        if (midi >= 40 && midi <= 88) {
            notasFrame.add(midi % 12);
        }
    });

    if (notasFrame.size >= 2) {
        notasDetectadas.push([...notasFrame]);
        if (notasDetectadas.length > JANELA) notasDetectadas.shift();
    }

    // Analisa as notas mais frequentes nos últimos frames
    if (notasDetectadas.length >= 5) {
        const freq = {};
        notasDetectadas.flat().forEach(n => freq[n] = (freq[n]||0) + 1);
        const notasFrequentes = Object.entries(freq)
            .filter(([,v]) => v >= notasDetectadas.length * 0.4)
            .map(([k]) => parseInt(k))
            .sort((a,b) => freq[b]-freq[a]);

        if (notasFrequentes.length >= 2) {
            const acorde = identificarAcordeDeNotas(notasFrequentes);
            if (acorde) {
                document.getElementById('detectorAcorde').textContent = acorde;
                document.getElementById('detectorNotas').textContent =
                    notasFrequentes.slice(0,4).map(n => notasCromDetector[n]).join(' · ');
                document.getElementById('detectorConfianca').textContent =
                    `${Math.min(99, Math.round(notasFrequentes.length / 6 * 100))}% confiança`;
            }
        }
    }

    detectorAnimId = requestAnimationFrame(detectarAcordeContinuo);
}

function identificarAcordeDeNotas(notas) {
    let melhorAcorde = null, melhorScore = 0;

    for (let tonica = 0; tonica < 12; tonica++) {
        for (const [sufixo, formula] of Object.entries(formulasDetector)) {
            const notasAcorde = formula.map(s => (tonica + s) % 12);
            const matches = notasAcorde.filter(n => notas.includes(n)).length;
            const score = matches / notasAcorde.length;
            if (score > melhorScore && score >= 0.6) {
                melhorScore = score;
                melhorAcorde = notasCromDetector[tonica] + sufixo;
            }
        }
    }
    return melhorAcorde;
}


// ==========================================
// NAVEGAÇÃO POR ABAS
// ==========================================
let telaAtiva = 'explorar';

function mudarTela(tela) {
    // Esconde todas as telas
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('ativa'));
    // Mostra a tela selecionada
    const telaEl = document.getElementById('tela-' + tela);
    const navEl = document.getElementById('nav-' + tela);
    if (telaEl) telaEl.classList.add('ativa');
    if (navEl) navEl.classList.add('ativa');
    telaAtiva = tela;
    // Inicializa se necessário
    if (tela === 'explorar' && !document.getElementById('circulo-svg-wrapper').children.length) {
        desenharCirculoDeQuintas();
    }
    if (tela === 'acorde') gerarSugestoesAcorde();
}

// ==========================================
// TELA ACORDE — BUSCA INDEPENDENTE
// ==========================================
// Acordes organizados por grupo
const acordesGrupos = [
    { label: 'Maiores',  acordes: ['C','D','E','F','G','A','B'] },
    { label: 'Menores',  acordes: ['Am','Bm','Cm','Dm','Em','Fm','Gm'] },
    { label: 'Dom 7',    acordes: ['C7','D7','E7','F7','G7','A7','B7'] },
    { label: 'Maj 7',    acordes: ['C7M','D7M','E7M','F7M','G7M','A7M','B7M'] },
    { label: 'Men 7',    acordes: ['Am7','Bm7','Cm7','Dm7','Em7','F#m7','Gm7'] },
    { label: 'C# / #',  acordes: ['C#','D#','F#','G#','A#','C#m','F#m','G#m','A#m'] },
];
const acordesMaisUsados = acordesGrupos.flatMap(g => g.acordes);

function gerarSugestoesAcorde() {
    const cont = document.getElementById('sugestoesAcorde');
    if (!cont || cont.children.length > 0) return;
    acordesGrupos.forEach(grupo => {
        // Label do grupo
        const lbl = document.createElement('div');
        lbl.style.cssText = 'width:100%;font-size:10px;font-weight:bold;color:var(--text-muted);margin:6px 0 2px;letter-spacing:1px;text-transform:uppercase;';
        lbl.textContent = grupo.label;
        cont.appendChild(lbl);
        // Botões do grupo
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;width:100%;';
        grupo.acordes.forEach(ac => {
            const btn = document.createElement('button');
            btn.className = 'botao-variacao ' + tipoAcorde(ac);
            btn.textContent = ac;
            btn.style.cssText = 'margin:0;';
            btn.onclick = () => {
                document.getElementById('inputBuscarAcorde').value = ac;
                mostrarAcordeBusca(ac);
            };
            row.appendChild(btn);
        });
        cont.appendChild(row);
    });
}

function buscarAcordeInput() {
    const val = document.getElementById('inputBuscarAcorde').value.trim();
    if (!val) return;
    // Normaliza
    const norm = val[0].toUpperCase() + val.slice(1);
    mostrarAcordeBusca(norm);
}

function mostrarAcordeBusca(nomeAcorde) {
    if (!nomeAcorde) return;

    // Highlight botão selecionado nas sugestões
    document.querySelectorAll('#sugestoesAcorde .botao-variacao').forEach(b => {
        b.classList.toggle('ativo', b.textContent === nomeAcorde);
    });

    // Garante que o container do diagrama está visível
    const viz = document.getElementById('acorde-viz-container');
    if (viz) viz.style.display = 'block';

    // Preserva a visão atual (não força violão)
    // Apenas garante que os tabs estão corretos visualmente
    const tg = document.getElementById('tab-guitarra');
    const tt = document.getElementById('tab-teclado');
    if (tg) tg.classList.toggle('ativo', visaoDiagramaAtual === 'guitarra');
    if (tt) tt.classList.toggle('ativo', visaoDiagramaAtual === 'teclado');
    const toggleRow = document.getElementById('toggleRow');
    if (toggleRow) toggleRow.style.display = visaoDiagramaAtual === 'guitarra' ? 'flex' : 'none';

    // Mostra diagrama
    acordeAtualSelecionado = nomeAcorde;
    posicaoAtual = 0;
    _renderDiagramaComPosicao(nomeAcorde, 0);

    // Deduz tom para o braço
    const match = nomeAcorde.match(/^([A-G][#b]?)/);
    if (match) {
        const tonica = match[1];
        const sufixo = nomeAcorde.slice(tonica.length);
        const ehMenor = /^m(?!a)/.test(sufixo) || /dim/.test(sufixo);
        const modo = ehMenor ? 'menor' : 'maior';
        tonicaBracoAtual = tonica;
        modoBracoAtual = modo;
        escalaBracoAtual = ehMenor ? 'penta_menor' : 'penta_maior';
        notasEscalaAtual = formulasEscalaBraco[escalaBracoAtual].map(
            s => notasCromaticas[(notasCromaticas.indexOf(tonica)+s)%12]
        );
        desenharBracoMelhorado();

        // Mostra o container do braço
        const fc = document.getElementById('fretboard-container');
        if (fc) fc.style.display = 'block';

        // Atualiza botões de escala na aba acorde
        document.querySelectorAll('#tela-acorde .escala-btn').forEach((b,i) => {
            b.classList.toggle('ativo', i === (ehMenor ? 1 : 0));
        });
    }
}

// ==========================================
// TELA EXPLORAR — INDEPENDENTE
// ==========================================
function explorarPorTom() {
    const val = document.getElementById('explorInputTom')?.value.trim();
    if (!val) return;
    // Tenta identificar o tom a partir dos acordes digitados
    const acordes = val.split(',').map(a => a.trim()).filter(Boolean);
    // Testa maior
    for (let i = 0; i < 12; i++) {
        const tonica = notasCromaticas[i];
        const campo = gerarCampoHarmonicoMaior(tonica);
        if (acordes.every(a => campo.map(c=>c.toLowerCase()).includes(a.toLowerCase()))) {
            explorarSelecionarTom(tonica, 'maior');
            return;
        }
    }
    // Testa menor
    for (let i = 0; i < 12; i++) {
        const tonica = notasCromaticas[i];
        const campo = gerarCampoHarmonicoMenor(tonica);
        if (acordes.every(a => campo.map(c=>c.toLowerCase()).includes(a.toLowerCase()))) {
            explorarSelecionarTom(tonica, 'menor');
            return;
        }
    }
}

// Override explorarSelecionarTom to use new HTML ids
const _explorarSelOrig = explorarSelecionarTom;
explorarSelecionarTom = function(tonica, modo) {
    explorTonicaAtual = tonica;
    const campo = modo === 'maior' ? gerarCampoHarmonicoMaior(tonica) : gerarCampoHarmonicoMenor(tonica);
    const label = tonica + ' ' + (modo === 'maior' ? 'Maior' : 'menor');

    // Atualiza input explorInputTom com somente a tônica clicada
    const inputExplor = document.getElementById('explorInputTom');
    if (inputExplor) inputExplor.value = tonica + (modo === 'menor' ? 'm' : '');

    // Atualiza label
    const lbl = document.getElementById('explorTomAtual');
    if (lbl) lbl.textContent = '🎵 ' + label;

    // Atualiza grade de acordes
    const grade = document.getElementById('explor-grade-acordes');
    if (grade) {
        grade.innerHTML = '';
        campo.forEach((ac, idx) => {
            const btn = document.createElement('button');
            btn.className = 'botao-variacao ' + tipoAcorde(ac);
            btn.textContent = ac;
            btn.onclick = () => {
                grade.querySelectorAll('.botao-variacao').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                explorarMostrarAcorde(ac);
            };
            if (idx === 0) { btn.classList.add('ativo'); explorarMostrarAcorde(ac); }
            grade.appendChild(btn);
        });
    }

    // Solo
    explorarMostrarSolo(tonica, modo);

    // Braço
    explorNotasAtual = formulasEscalaBraco[explorEscalaAtual].map(
        s => notasCromaticas[(notasCromaticas.indexOf(tonica)+s)%12]
    );
    explorarBraco();
};

// Override explorarMostrarAcorde to use new HTML id
explorarMostrarAcorde = function(nomeAcorde) {
    const nomeEl = document.getElementById('nomeAcordeDestaqueExplor');
    if (nomeEl) nomeEl.textContent = nomeAcorde;
    const area = document.getElementById('explor-acorde-visual');
    if (!area) return;
    area.innerHTML = '';
    if (explorTabAcordeAtual === 'violao') {
        area.appendChild(criarSVGAcorde(nomeAcorde, 1));
    } else {
        desenharTecladoEm(nomeAcorde, area);
    }
};

// Override explorarTabAcorde for new ids
explorarTabAcorde = function(tab) {
    explorTabAcordeAtual = tab;
    document.getElementById('explor-tab-v').classList.toggle('ativo', tab==='violao');
    document.getElementById('explor-tab-t').classList.toggle('ativo', tab==='teclado');
    const nome = document.getElementById('nomeAcordeDestaqueExplor')?.textContent;
    if (nome && nome !== '--') explorarMostrarAcorde(nome);
};

// Init on load
window.addEventListener('DOMContentLoaded', () => {
    initMetroVisual();
    gerarSugestoesAcorde();
    // Começa na aba Explorar
    mudarTela('explorar');
    setTimeout(() => desenharCirculoDeQuintas(), 150);
});

// ==========================================
// METRÔNOMO
// ==========================================
let metroBPM = 80;
let metroCompasso = 4;
let metroAtivo = false;
let metroBeatAtual = 0;
let metroIntervalId = null;
let metroAudioCtx = null;
let tapTempos = [];

function initMetroVisual() {
    const vis = document.getElementById('metroVisual');
    if (!vis) return;
    vis.innerHTML = '';
    for (let i = 0; i < metroCompasso; i++) {
        const beat = document.createElement('div');
        beat.className = 'metro-beat';
        beat.id = `metro-beat-${i}`;
        vis.appendChild(beat);
    }
}

function ajustarBPM(delta) {
    metroBPM = Math.max(40, Math.min(240, metroBPM + delta));
    document.getElementById('metroBPM').textContent = metroBPM;
    document.getElementById('metroBPMSlider').value = metroBPM;
    if (metroAtivo) { pararMetronomo(); iniciarMetronomo(); }
}

function setBPMSlider(val) {
    metroBPM = parseInt(val);
    document.getElementById('metroBPM').textContent = metroBPM;
    if (metroAtivo) { pararMetronomo(); iniciarMetronomo(); }
}

function setCompasso(n, btn) {
    metroCompasso = n;
    metroBeatAtual = 0;
    document.querySelectorAll('.metro-compasso-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    initMetroVisual();
    if (metroAtivo) { pararMetronomo(); iniciarMetronomo(); }
}

function toggleMetronomo() {
    if (metroAtivo) pararMetronomo(); else iniciarMetronomo();
}

function iniciarMetronomo() {
    metroAtivo = true;
    metroBeatAtual = 0;
    document.getElementById('btnMetronomo').textContent = '■ Parar';
    document.getElementById('btnMetronomo').classList.add('tocando');
    if (!metroAudioCtx) metroAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    initMetroVisual();
    const intervalo = (60 / metroBPM) * 1000;
    tocarBeat();
    metroIntervalId = setInterval(tocarBeat, intervalo);
}

function pararMetronomo() {
    metroAtivo = false;
    clearInterval(metroIntervalId);
    document.getElementById('btnMetronomo').textContent = '▶ Iniciar';
    document.getElementById('btnMetronomo').classList.remove('tocando');
    // Apaga todos os beats
    for (let i = 0; i < metroCompasso; i++) {
        const el = document.getElementById(`metro-beat-${i}`);
        if (el) el.className = 'metro-beat';
    }
}

function tocarBeat() {
    // Visual
    for (let i = 0; i < metroCompasso; i++) {
        const el = document.getElementById(`metro-beat-${i}`);
        if (!el) continue;
        el.className = 'metro-beat' + (i === metroBeatAtual ? (metroBeatAtual === 0 ? ' tempo' : ' ativo') : '');
    }
    // Som
    if (metroAudioCtx) {
        const osc = metroAudioCtx.createOscillator();
        const gain = metroAudioCtx.createGain();
        osc.connect(gain); gain.connect(metroAudioCtx.destination);
        osc.frequency.value = metroBeatAtual === 0 ? 1000 : 800; // tempo forte
        gain.gain.setValueAtTime(0.3, metroAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, metroAudioCtx.currentTime + 0.08);
        osc.start(); osc.stop(metroAudioCtx.currentTime + 0.08);
    }
    metroBeatAtual = (metroBeatAtual + 1) % metroCompasso;
}

// Tap Tempo
function tapTempo() {
    const agora = Date.now();
    tapTempos.push(agora);
    if (tapTempos.length > 8) tapTempos.shift();
    if (tapTempos.length < 2) return;
    // Remove taps muito antigos (>3s)
    tapTempos = tapTempos.filter(t => agora - t < 3000);
    if (tapTempos.length < 2) return;
    const intervals = [];
    for (let i = 1; i < tapTempos.length; i++) intervals.push(tapTempos[i] - tapTempos[i-1]);
    const mediaMs = intervals.reduce((a,b) => a+b, 0) / intervals.length;
    metroBPM = Math.round(60000 / mediaMs);
    metroBPM = Math.max(40, Math.min(240, metroBPM));
    document.getElementById('metroBPM').textContent = metroBPM;
    document.getElementById('metroBPMSlider').value = metroBPM;
}

// Init visual ao carregar
window.addEventListener('DOMContentLoaded', () => {
    initMetroVisual();
});

// ==========================================
// MODO EXPLORAÇÃO
// ==========================================
let explorEscalaAtual = 'penta_maior';
let explorTabAcordeAtual = 'violao';
let explorTonicaAtual = 'C';
let explorNotasAtual = [];

function abrirModoExploracao() {
    const overlay = document.getElementById('modoExploracao');
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
    // Desenha o círculo de quintas no modo exploração
    desenharCirculoExploracao();
    // Se já tem um tom identificado, usa ele
    const input = document.getElementById('inputAcordes');
    if (input && input.value) {
        document.getElementById('explorInput').value = input.value;
        explorarTom();
    }
}

function fecharModoExploracao() {
    document.getElementById('modoExploracao').classList.remove('ativo');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        fecharModoExploracao();
        fecharModoPerformance();
    }
});

function desenharCirculoExploracao() {
    const wrapper = document.getElementById('explor-circulo');
    if (!wrapper) return;
    // Cria versão menor do círculo (tamanho se adapta ao container)
    const SIZE = 300;
    const cx = SIZE/2, cy = SIZE/2;
    const RE = 138, RM = 96, RI = 55;
    const N = N_CIRCULO;
    const ang0 = -Math.PI/2;

    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute("width","100%");
    svg.setAttribute("height","100%");
    svg.style.maxWidth = "300px";

    const coresMaior = ["#c0392b","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db",
        "#2980b9","#9b59b6","#8e44ad","#d35400","#e74c3c","#27ae60"];

    function arco(ro, ri, i) {
        const g = 0.018;
        const a1 = ang0 + (i/N)*2*Math.PI + g;
        const a2 = ang0 + ((i+1)/N)*2*Math.PI - g;
        const x1=cx+ro*Math.cos(a1),y1=cy+ro*Math.sin(a1);
        const x2=cx+ro*Math.cos(a2),y2=cy+ro*Math.sin(a2);
        const x3=cx+ri*Math.cos(a2),y3=cy+ri*Math.sin(a2);
        const x4=cx+ri*Math.cos(a1),y4=cy+ri*Math.sin(a1);
        return `M${x1} ${y1} A${ro} ${ro} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 0 0 ${x4} ${y4}Z`;
    }
    function txtPos(r, i) {
        const a = ang0 + ((i+0.5)/N)*2*Math.PI;
        return {x: cx+r*Math.cos(a), y: cy+r*Math.sin(a)};
    }

    for (let i=0; i<N; i++) {
        const cor = coresMaior[i];
        // Maior
        const pm = document.createElementNS("http://www.w3.org/2000/svg","path");
        pm.setAttribute("d", arco(RE,RM,i));
        pm.setAttribute("fill", cor); pm.setAttribute("opacity","0.85");
        pm.setAttribute("cursor","pointer");
        pm.addEventListener("click", () => explorarSelecionarTom(circuloMaior[i],"maior"));
        svg.appendChild(pm);
        const tp = txtPos(RM+(RE-RM)/2, i);
        const tm = document.createElementNS("http://www.w3.org/2000/svg","text");
        tm.setAttribute("x",tp.x); tm.setAttribute("y",tp.y);
        tm.setAttribute("fill","#fff"); tm.setAttribute("font-size","12px");
        tm.setAttribute("font-weight","bold"); tm.setAttribute("text-anchor","middle");
        tm.setAttribute("dominant-baseline","central"); tm.setAttribute("pointer-events","none");
        tm.textContent = circuloMaior[i]; svg.appendChild(tm);
        // Menor
        const pn = document.createElementNS("http://www.w3.org/2000/svg","path");
        pn.setAttribute("d", arco(RM,RI,i));
        pn.setAttribute("fill", cor+"88"); pn.setAttribute("cursor","pointer");
        pn.addEventListener("click", () => explorarSelecionarTom(circuloMenor[i].replace("m",""),"menor"));
        svg.appendChild(pn);
        const tn2 = txtPos(RI+(RM-RI)/2, i);
        const tn = document.createElementNS("http://www.w3.org/2000/svg","text");
        tn.setAttribute("x",tn2.x); tn.setAttribute("y",tn2.y);
        tn.setAttribute("fill","#fff"); tn.setAttribute("font-size","9px");
        tn.setAttribute("font-weight","bold"); tn.setAttribute("text-anchor","middle");
        tn.setAttribute("dominant-baseline","central"); tn.setAttribute("pointer-events","none");
        tn.textContent = circuloMenor[i]; svg.appendChild(tn);
    }
    // Centro
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",cx); c.setAttribute("cy",cy); c.setAttribute("r",RI-2);
    c.setAttribute("fill","#1a1a24"); svg.appendChild(c);

    wrapper.innerHTML = '';
    wrapper.appendChild(svg);
}

function explorarSelecionarTom(tonica, modo) {
    explorTonicaAtual = tonica;
    const campo = modo === "maior" ? gerarCampoHarmonicoMaior(tonica) : gerarCampoHarmonicoMenor(tonica);
    const label = `${tonica} ${modo === "maior" ? "Maior" : "menor"}`;
    document.getElementById('explorTomLabel').textContent = `🎵 ${label}`;
    document.getElementById('explorInput').value = campo.slice(0,4).join(", ");
    // Mostra primeiro acorde do campo
    explorarMostrarAcorde(campo[0]);
    // Solo
    explorarMostrarSolo(tonica, modo);
    // Braço
    explorarNotasAtual = formulasEscalaBraco[explorEscalaAtual].map(s => notasCromaticas[(notasCromaticas.indexOf(tonica)+s)%12]);
    explorarBraco();
}

function explorarTom() {
    const val = document.getElementById('explorInput').value;
    if (!val.trim()) return;
    const acordes = val.split(',').map(a => a.trim()).filter(Boolean);
    if (acordes.length > 0) explorarMostrarAcorde(acordes[0]);
}

function explorarMostrarAcorde(nomeAcorde) {
    document.getElementById('explor-acorde-nome').textContent = nomeAcorde;
    const area = document.getElementById('explor-acorde-visual');
    area.innerHTML = '';
    if (explorTabAcordeAtual === 'violao') {
        area.appendChild(criarSVGAcorde(nomeAcorde, 1.2));
    } else {
        desenharTecladoEm(nomeAcorde, area);
    }
}

function explorarTabAcorde(tab) {
    explorTabAcordeAtual = tab;
    document.getElementById('explor-tab-violao').classList.toggle('ativo', tab==='violao');
    document.getElementById('explor-tab-teclado').classList.toggle('ativo', tab==='teclado');
    const nome = document.getElementById('explor-acorde-nome').textContent;
    if (nome) explorarMostrarAcorde(nome);
}

function explorarMostrarSolo(tonica, modo) {
    const soloDiv = document.getElementById('explor-solo');
    const notasCrom = notasCromaticas;
    const eq = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
    const tonicaNorm = eq[tonica]||tonica;
    const ti = notasCrom.indexOf(tonicaNorm);
    const escalas = escalasParaSolo[modo]||escalasParaSolo.maior;
    soloDiv.innerHTML = '';
    escalas.forEach(escala => {
        const notas = escala.formula.map(s => notasCrom[(ti+s)%12]);
        const row = document.createElement('div');
        row.className = 'solo-escala-row';
        row.style.marginBottom = '8px';
        row.innerHTML = `<div class="solo-escala-header">
            <span class="solo-escala-nome">${escala.nome}</span>
            <span class="solo-escala-desc">${escala.desc}</span>
        </div>
        <div class="solo-notas-horizontal">${notas.map((n,i) =>
            `<span class="solo-nota-chip${i===0?' tonica':''}">${n}</span>`).join('')}
        </div>`;
        soloDiv.appendChild(row);
    });
}

function explorarEscala(escala, btn) {
    explorEscalaAtual = escala;
    document.querySelectorAll('#modoExploracao .escala-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    if (explorTonicaAtual) {
        explorNotasAtual = formulasEscalaBraco[escala].map(s => notasCromaticas[(notasCromaticas.indexOf(explorTonicaAtual)+s)%12]);
        explorarBraco();
    }
}

function explorarBraco() {
    const fretboard = document.getElementById('explor-fretboard');
    if (!fretboard) return;
    const instrumento = document.getElementById('explorInstrumento').value;
    fretboard.innerHTML = '';
    const afinacao = instrumento === 'guitarra' ? ['E','B','G','D','A','E'] : ['G','D','A','E'];
    const espessuras = instrumento === 'guitarra' ? [1,1.5,2,2.5,3,3.5] : [1.5,2,2.5,3];

    for (let c=0; c<afinacao.length; c++) {
        const cordaDiv = document.createElement('div');
        cordaDiv.className = 'corda';
        cordaDiv.style.setProperty('--corda-espessura', espessuras[c]+'px');
        let ni = notasCromaticas.indexOf(afinacao[c]);
        for (let t=0; t<=12; t++) {
            const td = document.createElement('div');
            td.className = 'traste';
            if (t===0) {
                td.classList.add('corda-solta');
                const nc = document.createElement('div');
                nc.className = 'nome-corda-solta';
                nc.textContent = afinacao[c];
                td.appendChild(nc);
            }
            if (t===1) td.classList.add('pestana');
            if (t>0&&[3,5,7,9,12].includes(t)&&c===Math.floor((afinacao.length-1)/2)) {
                const m = document.createElement('div'); m.className='marcador-fundo'; td.appendChild(m);
            }
            const nota = notasCromaticas[(ni+t)%12];
            if (explorNotasAtual.includes(nota)) {
                const b = document.createElement('div');
                b.className = (t===0?'bolinha-nota nota-solta-destaque':'bolinha-nota') + (nota===explorTonicaAtual?' tonica':'');
                b.textContent = nota;
                td.appendChild(b);
            }
            cordaDiv.appendChild(td);
        }
        fretboard.appendChild(cordaDiv);
    }
    const reg = document.createElement('div'); reg.className='regua-casas';
    for (let t=0; t<=12; t++) {
        const n = document.createElement('div'); n.className='numero-casa';
        if(t===0) n.classList.add('corda-solta-num');
        else { n.textContent=t; if([3,5,7,9,12].includes(t)) n.style.color='#c8a850'; }
        reg.appendChild(n);
    }
    fretboard.appendChild(reg);
}
