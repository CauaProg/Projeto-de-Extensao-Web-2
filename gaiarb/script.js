/* ═══════════════════════════════════════════════
   GAIARB – script.js
   ═══════════════════════════════════════════════ */

// ── VARIÁVEIS GLOBAIS ────────────────────────────
let valorSelecionado = 50;
let currentPixPayload = "";
let qrInstance = null;
const apiBase = window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '';

/* ═══════════════════════════════════════════════
   INICIALIZAÇÃO
   ═══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

    // Animações de entrada ao scroll
    iniciarScrollAnimations();

    // Highlight link ativo no header
    marcarLinkAtivo();

    // Contador animado nos stats (home)
    iniciarContadores();

    // Partículas flutuantes no hero (home)
    criarParticulasHero();

    // Efeito parallax leve no banner
    iniciarParallax();

    // Fade-in nas seções
    iniciarFadeInSections();

    // Carregamento dinâmico do Banco de Dados
    carregarEquipeDinamica();
});


/* ═══════════════════════════════════════════════
   ANIMAÇÕES DE SCROLL
   ═══════════════════════════════════════════════ */
function iniciarScrollAnimations() {
    const seletores = [
        ".membro-linha",
        ".card-ajuda",
        ".mvv-card",
        ".porque-item",
        ".impacto-item",
        ".forma-card",
        ".galeria-item",
        ".stat-item",
        ".valor-tag",
        ".areas-lista li",
        ".quem-foto",
        ".secao"
    ];

    const elementos = document.querySelectorAll(seletores.join(", "));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visivel-scroll");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    elementos.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = `opacity 0.55s ease ${i * 0.04}s, transform 0.55s ease ${i * 0.04}s`;
        observer.observe(el);
    });
}

// Classe adicionada pelo observer
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = ".visivel-scroll { opacity: 1 !important; transform: translateY(0) !important; }";
    document.head.appendChild(style);
});


/* ═══════════════════════════════════════════════
   LINK ATIVO NO HEADER
   ═══════════════════════════════════════════════ */
