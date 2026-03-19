// Memória do app para guardar as notas atuais quando trocarmos de instrumento
let notasEscalaAtual = []; 

function identificarTom() {
    const input = document.getElementById('inputAcordes').value;
    const acordesDigitados = input.split(',').map(acorde => acorde.trim().toUpperCase()).filter(a => a !== "");
    const resultadoDiv = document.getElementById('resultado');

    if (acordesDigitados.length === 0) {
        resultadoDiv.innerHTML = "Por favor, digite os acordes.";
        return;
    }

    const dicionarioMusical = {
        "Dó Maior (C)": {
            campo: ["C", "DM", "EM", "F", "G", "AM", "BDIM"],
            penta: "C, D, E, G, A (Penta Maior) <br> A, C, D, E, G (Penta Menor)",
            passagem: "E7 (para cair no Am), A7 (para cair no Dm)",
            notasPenta: ["C", "D", "E", "G", "A"]
        },
        "Ré Maior (D)": {
            campo: ["D", "EM", "F#M", "G", "A", "BM", "C#DIM"],
            penta: "D, E, F#, A, B (Penta Maior) <br> B, D, E, F#, A (Penta Menor)",
            passagem: "F#7 (para cair no Bm), B7 (para cair no Em)",
            notasPenta: ["D", "E", "F#", "A", "B"]
        },
        "Mi Maior (E)": {
            campo: ["E", "F#M", "G#M", "A", "B", "C#M", "D#DIM"],
            penta: "E, F#, G#, B, C# (Penta Maior) <br> C#, E, F#, G#, B (Penta Menor)",
            passagem: "G#7 (para cair no C#m), C#7 (para cair no F#m)",
            notasPenta: ["E", "F#", "G#", "B", "C#"]
        },
        "Sol Maior (G)": {
            campo: ["G", "AM", "BM", "C", "D", "EM", "F#DIM"],
            penta: "G, A, B, D, E (Penta Maior) <br> E, G, A, B, D (Penta Menor)",
            passagem: "B7 (para cair no Em), E7 (para cair no Am)",
            notasPenta: ["G", "A", "B", "D", "E"]
        },
        "Lá Maior (A)": {
            campo: ["A", "BM", "C#M", "D", "E", "F#M", "G#DIM"],
            penta: "A, B, C#, E, F# (Penta Maior) <br> F#, A, B, C#, E (Penta Menor)",
            passagem: "C#7 (para cair no F#m), F#7 (para cair no Bm)",
            notasPenta: ["A", "B", "C#", "E", "F#"]
        }
    };

    let tomEncontrado = null;

    for (const [tom, dados] of Object.entries(dicionarioMusical)) {
        const pertenceAoTom = acordesDigitados.every(acorde => dados.campo.includes(acorde));
        
        if (pertenceAoTom) {
            tomEncontrado = { nome: tom, ...dados };
            break; 
        }
    }

    if (tomEncontrado) {
        resultadoDiv.innerHTML = `
            <div style="color: #4CAF50; font-size: 18px; margin-bottom: 15px;">
                🎵 A música está em: <br><b>${tomEncontrado.nome}</b>
            </div>
            <div style="font-size: 14px; text-align: left; background: #444; padding: 12px; border-radius: 5px; color: #ddd;">
                <p style="margin-top: 0;"><b>🎸 Escalas Pentatônicas:</b><br> ${tomEncontrado.penta}</p>
                <hr style="border: 0; border-top: 1px solid #555; margin: 10px 0;">
                <p style="margin-bottom: 0;"><b>🛤️ Acordes de Passagem:</b><br> ${tomEncontrado.passagem}</p>
            </div>
        `;
        
        notasEscalaAtual = tomEncontrado.notasPenta;
        desenharBraco(); 

        // NOVO: Chama a geração de variações para o tom encontrado
        gerarBotoesDeVariacao(tomEncontrado.nome);

    } else {
        resultadoDiv.innerHTML = "Tom não identificado com precisão. Verifique se digitou corretamente.";
        document.getElementById('fretboard-container').style.display = 'none';
        document.getElementById('variacoes-container').style.display = 'none';
        document.getElementById('chord-diagram-container').style.display = 'none';
        notasEscalaAtual = []; 
    }
}

