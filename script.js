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

        // Chama a geração de variações para o tom encontrado
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

// === Lógica do braço repensada para Casas e Pestanas ===
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
// MÓDULO HARD: DETECTOR DE PITCH (VOZ/VIOLÃO)
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
// NOVO MÓDULO: VARIAÇÕES E DIAGRAMAS DE ACORDE (VIOLÃO E TECLADO)
// ==========================================

const bancoDeAcordes = {
    "Dó Maior (C)": ["C", "C7M", "C9", "F", "F7M", "G", "G7"],
    "Ré Maior (D)": ["D", "D7M", "D9", "G", "G7M", "A", "A7"],
    "Mi Maior (E)": ["E", "E7M", "E9", "A", "A7M", "B", "B7"],
    "Sol Maior (G)": ["G", "G7M", "G9", "C", "C7M", "D", "D7"],
    "Lá Maior (A)": ["A", "A7M", "A9", "D", "D7M", "E", "E7"]
};

// Banco de Shapes super completo!
// g_frets: [Corda6, Corda5, Corda4, Corda3, Corda2, Corda1] (null = X, 0 = Solta)
// g_fingers: Dedos correspondentes [6, 5, 4, 3, 2, 1]
// piano: Posições das teclas a partir do primeiro Dó (0 a 23)
const dicionarioShapes = {
    "C":   { g_frets: [null, 3, 2, 0, 1, 0], g_fingers: [null, 3, 2, null, 1, null], piano: [0, 4, 7] },
    "C7M": { g_frets: [null, 3, 2, 0, 0, 0], g_fingers: [null, 3, 2, null, null, null], piano: [0, 4, 7, 11] },
    "C9":  { g_frets: [null, 3, 2, 3, 3, null], g_fingers: [null, 2, 1, 3, 4, null], piano: [0, 4, 7, 10, 14] },
    
    "D":   { g_frets: [null, null, 0, 2, 3, 2], g_fingers: [null, null, null, 1, 3, 2], piano: [2, 6, 9] },
    "D7M": { g_frets: [null, null, 0, 2, 2, 2], g_fingers: [null, null, null, 1, 2, 3], piano: [2, 6, 9, 13] },
    "D9":  { g_frets: [null, 5, 4, 5, 5, null], g_fingers: [null, 2, 1, 3, 4, null], piano: [2, 6, 9, 12, 16] },
    "D7":  { g_frets: [null, null, 0, 2, 1, 2], g_fingers: [null, null, null, 2, 1, 3], piano: [2, 6, 9, 12] },
    
    "E":   { g_frets: [0, 2, 2, 1, 0, 0], g_fingers: [null, 2, 3, 1, null, null], piano: [4, 8, 11] },
    "E7M": { g_frets: [0, 2, 1, 1, 0, 0], g_fingers: [null, 3, 1, 2, null, null], piano: [4, 8, 11, 15] },
    "E9":  { g_frets: [0, 2, 0, 1, 0, 2], g_fingers: [null, 2, null, 1, null, 4], piano: [4, 8, 11, 14, 18] },
    "E7":  { g_frets: [0, 2, 0, 1, 0, 0], g_fingers: [null, 2, null, 1, null, null], piano: [4, 8, 11, 14] },
    
    "F":   { g_frets: [1, 3, 3, 2, 1, 1], g_fingers: [1, 3, 4, 2, 1, 1], piano: [5, 9, 12] },
    "F7M": { g_frets: [null, null, 3, 2, 1, 0], g_fingers: [null, null, 3, 2, 1, null], piano: [5, 9, 12, 16] },
    
    "G":   { g_frets: [3, 2, 0, 0, 0, 3], g_fingers: [2, 1, null, null, null, 3], piano: [7, 11, 14] },
    "G7M": { g_frets: [3, null, 0, 0, 0, 2], g_fingers: [2, null, null, null, null, 1], piano: [7, 11, 14, 18] },
    "G9":  { g_frets: [3, null, 0, 2, 0, 3], g_fingers: [2, null, null, 1, null, 3], piano: [7, 11, 14, 17, 21] },
    "G7":  { g_frets: [3, 2, 0, 0, 0, 1], g_fingers: [3, 2, null, null, null, 1], piano: [7, 11, 14, 17] },
    
    "A":   { g_frets: [null, 0, 2, 2, 2, 0], g_fingers: [null, null, 1, 2, 3, null], piano: [9, 13, 16] },
    "A7M": { g_frets: [null, 0, 2, 1, 2, 0], g_fingers: [null, null, 3, 1, 2, null], piano: [9, 13, 16, 20] },
    "A9":  { g_frets: [null, 0, 2, 0, 0, 0], g_fingers: [null, null, 2, null, null, null], piano: [9, 13, 16, 19, 23] },
    "A7":  { g_frets: [null, 0, 2, 0, 2, 0], g_fingers: [null, null, 2, null, 3, null], piano: [9, 13, 16, 19] },
    
    "B":   { g_frets: [null, 2, 4, 4, 4, 2], g_fingers: [null, 1, 2, 3, 4, 1], piano: [11, 15, 18] },
    "B7":  { g_frets: [null, 2, 1, 2, 0, 2], g_fingers: [null, 2, 1, 3, null, 4], piano: [11, 15, 18, 21] }
};

