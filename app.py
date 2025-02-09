import pymysql.cursors
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

config = {
    "host": "localhost",
    "user": "root",
    "password": "Mysql102030", 
    "database": "projeto",
}

@app.route("/usuarios", methods=['GET'])
def listar_funcionarios():
    try:
        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()
        janelinha.execute("SELECT id, nome, email, role FROM usuarios")
        lista_de_funcionarios = janelinha.fetchall()
        print("Funcionários encontrados:", lista_de_funcionarios) 
        return jsonify(lista_de_funcionarios), 200
    except pymysql.MySQLError as e:
        print("Erro no banco de dados:", e) 
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()



@app.route("/recursos", methods=['GET'])
def buscar_veiculos():
    try:
        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()

        janelinha.execute("SELECT id, nome, descricao, status FROM recursos")
        veiculos = janelinha.fetchall()

        print("Veículos encontrados:", veiculos)

        if not veiculos:
            return jsonify({"error": "Nenhum veículo encontrado"}), 404

        for veiculo in veiculos:
            veiculo['status'] = 'Disponível' if veiculo['status'] == 'disponivel' else 'Em Uso'

        return jsonify(veiculos)

    except Exception as e:
        print(f"Erro ao buscar veículos: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/logs_acesso", methods=['GET'])
def listar_logs_acesso():
    try:
        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()
        janelinha.execute("""
            SELECT logs_acesso.id, usuarios.nome AS nome_usuario, logs_acesso.tipo_acesso, logs_acesso.data_acesso
            FROM logs_acesso
            JOIN usuarios ON logs_acesso.id_usuario = usuarios.id
        """)
        logs = janelinha.fetchall()
        
        logs = [{
            "id": log["id"],
            "nome_usuario": log["nome_usuario"],
            "tipo_acesso": log["tipo_acesso"],
            "data_acesso": log["data_acesso"].strftime("%d/%m/%Y %H:%M:%S") 
        } for log in logs]

        return jsonify(logs), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro ao carregar logs de acesso: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()


@app.route("/atividades_recursos", methods=['GET'])
def listar_atividades_recursos():
    try:
        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()
        janelinha.execute("""
            SELECT atividades_recursos.id, recursos.nome AS recurso, atividades_recursos.tipo_atividade, atividades_recursos.data_atividade
            FROM atividades_recursos
            JOIN recursos ON atividades_recursos.id_recursos = recursos.id
        """)
        atividades = janelinha.fetchall()
        return jsonify(atividades), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro ao carregar atividades de recursos: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()

@app.route("/usuarios/<int:id>", methods=['PUT'])
def editar_funcionario(id):
    try:
        dados = request.get_json()
        if not dados or "nome" not in dados or "email" not in dados or "role" not in dados:
            return jsonify({"error": "Dados inválidos ou incompletos!"}), 400

        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()

        janelinha.execute("SELECT id FROM usuarios WHERE id = %s", (id,))
        if not janelinha.fetchone():
            return jsonify({"error": "Funcionário não encontrado!"}), 404

        janelinha.execute(
            "UPDATE usuarios SET nome = %s, email = %s, role = %s WHERE id = %s",
            (dados["nome"], dados["email"], dados["role"], id)
        )
        conexao.commit()

        return jsonify({"mensagem": "Funcionário atualizado com sucesso!"}), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()


@app.route("/recursos/<int:id>", methods=['PUT'])
def alterar_status(id):
    try:
        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()

        janelinha.execute("SELECT * FROM recursos WHERE id = %s", (id,))
        recurso = janelinha.fetchone()
        if not recurso:
            return jsonify({"error": "Recurso não encontrado"}), 404

        print(f"Recurso encontrado: {recurso}")

        dados = request.get_json()
        novo_status = dados.get("status")

        if novo_status not in ["disponivel", "em uso", "manutencao"]:
            return jsonify({"error": "Status inválido"}), 400

        print(f"Atualizando status para: {novo_status}")
        janelinha.execute("UPDATE recursos SET status = %s WHERE id = %s", (novo_status, id))
        conexao.commit()

        return jsonify({"message": "Status atualizado com sucesso"}), 200

    except Exception as e:
        print(f"Erro: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        janelinha.close()
        conexao.close()
    
@app.route("/usuarios", methods=["POST"])
def adicionar_usuario():
    """Cadastro de um novo usuário."""
    try:
        dados = request.get_json()
        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")
        role = dados.get("role")

        if not nome or not email or not senha or not role:
            return jsonify({"error": "Todos os campos são obrigatórios!"}), 400

        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()
        janelinha.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if janelinha.fetchone():
            return jsonify({"error": "Usuário já cadastrado!"}), 409
        janelinha.execute("INSERT INTO usuarios (nome, email, senha, role) VALUES (%s, %s, %s, %s)", 
                          (nome, email, senha, role))
        conexao.commit()

        return jsonify({"message": "Usuário cadastrado com sucesso!"}), 201

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()


@app.route("/login", methods=["POST"])
def login():
    try:
        dados = request.get_json()
        print("🔍 Dados recebidos:", dados) 

        email = dados.get("email")
        senha = dados.get("senha")

        if not email or not senha:
            return jsonify({"error": "Email e senha são obrigatórios!"}), 400

        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()

        janelinha.execute("SELECT id, nome, email, role FROM usuarios WHERE email = %s AND senha = %s", (email, senha))
        usuario = janelinha.fetchone()

        if not usuario:
            return jsonify({"error": "Usuário não encontrado ou senha incorreta!"}), 401

        return jsonify({
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
            "role": usuario["role"]
        }), 200

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()

@app.route("/login", methods=["POST"])
def login_usuario():
    try:
        dados = request.get_json()
        print("🔍 Dados recebidos:", dados)

        email = dados.get("email")
        senha = dados.get("senha")

        if not email or not senha:
            return jsonify({"error": "Email e senha são obrigatórios!"}), 400

        conexao = pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)
        janelinha = conexao.cursor()

        janelinha.execute("SELECT id, nome, email, senha, role FROM usuarios WHERE email = %s", (email,))
        usuario = janelinha.fetchone()

        if not usuario or usuario["senha"] != senha:
            return jsonify({"error": "Usuário não encontrado ou senha incorreta!"}), 401

        return jsonify({
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
            "role": usuario["role"]
        }), 200

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    finally:
        if 'janelinha' in locals():
            janelinha.close()
        if 'conexao' in locals():
            conexao.close()


if __name__ == '__main__':
    app.run(debug=True)
