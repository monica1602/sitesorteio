document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const btnSortearNumeros = document.getElementById('btn-sortear-numeros');
    const btnSortearNomes = document.getElementById('btn-sortear-nomes');
    const btnCopiar = document.getElementById('btn-copiar');
    const btnNovoSorteio = document.getElementById('btn-novo-sorteio');
    const btnLimparHistorico = document.getElementById('btn-limpar-historico');
    const resultadoArea = document.getElementById('resultado-area');
    const resultadoConteudo = document.getElementById('resultado-conteudo');
    const historicoArea = document.getElementById('historico-area');
    const historicoLista = document.getElementById('historico-lista');
    const uploadArea = document.getElementById('upload-area');
    const arquivoInput = document.getElementById('arquivo-nomes');
    const uploadStatus = document.getElementById('upload-status');
    const nomesTextarea = document.getElementById('nomes-textarea');
    const nomesCounter = document.getElementById('nomes-counter');

    let historico = JSON.parse(localStorage.getItem('sorteio-historico') || '[]');
    let ultimoResultado = '';

    // Inicializar
    renderHistorico();
    atualizarContadorNomes();

    // Navegação por abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');

            // Esconder resultado ao trocar aba
            resultadoArea.hidden = true;
        });
    });

    // Sortear Números
    btnSortearNumeros.addEventListener('click', async () => {
        const minimo = document.getElementById('num-minimo').value;
        const maximo = document.getElementById('num-maximo').value;
        const quantidade = document.getElementById('num-quantidade').value;
        const permitirRepetidos = document.getElementById('num-repetidos').checked;

        btnSortearNumeros.disabled = true;
        btnSortearNumeros.textContent = 'Sorteando...';

        try {
            const response = await fetch('/api/sortear-numeros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minimo, maximo, quantidade, permitir_repetidos: permitirRepetidos })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarResultado(data.resultados, 'numero');
                adicionarHistorico('Números', data.resultados.join(', '));
            } else {
                mostrarErro(data.erro);
            }
        } catch (error) {
            mostrarErro('Erro de conexão. Tente novamente.');
        } finally {
            btnSortearNumeros.disabled = false;
            btnSortearNumeros.textContent = '🎯 Sortear';
        }
    });

    // Sortear Nomes
    btnSortearNomes.addEventListener('click', async () => {
        const nomes = getNomes();
        const quantidade = document.getElementById('nomes-quantidade').value;

        if (nomes.length === 0) {
            mostrarErro('Adicione nomes à lista antes de sortear.');
            return;
        }

        btnSortearNomes.disabled = true;
        btnSortearNomes.textContent = 'Sorteando...';

        try {
            const response = await fetch('/api/sortear-nomes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomes, quantidade })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarResultado(data.resultados, 'nome');
                adicionarHistorico('Nomes', data.resultados.join(', '));
            } else {
                mostrarErro(data.erro);
            }
        } catch (error) {
            mostrarErro('Erro de conexão. Tente novamente.');
        } finally {
            btnSortearNomes.disabled = false;
            btnSortearNomes.textContent = '🎯 Sortear';
        }
    });

    // Upload de arquivo
    uploadArea.addEventListener('click', () => {
        arquivoInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            processarArquivo(file);
        }
    });

    arquivoInput.addEventListener('change', () => {
        const file = arquivoInput.files[0];
        if (file) {
            processarArquivo(file);
        }
    });

    async function processarArquivo(file) {
        const formData = new FormData();
        formData.append('arquivo', file);

        try {
            const response = await fetch('/api/upload-nomes', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Adicionar nomes ao textarea
                const nomesAtuais = nomesTextarea.value.trim();
                const novosNomes = data.nomes.join('\n');

                if (nomesAtuais) {
                    nomesTextarea.value = nomesAtuais + '\n' + novosNomes;
                } else {
                    nomesTextarea.value = novosNomes;
                }

                mostrarUploadStatus(`✅ ${data.total} nomes carregados de "${file.name}"`, 'success');
                atualizarContadorNomes();
            } else {
                mostrarUploadStatus(`❌ ${data.erro}`, 'error');
            }
        } catch (error) {
            mostrarUploadStatus('❌ Erro ao processar arquivo.', 'error');
        }
    }

    function mostrarUploadStatus(mensagem, tipo) {
        uploadStatus.textContent = mensagem;
        uploadStatus.className = `upload-status ${tipo}`;
        uploadStatus.hidden = false;

        setTimeout(() => {
            uploadStatus.hidden = true;
        }, 5000);
    }

    // Contador de nomes
    nomesTextarea.addEventListener('input', atualizarContadorNomes);

    function atualizarContadorNomes() {
        const nomes = getNomes();
        nomesCounter.innerHTML = `<span>${nomes.length}</span> nomes na lista`;
    }

    function getNomes() {
        return nomesTextarea.value
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);
    }

    // Mostrar resultado
    function mostrarResultado(resultados, tipo) {
        resultadoConteudo.innerHTML = '';

        resultados.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = `resultado-item ${tipo === 'nome' ? 'nome' : ''}`;
            el.textContent = item;
            el.style.animationDelay = `${index * 0.1}s`;
            resultadoConteudo.appendChild(el);
        });

        ultimoResultado = resultados.join(', ');
        resultadoArea.hidden = false;

        // Scroll para resultado
        setTimeout(() => {
            resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function mostrarErro(mensagem) {
        resultadoConteudo.innerHTML = `<p style="color: var(--danger); font-weight: 500;">${mensagem}</p>`;
        resultadoArea.hidden = false;
    }

    // Copiar resultado
    btnCopiar.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(ultimoResultado);
            btnCopiar.textContent = '✅ Copiado!';
            setTimeout(() => {
                btnCopiar.textContent = '📋 Copiar Resultado';
            }, 2000);
        } catch (error) {
            // Fallback para navegadores que não suportam clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = ultimoResultado;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            btnCopiar.textContent = '✅ Copiado!';
            setTimeout(() => {
                btnCopiar.textContent = '📋 Copiar Resultado';
            }, 2000);
        }
    });

    // Novo sorteio
    btnNovoSorteio.addEventListener('click', () => {
        resultadoArea.hidden = true;
    });

    // Histórico
    function adicionarHistorico(tipo, resultado) {
        const agora = new Date();
        const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const data = agora.toLocaleDateString('pt-BR');

        historico.unshift({ tipo, resultado, hora, data });

        // Manter apenas os últimos 20
        if (historico.length > 20) {
            historico = historico.slice(0, 20);
        }

        localStorage.setItem('sorteio-historico', JSON.stringify(historico));
        renderHistorico();
    }

    function renderHistorico() {
        if (historico.length === 0) {
            historicoArea.hidden = true;
            return;
        }

        historicoArea.hidden = false;
        historicoLista.innerHTML = historico.map(item => `
            <div class="historico-item">
                <div class="historico-tipo">${item.tipo}</div>
                <div class="historico-resultado">${item.resultado}</div>
                <div class="historico-hora">${item.data} às ${item.hora}</div>
            </div>
        `).join('');
    }

    btnLimparHistorico.addEventListener('click', () => {
        historico = [];
        localStorage.removeItem('sorteio-historico');
        renderHistorico();
    });
});
