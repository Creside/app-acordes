// ==========================================
// FASE 1: O MOTOR HARMÔNICO (O CÉREBRO DO APP)
// ==========================================

// 1. A Escala Cromática (O DNA de toda a música ocidental)
// Usamos sustenidos (#) por padrão para facilitar os cálculos iniciais.
const notasCromaticas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// 2. Fórmulas de Escalas (Em semitons a partir da Tônica)
// Maior: Tom-Tom-Semintom-Tom-Tom-Tom-Semitom (2, 2, 1, 2, 2, 2, 1)
const formulaEscalaMaior = [0, 2, 4, 5, 7, 9, 11];
const formulaEscalaMenor = [0, 2, 3, 5, 7, 8, 10]; // Menor Natural

// 3. Fórmulas de Acordes (Em semitons a partir da Tônica)
// C (Dó Maior) = Tônica(0) + Terça Maior(4) + Quinta Justa(7) = C, E, G
const formulasAcordes = {
    "": [0, 4, 7],           // Tríade Maior (Ex: C)
    "m": [0, 3, 7],          // Tríade Menor (Ex: Cm)
    "dim": [0, 3, 6],        // Tríade Diminuta (Ex: Cdim)
    "aug": [0, 4, 8],        // Tríade Aumentada (Ex: Caug)
    "7": [0, 4, 7, 10],      // Tétrade Dominante (Ex: C7)
    "7M": [0, 4, 7, 11],     // Tétrade Maior com 7ª Maior (Ex: C7M)
    "m7": [0, 3, 7, 10],     // Tétrade Menor com 7ª Menor (Ex: Cm7)
    "m7b5": [0, 3, 6, 10]    // Meio Diminuto (Ex: Cm7b5)
};

// 4. Padrão do Campo Harmônico Maior (Os "Graus")
// I, ii, iii, IV, V, vi, vii°
const qualidadesCampoMaior = ["", "m", "m", "", "", "m", "dim"];

// ==========================================
// FUNÇÕES INTELIGENTES (MATEMÁTICA MUSICAL)
// ==========================================

// Função A: Encontra o índice de uma nota (Ex: "E" -> 4)
function getNotaIndex(notaStr) {
    // Tratamento simples para "Db" virar "C#", etc., se o usuário digitar bemol
    const equivalenciasBemol = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"};
    const nota = equivalenciasBemol[notaStr] || notaStr;
    return notasCromaticas.indexOf(nota);
}

// Função B: Calcula uma nota X semitons acima de outra
function somarSemitons(notaBaseIndex, semitons) {
    // O módulo (%) garante que se passar do "B" (11), ele volta pro "C" (0)
    return (notaBaseIndex + semitons) % 12;
}

// Função C: Gera o Campo Harmônico completo de qualquer Tom Maior!
// Exemplo: gerarCampoHarmonicoMaior("C") -> ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]
function gerarCampoHarmonicoMaior(tonicaStr) {
    const tonicaIndex = getNotaIndex(tonicaStr);
    if (tonicaIndex === -1) return null; // Nota inválida

    let campoHarmonico = [];
    
    // Itera pelos 7 graus da escala maior
    for (let i = 0; i < 7; i++) {
        // Encontra a nota raiz do grau atual usando a fórmula da escala
        const grauIndex = somarSemitons(tonicaIndex, formulaEscalaMaior[i]);
        const nomeNota = notasCromaticas[grauIndex];
        
        // Junta a nota com a qualidade do grau (ex: D + m = Dm)
        const acordeDoGrau = nomeNota + qualidadesCampoMaior[i];
        campoHarmonico.push(acordeDoGrau);
    }
    
    return campoHarmonico;
}

// Memória do app para guardar as notas atuais quando trocarmos de instrumento
let notasEscalaAtual = []; 

// ==========================================
// FUNÇÃO: IDENTIFICADOR DE TOM (INTELIGENTE)
// ==========================================