function atualizarBraco() {
    if (notasEscalaAtual.length > 0) {
        desenharBraco();
    }
}

// === ALTERAÇÃO: Lógica do braço repensada para Casas e Pestanas ===
function desenharBraco() {
    const fretboard = document.getElementById('fretboard');
    const instrumento = document.getElementById('seletorInstrumento').value;
    fretboard.innerHTML = ''; 
    
    const notasCromaticas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    let afinacaoCordas = [];
    if (instrumento === 'guitarra') {
        afinacaoCordas = ['E', 'B', 'G', 'D', 'A', 'E']; 
    } else if (instrumento === 'baixo') {
        afinacaoCordas = ['G', 'D', 'A', 'E']; 
    }

    for (let c = 0; c < afinacaoCordas.length; c++) {
        const cordaDiv = document.createElement('div');
        cordaDiv.className = 'corda';
        
        let notaAtualIndex = notasCromaticas.indexOf(afinacaoCordas[c]);
        
        // Loop até casa 12 (0 é a corda solta)
        for (let t = 0; t <= 12; t++) {
            const trasteDiv = document.createElement('div');
            trasteDiv.className = 'traste';
            
            // Adiciona classes específicas para a corda solta e a pestana
            if (t === 0) trasteDiv.classList.add('corda-solta');
            if (t === 1) trasteDiv.classList.add('pestana');

            // Adiciona marcação (inlay/bolinha do braço) no fundo das casas 3, 5, 7, 9, 12
            if (t > 0 && [3, 5, 7, 9, 12].includes(t)) {
                // Posiciona a bolinha aproximadamente na corda do meio
                const cordaMeio = Math.floor((afinacaoCordas.length - 1) / 2);
                if (c === cordaMeio) {
                    const marcador = document.createElement('div');
                    marcador.className = 'marcador-fundo';
                    trasteDiv.appendChild(marcador);
                }
            }
            
            const notaDoTraste = notasCromaticas[(notaAtualIndex + t) % 12];
            
            if (notasEscalaAtual.includes(notaDoTraste)) {
                // Cordas soltas ganham um visual levemente diferente (opcional via CSS)
                const classeNota = t === 0 ? 'bolinha-nota nota-solta-destaque' : 'bolinha-nota';
                trasteDiv.innerHTML += `<div class="${classeNota}">${notaDoTraste}</div>`;
            }
            
            cordaDiv.appendChild(trasteDiv);
        }
        fretboard.appendChild(cordaDiv);
    }
    
    // === Adicionando a Régua de Números das Casas ===
    const reguaDiv = document.createElement('div');
    reguaDiv.className = 'regua-casas';
    for (let t = 0; t <= 12; t++) {
        const numDiv = document.createElement('div');
        numDiv.className = 'numero-casa';
        if (t === 0) {
            numDiv.classList.add('corda-solta-num'); // Espaço vazio antes do braço
        } else {
            numDiv.innerText = t; // Imprime o número da casa
        }
        reguaDiv.appendChild(numDiv);
    }
    fretboard.appendChild(reguaDiv);
    
    document.getElementById('fretboard-container').style.display = 'block';
}

// ==========================================
// MÓDULO HARD: DETECTOR DE PITCH (VOZ/VIOLÃO) (MANTIDO INTACTO)
// ==========================================
let audioContext;
let analyser;
let microphone;
let isListening = false;
let animationId;

const notasStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