let acordeAtualSelecionado = "";
let visaoDiagramaAtual = "guitarra"; // pode ser "guitarra" ou "teclado"

function gerarBotoesDeVariacao(nomeDoTom) {
    const container = document.getElementById('variacoes-container');
    const grade = document.getElementById('gradeVariacoes');
    grade.innerHTML = ''; 

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
            document.querySelectorAll('.botao-variacao').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            acordeAtualSelecionado = acorde;
            renderizarVisualizacao();
        };

        grade.appendChild(btn);

        if (index === 0) {
            btn.classList.add('ativo');
            acordeAtualSelecionado = acorde;
            renderizarVisualizacao();
        }
    });
}

function mudarVisaoDiagrama(visao) {
    visaoDiagramaAtual = visao;
    
    // Atualiza os botões (TABS)
    document.getElementById('tab-guitarra').classList.remove('ativo');
    document.getElementById('tab-teclado').classList.remove('ativo');
    document.getElementById(`tab-${visao}`).classList.add('ativo');
    
    renderizarVisualizacao();
}

function renderizarVisualizacao() {
    if (visaoDiagramaAtual === 'guitarra') {
        desenharDiagramaAcorde(acordeAtualSelecionado);
    } else {
        desenharTeclado(acordeAtualSelecionado);
    }
}

// ==========================================
// DESENHO DO VIOLÃO
// ==========================================
function desenharDiagramaAcorde(nomeAcorde) {
    const container = document.getElementById('chord-diagram-container');
    const nomeDiv = document.getElementById('nomeAcordeDestaque');
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';
    
    const data = dicionarioShapes[nomeAcorde];
    if (!data) return; 
    
    nomeDiv.innerText = nomeAcorde;
    container.style.display = 'block';

    const width = 140;   
    const height = 160;  
    const frets = 5;     
    const marginTop = 25;
    const marginLeft = 20;
    const stringSpacing = (width - 2 * marginLeft) / 5;
    const fretSpacing = (height - marginTop - 10) / frets;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.display = "block";
    svg.style.margin = "0 auto";

    // Pestana
    const nut = document.createElementNS("http://www.w3.org/2000/svg", "line");
    nut.setAttribute("x1", marginLeft); nut.setAttribute("y1", marginTop);
    nut.setAttribute("x2", width - marginLeft); nut.setAttribute("y2", marginTop);
    nut.setAttribute("stroke", "#ffffff"); nut.setAttribute("stroke-width", "4");
    svg.appendChild(nut);

    // Trastes
    for (let i = 1; i <= frets; i++) {
        const y = marginTop + i * fretSpacing;
        const fretLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        fretLine.setAttribute("x1", marginLeft); fretLine.setAttribute("y1", y);
        fretLine.setAttribute("x2", width - marginLeft); fretLine.setAttribute("y2", y);
        fretLine.setAttribute("stroke", "#666666"); fretLine.setAttribute("stroke-width", "1");
        svg.appendChild(fretLine);
    }

    // Cordas
    for (let i = 0; i < 6; i++) {
        const x = marginLeft + i * stringSpacing;
        const stringLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        stringLine.setAttribute("x1", x); stringLine.setAttribute("y1", marginTop);
        stringLine.setAttribute("x2", x); stringLine.setAttribute("y2", height - 10);
        stringLine.setAttribute("stroke", "#666666"); stringLine.setAttribute("stroke-width", "1");
        svg.appendChild(stringLine);
    }

    // Notas e Dedos (Usando o array exato de dedos agora)
    for (let i = 0; i < 6; i++) {
        const casa = data.g_frets[i];
        const dedo = data.g_fingers[i];
        const x = marginLeft + i * stringSpacing;

        if (casa === null || casa === 0) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x); text.setAttribute("y", marginTop - 8);
            text.setAttribute("fill", "#888888"); text.setAttribute("font-size", "12px");
            text.setAttribute("font-weight", "bold"); text.setAttribute("text-anchor", "middle");
            text.textContent = casa === null ? "X" : "O";
            svg.appendChild(text);
        } else if (casa > 0) {
            const y = marginTop + (casa - 0.5) * fretSpacing; 
            
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", x); dot.setAttribute("cy", y);
            dot.setAttribute("r", "9"); dot.setAttribute("fill", "#f1c40f");
            dot.setAttribute("stroke", "#d4a017"); dot.setAttribute("stroke-width", "1");
            svg.appendChild(dot);

            if (dedo !== null) {
                const fingerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                fingerText.setAttribute("x", x); fingerText.setAttribute("y", y);
                fingerText.setAttribute("fill", "#000000"); fingerText.setAttribute("font-size", "11px");
                fingerText.setAttribute("font-weight", "bold"); fingerText.setAttribute("text-anchor", "middle");
                fingerText.setAttribute("dominant-baseline", "central");
                fingerText.textContent = dedo;
                svg.appendChild(fingerText);
            }
        }
    }

    area.appendChild(svg);
}