function marcarLinkAtivo() {
    const pagina = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".alllinks a").forEach(link => {
        const href = link.getAttribute("href");
        const div  = link.querySelector(".linkshead");
        if (!div || div.classList.contains("btn-doe")) return;
        if (href === pagina || (pagina === "" && href === "index.html")) {
            div.classList.add("active-link");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
        .linkshead.active-link::after { width: 80% !important; }
        .linkshead.active-link { color: var(--primary) !important; }
    `;
    document.head.appendChild(style);
});


/* ═══════════════════════════════════════════════
   CONTADORES ANIMADOS (HOME)
   ═══════════════════════════════════════════════ */
function iniciarContadores() {
    const statsBar = document.querySelector(".stats-bar");
    if (!statsBar) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll(".stat-numero").forEach(el => {
                    const raw = el.textContent.trim();
                    const valor = parseInt(raw.replace(/\D/g, ""));
                    const sufixo = raw.includes("+") ? "+" : "";
                    if (!isNaN(valor)) animarContador(el, valor, sufixo);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    observer.observe(statsBar);
}

function animarContador(el, alvo, sufixo) {
    let atual = 0;
    const duracao = 1200;
    const incremento = Math.ceil(alvo / (duracao / 16));
    const timer = setInterval(() => {
        atual = Math.min(atual + incremento, alvo);
        el.textContent = atual.toLocaleString("pt-BR") + sufixo;
        if (atual >= alvo) clearInterval(timer);
    }, 16);
}


/* ═══════════════════════════════════════════════
   PARTÍCULAS HERO (HOME)
   ═══════════════════════════════════════════════ */
function criarParticulasHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const emojis = ["💜", "🌈", "💛", "💚", "💙", "🌟", "✨", "💕"];
    for (let i = 0; i < 8; i++) {
        const p = document.createElement("span");
        p.textContent = emojis[i % emojis.length];
        p.style.cssText = `
            position: absolute;
            font-size: ${12 + Math.random() * 16}px;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${0.05 + Math.random() * 0.08};
            pointer-events: none;
            animation: floatParticle ${5 + Math.random() * 6}s ease-in-out infinite;
            animation-delay: ${Math.random() * 4}s;
            z-index: 0;
        `;
        hero.appendChild(p);
    }

    const style = document.createElement("style");
    style.textContent = `
        @keyframes floatParticle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33%       { transform: translateY(-20px) rotate(10deg); }
            66%       { transform: translateY(10px) rotate(-5deg); }
        }
    `;
    document.head.appendChild(style);
}


/* ═══════════════════════════════════════════════
   PARALLAX LEVE NO BANNER
   ═══════════════════════════════════════════════ */
function iniciarParallax() {
    const banner = document.querySelector(".banner");
    if (!banner) return;
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        banner.style.backgroundPositionY = `calc(50% + ${scrollY * 0.3}px)`;
    }, { passive: true });
}


/* ═══════════════════════════════════════════════
   FADE-IN DAS SEÇÕES GRANDES
   ═══════════════════════════════════════════════ */
function iniciarFadeInSections() {
    const secoes = document.querySelectorAll(".secao, .quem-somos, .como-ajudar, .mvv-section, .valores-section");
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = "1";
                e.target.style.transform = "none";
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });

    secoes.forEach(s => {
        s.style.opacity    = "0";
        s.style.transform  = "translateY(20px)";
        s.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        obs.observe(s);
    });
}


/* ═══════════════════════════════════════════════
   DOAÇÃO – SELEÇÃO DE VALOR E ABAS
   ═══════════════════════════════════════════════ */
let activeDoeTab = 'pix';

function switchDoeTab(tab) {
    activeDoeTab = tab;
    // Update button classes
    document.querySelectorAll(".doe-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    const targetBtn = document.getElementById("tab-btn-" + tab);
    if (targetBtn) targetBtn.classList.add("active");

    // Update content visibility
    document.querySelectorAll(".doe-tab-content").forEach(content => {
        content.classList.remove("active");
    });
    const targetContent = document.getElementById("doeTab" + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (targetContent) targetContent.classList.add("active");
}


/* ═══════════════════════════════════════════════
   PIX QR CODE GENERATION ENGINE
   ═══════════════════════════════════════════════ */
function calculateCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xFFFF;
        }
    }
    let hex = crc.toString(16).toUpperCase();
    while (hex.length < 4) {
        hex = "0" + hex;
    }
    return hex;
}

function generatePixPayload(key, amount, name, city) {
    let payload = "000201";
    
    let gui = "0014br.gov.bcb.pix";
    
    let keyLenStr = String(key.length);
    if (keyLenStr.length < 2) keyLenStr = "0" + keyLenStr;
    let keyTag = "01" + keyLenStr + key;
    
    let merchantInfo = gui + keyTag;
    let merchantInfoLenStr = String(merchantInfo.length);
    if (merchantInfoLenStr.length < 2) merchantInfoLenStr = "0" + merchantInfoLenStr;
    payload += "26" + merchantInfoLenStr + merchantInfo;
    
    payload += "52040000";
    payload += "5303986";
    
    let numAmount = Number(amount);
    if (isNaN(numAmount)) numAmount = 0;
    let amtStr = numAmount.toFixed(2);
    let amtLenStr = String(amtStr.length);
    if (amtLenStr.length < 2) amtLenStr = "0" + amtLenStr;
    payload += "54" + amtLenStr + amtStr;
    
    payload += "5802BR";
    
    let sanitizedName = name.toUpperCase();
    let nameLenStr = String(sanitizedName.length);
    if (nameLenStr.length < 2) nameLenStr = "0" + nameLenStr;
    payload += "59" + nameLenStr + sanitizedName;
    
    let sanitizedCity = city.toUpperCase();
    let cityLenStr = String(sanitizedCity.length);
    if (cityLenStr.length < 2) cityLenStr = "0" + cityLenStr;
    payload += "60" + cityLenStr + sanitizedCity;
    
    let txid = "62070503***";
    payload += txid;
    
    payload += "6304";
    let crc = calculateCRC16(payload);
    payload += crc;
    
    return payload;
}

/* ═══════════════════════════════════════════════
   PROCESSAMENTO DE DOAÇÃO DIRETA
   ═══════════════════════════════════════════════ */
function processarDoacaoDireta() {
    const valorInput = document.getElementById("doeValorInput");
    if (!valorInput) return;
    const val = parseFloat(valorInput.value);
    if (!val || val <= 0) {
        valorInput.style.borderColor = "#e53e3e";
        setTimeout(() => { valorInput.style.borderColor = ""; }, 1500);
        alert("Por favor, insira um valor válido de doação.");
        return;
    }

    if (activeDoeTab === 'pix') {
        const qrEl = document.getElementById("pixQrCodeImage");
        const keyText = document.getElementById("pixChaveText");
        const copiaColaLabel = document.getElementById("pixCopiaColaLabel");
        const copiaColaBox = document.getElementById("pixCopiaColaBox");
        const copiaColaText = document.getElementById("pixCopiaColaText");
        if (!qrEl) return;

        qrEl.innerHTML = "<span class='pix-placeholder-text'>Gerando QR Code...</span>";

        // Conteúdo oficial do PIX gerado dinamicamente para o e-mail contato@gaiarb.org
        const pixPayload = generatePixPayload("contato@gaiarb.org", val, "GAIARB", "RIO DE JANEIRO");
        currentPixPayload = pixPayload;

        // Gera QR Code usando a API pública
        const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=188x188&data=" + encodeURIComponent(pixPayload);
        qrEl.innerHTML = `<img src="${qrUrl}" alt="QR Code PIX" style="width:188px;height:188px;display:block;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.05);">`;

        // Exibe chave copia e cola
        if (copiaColaLabel) copiaColaLabel.style.display = "block";
        if (copiaColaBox) copiaColaBox.style.display = "flex";
        if (copiaColaText) copiaColaText.textContent = pixPayload;

        // Registra a doação no banco de dados via API do backend
        fetch(apiBase + '/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: val, tipo: 'PIX', status: 'Pendente' })
        })
        .then(res => res.json())
        .then(data => console.log("PIX donation logged successfully:", data))
        .catch(err => console.log("Bypass donation logging (API offline)"));

    } else if (activeDoeTab === 'cartao') {
        const cardNum = document.getElementById("cardNum")?.value.trim();
        const cardValid = document.getElementById("cardValid")?.value.trim();
        const cardCvv = document.getElementById("cardCvv")?.value.trim();
        const cardName = document.getElementById("cardName")?.value.trim();

        if (!cardNum || !cardValid || !cardCvv || !cardName) {
            alert("Por favor, preencha todos os dados do cartão de crédito.");
            return;
        }

        // Registra a doação de Cartão no banco de dados
        fetch(apiBase + '/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: val, tipo: 'Cartão de Crédito', status: 'Confirmado' })
        })
        .then(res => res.json())
        .then(data => {
            alert(`Doação de R$ ${val.toFixed(2)} via Cartão de Crédito realizada com sucesso!`);
            // Limpa formulário
            if (document.getElementById("cardNum")) document.getElementById("cardNum").value = "";
            if (document.getElementById("cardValid")) document.getElementById("cardValid").value = "";
            if (document.getElementById("cardCvv")) document.getElementById("cardCvv").value = "";
            if (document.getElementById("cardName")) document.getElementById("cardName").value = "";
        })
        .catch(err => {
            console.log("Bypass donation logging (API offline)");
            alert(`Doação de R$ ${val.toFixed(2)} simulada com sucesso (servidor offline).`);
        });

    } else if (activeDoeTab === 'boleto') {
        const boletoLinkWrap = document.getElementById("boletoLinkWrap");
        const boletoCodigoText = document.getElementById("boletoCodigoText");
        
        // Gera código de barras fictício
        const numBoleto = "34191.79001 " + Math.floor(10000 + Math.random() * 90000) + "." + Math.floor(100000 + Math.random() * 900000) + " " + Math.floor(10000 + Math.random() * 90000) + "." + Math.floor(100000 + Math.random() * 900000) + " " + Math.floor(1 + Math.random() * 9) + " " + Math.floor(10000000000000 + Math.random() * 90000000000000);
        if (boletoCodigoText) boletoCodigoText.textContent = numBoleto;
        if (boletoLinkWrap) boletoLinkWrap.style.display = "block";

        // Registra a doação de Boleto no banco de dados
        fetch(apiBase + '/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: val, tipo: 'Boleto Bancário', status: 'Pendente' })
        })
        .then(res => res.json())
        .then(data => {
            alert(`Boleto de R$ ${val.toFixed(2)} gerado com sucesso!`);
        })
        .catch(err => {
            console.log("Bypass donation logging (API offline)");
            alert(`Boleto de R$ ${val.toFixed(2)} gerado com sucesso (servidor offline).`);
        });
    }
}

function copiarChave(chave) {
    navigator.clipboard.writeText(chave).then(() => {
        alert("Chave copiada: " + chave);
    }).catch(() => {
        alert("Chave PIX: " + chave);
    });
}

function copiarChaveCopiaCola() {
    if (currentPixPayload) {
        navigator.clipboard.writeText(currentPixPayload).then(() => {
            alert("Código PIX Copia e Cola copiado com sucesso!");
        }).catch(() => {
            alert("Falha ao copiar código PIX.");
        });
    }
}

function copiarBoletoCodigo() {
    const text = document.getElementById("boletoCodigoText")?.textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Código de barras do boleto copiado!");
        }).catch(() => {
            alert("Falha ao copiar código de barras.");
        });
    }
}


/* ═══════════════════════════════════════════════
   GALERIA – FILTROS
   ═══════════════════════════════════════════════ */
function filtrar(btn, categoria) {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");

    const itens = document.querySelectorAll(".galeria-item");
    const grid = document.querySelector(".galeria-grid");

    let visiveis = 0;

    itens.forEach((item, i) => {
        const cat = item.dataset.cat;

        if (categoria === "todos" || cat === categoria) {
            item.style.display = "";
            visiveis++;

            // animação suave
            item.style.opacity = "0";
            item.style.transform = "scale(0.88)";

            setTimeout(() => {
                item.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                item.style.opacity = "1";
                item.style.transform = "scale(1)";
            }, i * 45);

        } else {
            item.style.display = "none";
        }
    });

    // 🔥 AQUI ESTÁ O SEGREDO (crescer quando filtrar)
    if (visiveis <= 4) {
        grid.classList.add("expandido");
    } else {
        grid.classList.remove("expandido");
    }
}


/* ═══════════════════════════════════════════════
   GALERIA – LIGHTBOX
   ═══════════════════════════════════════════════ */
function abrirLightbox(item) {
    const lb       = document.getElementById("lightbox");
    const conteudo = document.getElementById("lightboxConteudo");
    if (!lb || !conteudo) return;
    conteudo.style.backgroundImage = item.style.backgroundImage;
    lb.classList.add("aberto");
    document.body.style.overflow = "hidden";
}

function fecharLightbox(event) {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    if (!event || event.target === lb || event.target.classList.contains("lightbox-fechar")) {
        lb.classList.remove("aberto");
        document.body.style.overflow = "";
    }
}


/* ═══════════════════════════════════════════════
   FORMULÁRIO DE VOLUNTÁRIO
   ═══════════════════════════════════════════════ */
function enviarFormVoluntario() {
    const nome  = document.getElementById("vol-nome")?.value.trim();
    const email = document.getElementById("vol-email")?.value.trim();
    const whats = document.getElementById("vol-whats")?.value.trim();
    const area  = document.getElementById("vol-area")?.value;
    const disp  = document.getElementById("vol-disp")?.value;
    const msg   = document.getElementById("vol-msg")?.value.trim();

    if (!nome || !email || !whats || !area) {
        // Destaca campos vazios
        ["vol-nome","vol-email","vol-whats","vol-area"].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) {
                el.style.borderColor = "#e53e3e";
                el.style.boxShadow = "0 0 0 4px rgba(229,62,62,0.15)";
                setTimeout(() => {
                    el.style.borderColor = "";
                    el.style.boxShadow = "";
                }, 2000);
            }
        });
        return;
    }

    const payload = { nome, email, whatsapp: whats, area, disponibilidade: disp, mensagem: msg };
    const btn = document.querySelector(".vol-form-col .btn-primary");
    const originalText = btn ? btn.textContent : "Enviar Candidatura";
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Enviando...";
    }

    const statusMsg = document.getElementById("vol-status-msg");
    if (statusMsg) {
        statusMsg.style.display = "none";
        statusMsg.textContent = "";
    }

    fetch(apiBase + '/api/voluntarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (statusMsg) {
            statusMsg.style.color = "var(--secondary)";
            statusMsg.textContent = `Obrigado, ${nome}! Recebemos sua candidatura com sucesso.`;
            statusMsg.style.display = "block";
        } else {
            alert(`Obrigado, ${nome}! Recebemos sua candidatura com sucesso.`);
        }
        ["vol-nome","vol-email","vol-whats","vol-area","vol-disp","vol-msg"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    })
    .catch(err => {
        console.warn("Backend offline, saving application client-side simulation.");
        if (statusMsg) {
            statusMsg.style.color = "var(--secondary)";
            statusMsg.textContent = `Obrigado, ${nome}! Cadastro recebido (Modo offline).`;
            statusMsg.style.display = "block";
        } else {
            alert(`Obrigado, ${nome}! Cadastro recebido (Modo offline).`);
        }
        ["vol-nome","vol-email","vol-whats","vol-area","vol-disp","vol-msg"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/* ═══════════════════════════════════════════════
   INTEGRAÇÃO DINÂMICA DO BANCO DE DADOS (APIs)
   ═══════════════════════════════════════════════ */

function carregarEquipeDinamica() {
    const lista = document.querySelector('.equipe-lista');
    if (!lista) return;
    
    fetch(apiBase + '/api/equipe')
    .then(res => {
        if (!res.ok) throw new Error("API Indisponível");
        return res.json();
    })
    .then(data => {
        if (!data || data.length === 0) return;
        lista.innerHTML = ''; // Limpa conteúdo estático se carregou do banco
        data.forEach((m, i) => {
            lista.innerHTML += `
                <div class="membro-linha">
                    <div class="membro-numero">${m.numero}</div>
                    <div class="membro-info">
                        <div class="membro-nome">${m.nome}</div>
                        <span class="membro-cargo-tag">${m.cargo}</span>
                        <p class="membro-bio">${m.bio}</p>
                    </div>
                    <div class="membro-deco dc${(i % 6) + 1}"></div>
                </div>
            `;
        });
    })
    .catch(err => {
        console.log("Servidor offline: Usando dados estáticos para equipe", err);
    });
}

// FAQ Accordion Toggle
document.addEventListener("DOMContentLoaded", () => {
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.parentNode;
            const answer = item.querySelector(".faq-answer");
            const isActive = item.classList.contains("active");
            
            // Close all other faq items first
            document.querySelectorAll(".faq-item").forEach(otherItem => {
                otherItem.classList.remove("active");
                otherItem.querySelector(".faq-answer").style.maxHeight = null;
            });
            
            if (!isActive) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