async function iniciarAfinador() {
    const btn = document.getElementById('btnAfinador');
    const displayNota = document.getElementById('notaDetectada');
    const displayFreq = document.getElementById('frequenciaDetectada');

    if (isListening) {
        isListening = false;
        audioContext.close();
        cancelAnimationFrame(animationId);
        btn.innerText = "Ligar Microfone";
        btn.style.backgroundColor = "#e67e22";
        displayNota.innerText = "--";
        displayFreq.innerText = "-- Hz";
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; 
        
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isListening = true;
        btn.innerText = "Desligar Microfone";
        btn.style.backgroundColor = "#e74c3c"; 
        
        detectarPitch();
    } catch (err) {
        alert("Erro ao acessar o microfone. O navegador pode ter bloqueado a permissão.");
        console.error(err);
    }
}

function autoCorrelate(buf, sampleRate) {
    let SIZE = buf.length;
    let rms = 0;
    
    for (let i = 0; i < SIZE; i++) {
        let val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; 

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
        for (let j = 0; j < SIZE - i; j++)
            c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function notaDeFrequencia(frequencia) {
    const notaNum = 12 * (Math.log(frequencia / 440) / Math.log(2));
    return Math.round(notaNum) + 69;
}

function detectarPitch() {
    if (!isListening) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    
    const frequencia = autoCorrelate(buffer, audioContext.sampleRate);

    if (frequencia !== -1) {
        const notaIndex = notaDeFrequencia(frequencia);
        const notaNome = notasStrings[notaIndex % 12];
        
        document.getElementById('notaDetectada').innerText = notaNome;
        document.getElementById('frequenciaDetectada').innerText = Math.round(frequencia) + " Hz";
    }

    animationId = requestAnimationFrame(detectarPitch);
}


// ==========================================
// NOVO MÓDULO: VARIAÇÕES E DIAGRAMAS DE ACORDE
// ==========================================

// Banco de Acordes: Contém os acordes disponíveis para cada tom e seus shapes
const bancoDeAcordes = {
    "Dó Maior (C)": ["C", "C7M", "C9", "F", "F7M", "G", "G7"],
    "Ré Maior (D)": ["D", "D7M", "D9", "G", "G7M", "A", "A7"],
    "Mi Maior (E)": ["E", "E7M", "E9", "A", "A7M", "B", "B7"],
    "Sol Maior (G)": ["G", "G7M", "G9", "C", "C7M", "D", "D7"],
    "Lá Maior (A)": ["A", "A7M", "A9", "D", "D7M", "E", "E7"]
};

// Banco de Shapes: [Corda 6, Corda 5, Corda 4, Corda 3, Corda 2, Corda 1]
// null = Corda Abafada (X), 0 = Corda Solta (O), número = Casa
const shapesGuitarra = {
    // Acordes Básicos
    "C": [null, 3, 2, 0, 1, 0],
    "D": [null, null, 0, 2, 3, 2],
    "E": [0, 2, 2, 1, 0, 0],
    "F": [1, 3, 3, 2, 1, 1], // Pestana básica
    "G": [3, 2, 0, 0, 0, 3],
    "A": [null, 0, 2, 2, 2, 0],
    "B": [null, 2, 4, 4, 4, 2],

    // Algumas variações de C (Dó)
    "C7M": [null, 3, 2, 0, 0, 0],
    "C9": [null, 3, 2, 0, 3, 0], // C add9 comum
    
    // Algumas variações de G (Sol)
    "G7": [3, 2, 0, 0, 0, 1],
    "G7M": [3, null, 0, 0, 0, 2],
    "G9": [3, null, 0, 2, 0, 3],

    // Adicione mais shapes conforme necessário!
};

// 1. Gera os botões de variação baseados no tom encontrado
function gerarBotoesDeVariacao(nomeDoTom) {
    const container = document.getElementById('variacoes-container');
    const grade = document.getElementById('gradeVariacoes');
    
    grade.innerHTML = ''; // Limpa botões antigos

    const acordesParaMostrar = bancoDeAcordes[nomeDoTom];

    if (!acordesParaMostrar) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    acordesParaMostrar.forEach((acorde, index) => {
        const btn = document.createElement('button');
        btn.className = 'botao-variacao';
        btn.innerText = acorde;
        
        btn.onclick = () => {
            // Remove a classe 'ativo' de todos os botões e adiciona neste
            document.querySelectorAll('.botao-variacao').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            
            // Desenha o diagrama
            desenharDiagramaAcorde(acorde);
        };

        grade.appendChild(btn);

        // Desenha o primeiro acorde da lista por padrão
        if (index === 0) {
            btn.classList.add('ativo');
            desenharDiagramaAcorde(acorde);
        }
    });
}

// 2. Desenha o diagrama em SVG
function desenharDiagramaAcorde(nomeAcorde) {
    const container = document.getElementById('chord-diagram-container');
    const nomeDiv = document.getElementById('nomeAcordeDestaque');
    const svgArea = document.getElementById('chord-svg-area');
    
    svgArea.innerHTML = '';
    
    const shape = shapesGuitarra[nomeAcorde];
    
    if (!shape) {
        container.style.display = 'none';
        console.log(`Shape para ${nomeAcorde} não cadastrado no banco.`);
        return; 
    }
    
    nomeDiv.innerText = nomeAcorde;
    container.style.display = 'block';

    const width = 140;   
    const height = 160;  
    const strings = 6;   
    const frets = 5;     
    
    const marginTop = 25;
    const marginLeft = 20;
    const stringSpacing = (width - 2 * marginLeft) / (strings - 1);
    const fretSpacing = (height - marginTop - 10) / frets;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("class", "chord-svg");

    const nut = document.createElementNS("http://www.w3.org/2000/svg", "line");
    nut.setAttribute("x1", marginLeft);
    nut.setAttribute("y1", marginTop);
    nut.setAttribute("x2", width - marginLeft);
    nut.setAttribute("y2", marginTop);
    nut.setAttribute("class", "chord-nut");
    svg.appendChild(nut);

    for (let i = 1; i <= frets; i++) {
        const y = marginTop + i * fretSpacing;
        const fretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        fretLine.setAttribute("x1", marginLeft);
        fretLine.setAttribute("y1", y);
        fretLine.setAttribute("x2", width - marginLeft);
        fretLine.setAttribute("y2", y);
        fretLine.setAttribute("class", "chord-fret");
        svg.appendChild(fretLine);
    }

    for (let i = 0; i < strings; i++) {
        const x = marginLeft + i * stringSpacing;
        const stringLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        stringLine.setAttribute("x1", x);
        stringLine.setAttribute("y1", marginTop);
        stringLine.setAttribute("x2", x);
        stringLine.setAttribute("y2", height - 10);
        stringLine.setAttribute("class", "chord-string");
        svg.appendChild(stringLine);
    }

    const dedosUsados = { 1: false, 2: false, 3: false, 4: false };

    for (let i = 0; i < strings; i++) {
        const casa = shape[i];
        const x = marginLeft + i * stringSpacing;

        if (casa === null || casa === 0) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", marginTop - 8);
            text.setAttribute("class", "chord-top-text");
            text.textContent = casa === null ? "X" : "O";
            svg.appendChild(text);
        }
        else if (casa > 0) {
            const y = marginTop + (casa - 0.5) * fretSpacing; 
            
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);
            dot.setAttribute("r", 9); 
            dot.setAttribute("class", "chord-dot");
            svg.appendChild(dot);

            // Lógica simples para os números dos dedos (apenas para efeito visual no momento)
            let numeroDedo = "";
            if (casa === 1 && !dedosUsados[1]) { numeroDedo = "1"; dedosUsados[1] = true; }
            else if (casa === 2 && !dedosUsados[2]) { numeroDedo = "2"; dedosUsados[2] = true; }
            else if (casa === 3 && !dedosUsados[3]) { numeroDedo = "3"; dedosUsados[3] = true; }
            else if (casa > 3) { numeroDedo = "4"; }
            
            const fingerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            fingerText.setAttribute("x", x);
            fingerText.setAttribute("y", y);
            fingerText.setAttribute("class", "chord-dot-text");
            fingerText.textContent = numeroDedo;
            svg.appendChild(fingerText);
        }
    }

    svgArea.appendChild(svg);
}