function identificarTom() {
    const input = document.getElementById('inputAcordes').value;
    const acordesDigitados = input.split(',').map(acorde => acorde.trim().toUpperCase()).filter(a => a !== "");
    const resultadoDiv = document.getElementById('resultado');

    if (acordesDigitados.length === 0) {
        resultadoDiv.innerHTML = "Por favor, digite os acordes.";
        return;
    }

    let tomEncontradoStr = null;
    let campoEncontrado = [];

    // Testa os acordes digitados contra os 12 tons maiores possíveis
    for (let i = 0; i < 12; i++) {
        const notaTonica = notasCromaticas[i];
        const campoTeste = gerarCampoHarmonicoMaior(notaTonica);
        
        // Verifica se TODOS os acordes digitados pertencem a este campo de teste
        // Convertendo para uppercase para garantir a comparação ("dm" == "DM")
        const pertenceAoTom = acordesDigitados.every(acorde => 
            campoTeste.map(c => c.toUpperCase()).includes(acorde)
        );
        
        if (pertenceAoTom) {
            tomEncontradoStr = notaTonica;
            campoEncontrado = campoTeste;
            break; // Achou o tom, para de procurar
        }
    }

    if (tomEncontradoStr) {
        // Se achou o tom (ex: "C"), vamos calcular a Pentatônica na hora
        // Penta Maior (1, 2, 3, 5, 6) = Índices 0, 1, 2, 4, 5 do Campo Harmônico (sem as qualidades m/dim)
        const notasPentaMaior = [
            notasCromaticas[somarSemitons(getNotaIndex(tomEncontradoStr), 0)], // 1ª (Tônica)
            notasCromaticas[somarSemitons(getNotaIndex(tomEncontradoStr), 2)], // 2ª
            notasCromaticas[somarSemitons(getNotaIndex(tomEncontradoStr), 4)], // 3ª Maior
            notasCromaticas[somarSemitons(getNotaIndex(tomEncontradoStr), 7)], // 5ª Justa
            notasCromaticas[somarSemitons(getNotaIndex(tomEncontradoStr), 9)]  // 6ª Maior
        ];

        // Penta Menor Relativa (A partir do 6º grau, usando as mesmas notas)
        const tonicaMenor = notasPentaMaior[4]; // A 6ª Maior é a tônica da menor relativa
        const notasPentaMenorStr = `${tonicaMenor}, ${notasPentaMaior[0]}, ${notasPentaMaior[1]}, ${notasPentaMaior[2]}, ${notasPentaMaior[3]}`;

        resultadoDiv.innerHTML = `
            <div style="color: #4CAF50; font-size: 18px; margin-bottom: 15px;">
                🎵 A música está em: <br><b>${tomEncontradoStr} Maior</b>
            </div>
            <div style="font-size: 14px; text-align: left; background: #444; padding: 12px; border-radius: 5px; color: #ddd;">
                <p style="margin-top: 0;"><b>🎸 Escala Pentatônica Maior:</b><br> ${notasPentaMaior.join(", ")}</p>
                <hr style="border: 0; border-top: 1px solid #555; margin: 10px 0;">
                <p style="margin-bottom: 0;"><b>🎸 Escala Pentatônica Menor Relativa (${tonicaMenor}m):</b><br> ${notasPentaMenorStr}</p>
                <hr style="border: 0; border-top: 1px solid #555; margin: 10px 0;">
                <p style="margin-bottom: 0;"><b>🛤️ Campo Harmônico (${tomEncontradoStr}):</b><br> ${campoEncontrado.join(" - ")}</p>
            </div>
        `;
        
        // Atualiza a memória global para desenhar o braço
        notasEscalaAtual = notasPentaMaior;
        desenharBraco(); 

        // IMPORTANTE: Adaptamos a chamada dos botões para o formato "C" em vez de "Dó Maior (C)"
        // Por enquanto, usamos um mapeamento de volta para o teu banco de shapes antigo para não quebrar a UI
        const nomeAntigoParaOBanco = mapearNomeParaBanco(tomEncontradoStr);
        gerarBotoesDeVariacao(nomeAntigoParaOBanco);

    } else {
        resultadoDiv.innerHTML = "Tom não identificado. Tente digitar outros acordes da música (ex: Am, F, C).";
        document.getElementById('fretboard-container').style.display = 'none';
        document.getElementById('variacoes-container').style.display = 'none';
        document.getElementById('chord-diagram-container').style.display = 'none';
        notasEscalaAtual = []; 
    }
}

