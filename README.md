# 🎲 Sorteio Online

Aplicação web para realizar sorteios de forma rápida, justa e transparente. Permite sortear números aleatórios ou nomes de pessoas, com opção de importar listas a partir de arquivos.

## 🌐 Acesso

**Site publicado no Render:** [https://sorteio-online.onrender.com](https://sorteio-online.onrender.com)

> O primeiro acesso pode levar alguns segundos caso o servidor esteja inativo (plano gratuito do Render).

---

## ✨ Funcionalidades

### 🔢 Sorteio de Números
- Definir intervalo mínimo e máximo
- Escolher quantidade de números a sortear
- Opção de permitir ou não números repetidos

### 👥 Sorteio de Nomes
- Digitar nomes manualmente (um por linha)
- Importar nomes de arquivos `.txt` ou `.csv`
- Arrastar e soltar arquivos na área de upload
- Escolher quantos nomes sortear da lista

### 📋 Recursos Adicionais
- **Copiar resultado** — copia o resultado para a área de transferência com um clique
- **Histórico** — salva os últimos 20 sorteios no navegador (localStorage)
- **Design responsivo** — funciona perfeitamente em desktop e celular
- **Animações** — resultados aparecem com animação para dar destaque ao momento do sorteio

---

## 🛠️ Tecnologias

| Camada    | Tecnologia         |
|-----------|-------------------|
| Backend   | Python + Flask    |
| Frontend  | HTML, CSS, JavaScript |
| Deploy    | Render            |
| Servidor  | Gunicorn          |

---

## 📁 Estrutura do Projeto

```
sorteio/
├── app.py              # Servidor Flask (API + rotas)
├── requirements.txt    # Dependências Python
├── Procfile            # Comando de inicialização (Render/Heroku)
├── render.yaml         # Configuração de deploy no Render
├── .gitignore          # Arquivos ignorados pelo Git
├── templates/
│   └── index.html      # Página principal
└── static/
    ├── styles.css      # Estilos (design moderno)
    └── app.js          # Lógica do frontend
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes)

### Passos

```bash
# Clonar o repositório
git clone https://github.com/monica1602/sitesorteio.git
cd sitesorteio

# Instalar dependências
pip install -r requirements.txt

# Rodar o servidor
python app.py
```

Acesse **http://localhost:5000** no navegador.

---

## 🌍 Deploy no Render

O projeto está configurado para deploy automático no [Render](https://render.com):

### Como fazer deploy

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **New > Web Service**
3. Conecte o repositório GitHub `monica1602/sitesorteio`
4. O Render detecta automaticamente as configurações via `render.yaml`:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Selecione o plano **Free**
6. Clique em **Deploy**

O site estará disponível em poucos minutos.

### Deploy automático

Toda vez que um novo commit for enviado para a branch `main`, o Render faz o redeploy automaticamente.

---

## 📡 API Endpoints

| Método | Rota                  | Descrição                          |
|--------|----------------------|-------------------------------------|
| GET    | `/`                  | Página principal                    |
| POST   | `/api/sortear-numeros` | Sorteia números no intervalo dado |
| POST   | `/api/sortear-nomes`   | Sorteia nomes de uma lista        |
| POST   | `/api/upload-nomes`    | Processa arquivo com nomes        |

### Exemplo — Sortear números

```json
POST /api/sortear-numeros
{
  "minimo": 1,
  "maximo": 100,
  "quantidade": 5,
  "permitir_repetidos": false
}
```

**Resposta:**
```json
{
  "resultados": [42, 7, 88, 15, 63]
}
```

### Exemplo — Sortear nomes

```json
POST /api/sortear-nomes
{
  "nomes": ["Ana", "Bruno", "Carlos", "Diana", "Eduardo"],
  "quantidade": 2
}
```

**Resposta:**
```json
{
  "resultados": ["Diana", "Bruno"]
}
```

---

## 📄 Formatos de Arquivo Aceitos

Para importar nomes via upload:

- **`.txt`** — um nome por linha
- **`.csv`** — um nome por linha ou separados por vírgula

Exemplo de arquivo `participantes.txt`:
```
João Silva
Maria Santos
Pedro Oliveira
Ana Costa
Lucas Ferreira
```

---

## 📝 Licença

Este projeto é de uso livre para fins educacionais e pessoais.

---

Feito com 💜 por [monica1602](https://github.com/monica1602)