// ==========================================
// DESENHO DO TECLADO
// ==========================================
function desenharTeclado(nomeAcorde) {
    const area = document.getElementById('chord-visual-area');
    area.innerHTML = '';

    const data = dicionarioShapes[nomeAcorde];
    if (!data || !data.piano) return;

    const notasAtivas = data.piano; // Ex: [0, 4, 7]
    const totalTeclasBrancas = 14; // Duas oitavas (C até B)

    // O padrão do piano: índices das teclas pretas baseadas na branca à esquerda
    // 0:C, 1:C#, 2:D, 3:D#, 4:E, 5:F, 6:F#, 7:G, 8:G#, 9:A, 10:A#, 11:B
    const offsetPretas = [1, 3, null, 6, 8, 10, null, 13, 15, null, 18, 20, 22, null];
    let contadorNotaAbsoluta = 0; // Vai de 0 a 23

    const tecladoDiv = document.createElement('div');
    tecladoDiv.className = 'teclado-container';

    // Para colocar as pretas por cima, calculamos a posição %
    let posicaoX = 0;
    const larguraBranca = 100 / totalTeclasBrancas; // ~7.14%

    for (let i = 0; i < totalTeclasBrancas; i++) {
        // Cria Tecla Branca
        const branca = document.createElement('div');
        branca.className = 'tecla-branca';
        
        // Verifica se essa tecla branca faz parte do acorde
        if (notasAtivas.includes(contadorNotaAbsoluta)) {
            branca.innerHTML = '<div class="marca-tecla"></div>';
        }
        tecladoDiv.appendChild(branca);

        // Verifica se tem tecla preta logo em seguida
        if (offsetPretas[i] !== null && offsetPretas[i] !== undefined) {
            const preta = document.createElement('div');
            preta.className = 'tecla-preta';
            preta.style.left = `calc(${posicaoX + larguraBranca}% - 8px)`; // 8px é metade da tecla preta
            
            if (notasAtivas.includes(offsetPretas[i])) {
                preta.innerHTML = '<div class="marca-tecla"></div>';
            }
            tecladoDiv.appendChild(preta);
            contadorNotaAbsoluta += 2; // Pula a preta e vai pra próxima branca
        } else {
            contadorNotaAbsoluta += 1; // Só branca (ex: E pra F)
        }
        
        posicaoX += larguraBranca;
    }

    area.appendChild(tecladoDiv);
}