// Função temporária de transição (Mantém teus botões antigos a funcionar enquanto evoluímos)
function mapearNomeParaBanco(tonicaSigla) {
    const mapa = {
        "C": "Dó Maior (C)", "D": "Ré Maior (D)", "E": "Mi Maior (E)", 
        "F": "Fá Maior (F)", "G": "Sol Maior (G)", "A": "Lá Maior (A)", "B": "Si Maior (B)"
    };
    return mapa[tonicaSigla] || tonicaSigla; // Se não achar (ex: F#), devolve a sigla crua
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
const dicionarioShapes = {
    "C":   { g_frets: [null, 3, 2, 0, 1, 0], g_fingers: [null, 3, 2, null, 1, null], piano: [0, 4, 7] },
    "C7M": { g_frets: [null, 3, 2, 0, 0, 0], g_fingers: [null, 3, 2, null, null, null], piano: [0, 4, 7, 11] },
    "C9":  { g_frets: [null, 3, 2, 3, 3, null], g_fingers: [null, 2, 1, 3, 4, null], piano: [0, 4, 7, 10, 14] },
    "C7":  { g_frets: [null, 3, 2, 3, 1, 0], g_fingers: [null, 3, 2, 4, 1, null], piano: [0, 4, 7, 10] }, // NOVO
    
    "D":   { g_frets: [null, null, 0, 2, 3, 2], g_fingers: [null, null, null, 1, 3, 2], piano: [2, 6, 9] },
    "D7M": { g_frets: [null, null, 0, 2, 2, 2], g_fingers: [null, null, null, 1, 2, 3], piano: [2, 6, 9, 13] },
    "D9":  { g_frets: [null, 5, 4, 5, 5, null], g_fingers: [null, 2, 1, 3, 4, null], piano: [2, 6, 9, 12, 16] },
    "D7":  { g_frets: [null, null, 0, 2, 1, 2], g_fingers: [null, null, null, 2, 1, 3], piano: [2, 6, 9, 12] },
    
    "E":   { g_frets: [0, 2, 2, 1, 0, 0], g_fingers: [null, 2, 3, 1, null, null], piano: [4, 8, 11] },
    "E7M": { g_frets: [0, 2, 1, 1, 0, 0], g_fingers: [null, 3, 1, 2, null, null], piano: [4, 8, 11, 15] },
    "E9":  { g_frets: [0, 2, 0, 1, 0, 2], g_fingers: [null, 2, null, 1, null, 4], piano: [4, 8, 11, 14, 18] },
    "E7":  { g_frets: [0, 2, 0, 1, 0, 0], g_fingers: [null, 2, null, 1, null, null], piano: [4, 8, 11, 14] },
    "Edim":{ g_frets: [null, null, 2, 3, 2, 3], g_fingers: [null, null, 1, 3, 2, 4], piano: [4, 7, 10] }, // NOVO
    
    "F":   { g_frets: [1, 3, 3, 2, 1, 1], g_fingers: [1, 3, 4, 2, 1, 1], piano: [5, 9, 12] },
    "F7M": { g_frets: [null, null, 3, 2, 1, 0], g_fingers: [null, null, 3, 2, 1, null], piano: [5, 9, 12, 16] },
    "F#7": { g_frets: [2, 4, 2, 3, 2, 2], g_fingers: [1, 3, 1, 2, 1, 1], piano: [6, 10, 13, 16] }, // NOVO
    
    "G":   { g_frets: [3, 2, 0, 0, 0, 3], g_fingers: [2, 1, null, null, null, 3], piano: [7, 11, 14] },
    "G7M": { g_frets: [3, null, 0, 0, 0, 2], g_fingers: [2, null, null, null, null, 1], piano: [7, 11, 14, 18] },
    "G9":  { g_frets: [3, null, 0, 2, 0, 3], g_fingers: [2, null, null, 1, null, 3], piano: [7, 11, 14, 17, 21] },
    "G7":  { g_frets: [3, 2, 0, 0, 0, 1], g_fingers: [3, 2, null, null, null, 1], piano: [7, 11, 14, 17] },
    "Gm7": { g_frets: [3, 5, 3, 3, 3, 3], g_fingers: [1, 3, 1, 1, 1, 1], piano: [7, 10, 14, 17] }, // NOVO
    
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
    
    nomeDiv.innerText = nomeAcorde;
    container.style.display = 'block';

    const data = dicionarioShapes[nomeAcorde];
    if (!data) {
        // Se o acorde não existir no banco, mostra esta mensagem amigável
        area.innerHTML = `<p style="color:#aaa; padding: 20px; font-size: 14px;">O diagrama para <b>${nomeAcorde}</b> ainda não foi adicionado ao banco de dados.</p>`;
        return; 
    }
    
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
    if (!data || !data.piano) {
        area.innerHTML = `<p style="color:#aaa; padding: 20px; font-size: 14px;">O teclado para <b>${nomeAcorde}</b> ainda não foi adicionado ao banco de dados.</p>`;
        return;
    }

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

// ==========================================
// FASE 2: CALCULADORA DE ROTAS HARMÓNICAS
// ==========================================

// Função auxiliar para extrair apenas a nota raiz de um acorde complexo (ex: "C#m7b5" -> "C#")
function extrairTonica(acordeStr) {
    const match = acordeStr.match(/^[A-G][#b]?/);
    return match ? match[0] : null;
}

function gerarRotas() {
    const origemInput = document.getElementById('acordeOrigem').value.trim();
    const destinoInput = document.getElementById('acordeDestino').value.trim();
    const resultadoRotas = document.getElementById('resultado-rotas');

    if (!origemInput || !destinoInput) {
        resultadoRotas.innerHTML = "<p style='color: #ff6b6b; font-size: 14px;'>Digite o acorde de origem e o destino!</p>";
        return;
    }

    // Normaliza (Primeira letra maiúscula)
    const origemT = origemInput.charAt(0).toUpperCase() + origemInput.slice(1);
    const destinoT = destinoInput.charAt(0).toUpperCase() + destinoInput.slice(1);

    const raizDestino = extrairTonica(destinoT);
    const indexDestino = getNotaIndex(raizDestino);
    
    if (indexDestino === -1) {
        resultadoRotas.innerHTML = "<p style='color: #ff6b6b; font-size: 14px;'>Acorde de destino não reconhecido. Use C, C#, Db, etc.</p>";
        return;
    }

    resultadoRotas.innerHTML = ""; // Limpa resultados anteriores

    // --- A MATEMÁTICA DA HARMONIA ---
    
    // 1. Dominante Secundário (V7 do alvo). Fica 7 semitons acima do destino.
    const indexV7 = somarSemitons(indexDestino, 7);
    const acordeV7 = notasCromaticas[indexV7] + "7";

    // 2. Substituto Trítono (SubV7). Fica 1 semitom acima do destino.
    const indexSubV7 = somarSemitons(indexDestino, 1);
    const acordeSubV7 = notasCromaticas[indexSubV7] + "7";

    // 3. Preparação II-V (IIm7 -> V7 -> I). O IIm7 fica 2 semitons acima do destino.
    const indexIIm7 = somarSemitons(indexDestino, 2);
    const acordeIIm7 = notasCromaticas[indexIIm7] + "m7";

    // 4. Acorde Diminuto de Passagem (Fica 1 semitom abaixo do destino).
    // Usamos +11 em vez de -1 para a função módulo (%) funcionar perfeitamente em JavaScript
    const indexDim = somarSemitons(indexDestino, 11); 
    const acordeDim = notasCromaticas[indexDim] + "dim";

    // Renderiza os "Cards" visuais das rotas
    adicionarRotaVisual("Dominante Secundário (V7)", [origemT, acordeV7, destinoT]);
    adicionarRotaVisual("Substituto Trítono (SubV7)", [origemT, acordeSubV7, destinoT]);
    adicionarRotaVisual("Preparação II-V", [origemT, acordeIIm7, acordeV7, destinoT]);
    adicionarRotaVisual("Aproximação Diminuta", [origemT, acordeDim, destinoT]);
}

// Função que desenha o bloquinho da rota na tela com os Mini-Diagramas
function adicionarRotaVisual(nomeDaRegra, listaDeAcordes) {
    const resultadoRotas = document.getElementById('resultado-rotas');
    
    const card = document.createElement('div');
    card.className = 'rota-card';
    
    const titulo = document.createElement('h3');
    titulo.className = 'rota-titulo';
    titulo.innerText = nomeDaRegra;
    card.appendChild(titulo);

    const caminhoDiv = document.createElement('div');
    caminhoDiv.className = 'rota-caminho';

    listaDeAcordes.forEach((acorde, index) => {
        const acordeBox = document.createElement('div');
        acordeBox.className = 'mini-chord-box';
        
        // Título do Acorde no topo da miniatura
        const nomeLabel = document.createElement('div');
        nomeLabel.className = 'mini-chord-name';
        nomeLabel.innerText = acorde;
        acordeBox.appendChild(nomeLabel);
        
        // Gera e adiciona o SVG em miniatura
        const svgElement = criarMiniSVG(acorde);
        acordeBox.appendChild(svgElement);

        // Ação de clique: abre o diagrama grande lá em baixo
        acordeBox.onclick = () => {
            acordeAtualSelecionado = acorde;
            document.getElementById('chord-diagram-container').style.display = 'block';
            renderizarVisualizacao();
            document.getElementById('chord-diagram-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        caminhoDiv.appendChild(acordeBox);

        // Adiciona a seta entre os acordes
        if (index < listaDeAcordes.length - 1) {
            const seta = document.createElement('div');
            seta.className = 'rota-seta';
            seta.innerText = "➔";
            caminhoDiv.appendChild(seta);
        }
    });

    card.appendChild(caminhoDiv);
    resultadoRotas.appendChild(card);
}

// NOVA FUNÇÃO: Gera um SVG reduzido para caber nos cartões da rota
function criarMiniSVG(nomeAcorde) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 140 160");
    svg.setAttribute("width", "70");  // Escala para metade
    svg.setAttribute("height", "80"); // Escala para metade
    svg.style.display = "block";

    const data = dicionarioShapes[nomeAcorde];
    
    // Se o acorde não existir no banco, mostra um ponto de interrogação
    if (!data) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "70"); text.setAttribute("y", "80");
        text.setAttribute("fill", "#888"); text.setAttribute("font-size", "40px");
        text.setAttribute("text-anchor", "middle"); text.setAttribute("dominant-baseline", "central");
        text.textContent = "?";
        svg.appendChild(text);
        return svg;
    }

    const width = 140; const height = 160; const frets = 5;     
    const marginTop = 25; const marginLeft = 20;
    const stringSpacing = (width - 2 * marginLeft) / 5;
    const fretSpacing = (height - marginTop - 10) / frets;

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
        fretLine.setAttribute("stroke", "#666"); fretLine.setAttribute("stroke-width", "2");
        svg.appendChild(fretLine);
    }

    // Cordas
    for (let i = 0; i < 6; i++) {
        const x = marginLeft + i * stringSpacing;
        const stringLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        stringLine.setAttribute("x1", x); stringLine.setAttribute("y1", marginTop);
        stringLine.setAttribute("x2", x); stringLine.setAttribute("y2", height - 10);
        stringLine.setAttribute("stroke", "#666"); stringLine.setAttribute("stroke-width", "2");
        svg.appendChild(stringLine);
    }

    // Bolinhas, Notas Soltas e Dedos
    for (let i = 0; i < 6; i++) {
        const casa = data.g_frets[i];
        const dedo = data.g_fingers[i];
        const x = marginLeft + i * stringSpacing;

        if (casa === null || casa === 0) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x); text.setAttribute("y", marginTop - 8);
            text.setAttribute("fill", "#aaa"); text.setAttribute("font-size", "14px");
            text.setAttribute("font-weight", "bold"); text.setAttribute("text-anchor", "middle");
            text.textContent = casa === null ? "X" : "O";
            svg.appendChild(text);
        } else if (casa > 0) {
            const y = marginTop + (casa - 0.5) * fretSpacing; 
            
            // Desenha a bolinha (raio 9 igual ao grande, a viewBox escala sozinha)
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", x); dot.setAttribute("cy", y);
            dot.setAttribute("r", "9"); 
            dot.setAttribute("fill", "#f1c40f");
            svg.appendChild(dot);

            // Adiciona o número do dedo se existir
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

    return svg;
}