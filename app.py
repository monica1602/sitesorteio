from flask import Flask, render_template, request, jsonify
import random
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max upload

ALLOWED_EXTENSIONS = {'txt', 'csv'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/sortear-numeros', methods=['POST'])
def sortear_numeros():
    data = request.get_json()
    minimo = data.get('minimo', 1)
    maximo = data.get('maximo', 100)
    quantidade = data.get('quantidade', 1)
    permitir_repetidos = data.get('permitir_repetidos', False)

    try:
        minimo = int(minimo)
        maximo = int(maximo)
        quantidade = int(quantidade)
    except (ValueError, TypeError):
        return jsonify({'erro': 'Valores inválidos'}), 400

    if minimo > maximo:
        return jsonify({'erro': 'O valor mínimo deve ser menor que o máximo'}), 400

    if not permitir_repetidos and quantidade > (maximo - minimo + 1):
        return jsonify({'erro': 'Quantidade maior que o intervalo disponível sem repetição'}), 400

    if quantidade < 1 or quantidade > 1000:
        return jsonify({'erro': 'Quantidade deve ser entre 1 e 1000'}), 400

    if permitir_repetidos:
        resultados = [random.randint(minimo, maximo) for _ in range(quantidade)]
    else:
        resultados = random.sample(range(minimo, maximo + 1), quantidade)

    return jsonify({'resultados': resultados})


@app.route('/api/sortear-nomes', methods=['POST'])
def sortear_nomes():
    data = request.get_json()
    nomes = data.get('nomes', [])
    quantidade = data.get('quantidade', 1)

    if not nomes:
        return jsonify({'erro': 'Nenhum nome fornecido'}), 400

    # Filtrar nomes vazios
    nomes = [n.strip() for n in nomes if n.strip()]

    if not nomes:
        return jsonify({'erro': 'Nenhum nome válido fornecido'}), 400

    try:
        quantidade = int(quantidade)
    except (ValueError, TypeError):
        return jsonify({'erro': 'Quantidade inválida'}), 400

    if quantidade < 1:
        return jsonify({'erro': 'Quantidade deve ser pelo menos 1'}), 400

    if quantidade > len(nomes):
        return jsonify({'erro': f'Quantidade ({quantidade}) maior que o número de nomes ({len(nomes)})'}), 400

    sorteados = random.sample(nomes, quantidade)
    return jsonify({'resultados': sorteados})


@app.route('/api/upload-nomes', methods=['POST'])
def upload_nomes():
    if 'arquivo' not in request.files:
        return jsonify({'erro': 'Nenhum arquivo enviado'}), 400

    arquivo = request.files['arquivo']

    if arquivo.filename == '':
        return jsonify({'erro': 'Nenhum arquivo selecionado'}), 400

    if not allowed_file(arquivo.filename):
        return jsonify({'erro': 'Tipo de arquivo não permitido. Use .txt ou .csv'}), 400

    try:
        conteudo = arquivo.read().decode('utf-8')
        # Separar por linhas ou vírgulas
        if ',' in conteudo and '\n' not in conteudo:
            nomes = [n.strip() for n in conteudo.split(',') if n.strip()]
        else:
            nomes = [n.strip() for n in conteudo.splitlines() if n.strip()]

        return jsonify({'nomes': nomes, 'total': len(nomes)})
    except UnicodeDecodeError:
        try:
            arquivo.seek(0)
            conteudo = arquivo.read().decode('latin-1')
            if ',' in conteudo and '\n' not in conteudo:
                nomes = [n.strip() for n in conteudo.split(',') if n.strip()]
            else:
                nomes = [n.strip() for n in conteudo.splitlines() if n.strip()]
            return jsonify({'nomes': nomes, 'total': len(nomes)})
        except Exception:
            return jsonify({'erro': 'Erro ao ler o arquivo'}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
