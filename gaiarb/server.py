# ═══════════════════════════════════════════════
# GAIARB – BACKEND SERVER (FLASK / MYSQL / SQLITE)
# ═══════════════════════════════════════════════

import os
import json
import sqlite3
import hashlib
import decimal
import datetime
from flask import Flask, request, jsonify, send_from_directory
try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False
import mysql.connector

app = Flask(__name__, static_folder='.', static_url_path='')
if has_cors:
    CORS(app)

MYSQL_ACTIVE = False
DB_FILE = 'gaiarb.db'

def get_connection():
    if MYSQL_ACTIVE:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="C@ua0211",
            database="bd_teste_01"
        )
    else:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn

def run_db_query(query, params=None):
    if params is None:
        params = ()
    
    if MYSQL_ACTIVE:
        query = query.replace('?', '%s')
        
    conn = get_connection()
    try:
        if MYSQL_ACTIVE:
            cursor = conn.cursor(dictionary=True)
        else:
            cursor = conn.cursor()
            
        cursor.execute(query, params)
        if query.strip().upper().startswith('SELECT'):
            rows = cursor.fetchall()
            if not MYSQL_ACTIVE:
                return [dict(row) for row in rows]
            return rows
        else:
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()

def init_db():
    global MYSQL_ACTIVE
    # 1. Try MySQL Connection via mysql.connector
    try:
        print("Attempting to connect to MySQL database 'bd_teste_01' on localhost...")
        # Connect without database first to create it if it doesn't exist
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="C@ua0211"
        )
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS bd_teste_01")
        conn.commit()
        conn.close()
        
        # Connect to target database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="C@ua0211",
            database="bd_teste_01"
        )
        cursor = conn.cursor()
        
        # Create admins
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nome VARCHAR(100) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create voluntarios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS voluntarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                whatsapp VARCHAR(30) NOT NULL,
                area VARCHAR(100) NOT NULL,
                disponibilidade VARCHAR(100) NOT NULL,
                mensagem TEXT,
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create doacoes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS doacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                valor DECIMAL(10,2) NOT NULL,
                data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                tipo VARCHAR(20) DEFAULT 'PIX',
                status VARCHAR(20) DEFAULT 'Pendente'
            )
        """)
        
        # Create equipe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS equipe (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero VARCHAR(10),
                nome VARCHAR(100) NOT NULL,
                cargo VARCHAR(100) NOT NULL,
                bio TEXT,
                ordem INTEGER DEFAULT 0
            )
        """)
        
        # Seed default admin if empty
        cursor.execute("SELECT COUNT(*) FROM admins")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO admins (username, password_hash, nome) 
                VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador GAIARB')
            """)
            
        # Seed team if empty
        cursor.execute("SELECT COUNT(*) FROM equipe")
        if cursor.fetchone()[0] == 0:
            members = [
                ('01', 'Ayla de Cássia Franco Bragança', 'Presidente(a)', 'Fundadora do GAIARB, dedicou sua vida ao acolhimento. Lidera o projeto com amor e determinação.', 1),
                ('02', 'Daniele dos Santos Charré Duarte', 'Vice-Presidente(a)', 'Bio dela', 2),
                ('03', 'Danielle de Moraes Góis Diniz', 'Tesoureiro(a)', 'Bio dela', 3),
                ('04', 'Alan Macedo Santos', 'Tesoureiro Adjunto', 'Bio dele', 4),
                ('05', 'Renata Maçulo Quintanilha Pimentel', 'Secretário(a)', 'Bio dela', 5),
                ('06', 'Letícia da Silva Moreira Franco', 'Secretário Adjunto(a)', 'Bio dela', 6)
            ]
            for m in members:
                cursor.execute("""
                    INSERT INTO equipe (numero, nome, cargo, bio, ordem) 
                    VALUES (%s, %s, %s, %s, %s)
                """, m)
        
        conn.commit()
        conn.close()
        MYSQL_ACTIVE = True
        print("Successfully initialized and configured MySQL via mysql.connector!")
        return
    except Exception as e:
        print(f"MySQL initialization failed: {e}. Falling back to SQLite.")
        MYSQL_ACTIVE = False
        
    # 2. SQLite Fallback Setup
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nome VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS voluntarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            whatsapp VARCHAR(30) NOT NULL,
            area VARCHAR(100) NOT NULL,
            disponibilidade VARCHAR(100) NOT NULL,
            mensagem TEXT,
            data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            valor DECIMAL(10,2) NOT NULL,
            data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            tipo VARCHAR(20) DEFAULT 'PIX',
            status VARCHAR(20) DEFAULT 'Pendente'
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipe (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero VARCHAR(10),
            nome VARCHAR(100) NOT NULL,
            cargo VARCHAR(100) NOT NULL,
            bio TEXT,
            ordem INTEGER DEFAULT 0
        )
    """)
    
    # Seed default admin if empty
    cursor.execute("SELECT COUNT(*) FROM admins")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO admins (username, password_hash, nome) 
            VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador GAIARB')
        """)
        
    # Seed team if empty
    cursor.execute("SELECT COUNT(*) FROM equipe")
    if cursor.fetchone()[0] == 0:
        members = [
            ('01', 'Ayla de Cássia Franco Bragança', 'Presidente(a)', 'Fundadora do GAIARB, dedicou sua vida ao acolhimento. Lidera o projeto com amor e determinação.', 1),
            ('02', 'Daniele dos Santos Charré Duarte', 'Vice-Presidente(a)', 'Bio dela', 2),
            ('03', 'Danielle de Moraes Góis Diniz', 'Tesoureiro(a)', 'Bio dela', 3),
            ('04', 'Alan Macedo Santos', 'Tesoureiro Adjunto', 'Bio dele', 4),
            ('05', 'Renata Maçulo Quintanilha Pimentel', 'Secretário(a)', 'Bio dela', 5),
            ('06', 'Letícia da Silva Moreira Franco', 'Secretário Adjunto(a)', 'Bio dela', 6)
        ]
        for m in members:
            cursor.execute("""
                INSERT INTO equipe (numero, nome, cargo, bio, ordem) 
                VALUES (?, ?, ?, ?, ?)
            """, m)
            
    conn.commit()
    conn.close()
    MYSQL_ACTIVE = False
    print("Successfully initialized and configured local SQLite fallback!")

# ── FLASK STATIC WEB SERVING ──────────────────
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

# ── API ENDPOINTS ─────────────────────────────

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password') or data.get('senha')
    
    if not username or not password:
        return jsonify({"success": False, "error": "Usuário e senha são obrigatórios"}), 400
        
    pwd_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    users = run_db_query("SELECT id, username, nome FROM admins WHERE username = ? AND password_hash = ?", (username, pwd_hash))
    if users:
        return jsonify({
            "success": True,
            "token": "gaiarb-admin-simulated-token",
            "admin": {
                "nome": users[0]['nome'],
                "username": users[0]['username']
            }
        })
    return jsonify({"success": False, "error": "Credenciais inválidas"}), 401

@app.route('/api/voluntario/login', methods=['POST'])
def voluntario_login():
    data = request.json or {}
    email = data.get('email')
    whatsapp = data.get('whatsapp')
    
    if not email or not whatsapp:
        return jsonify({"success": False, "error": "E-mail e WhatsApp são obrigatórios"}), 400
        
    vols = run_db_query("SELECT * FROM voluntarios WHERE email = ? AND whatsapp = ?", (email, whatsapp))
    if vols:
        vol = vols[0]
        # Format date for JSON
        if 'data_cadastro' in vol and isinstance(vol['data_cadastro'], datetime.datetime):
            vol['data_cadastro'] = vol['data_cadastro'].isoformat()
        return jsonify({
            "success": True,
            "token": "gaiarb-vol-simulated-token",
            "voluntario": vol
        })
    return jsonify({"success": False, "error": "Voluntário não encontrado."}), 404

@app.route('/api/voluntario/update', methods=['POST'])
def voluntario_update():
    data = request.json or {}
    vid = data.get('id')
    nome = data.get('nome')
    email = data.get('email')
    whatsapp = data.get('whatsapp')
    area = data.get('area')
    disp = data.get('disponibilidade')
    msg = data.get('mensagem')
    
    if not vid or not nome or not email or not whatsapp:
        return jsonify({"success": False, "error": "Campos obrigatórios ausentes"}), 400
        
    run_db_query(
        "UPDATE voluntarios SET nome=?, email=?, whatsapp=?, area=?, disponibilidade=?, mensagem=? WHERE id=?",
        (nome, email, whatsapp, area, disp, msg, vid)
    )
    return jsonify({"success": True})

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    try:
        vols_count = run_db_query("SELECT COUNT(*) as count FROM voluntarios")[0]['count']
        doacoes_stats = run_db_query("SELECT COUNT(*) as count, SUM(valor) as total FROM doacoes")[0]
        d_qty = doacoes_stats['count']
        d_val = doacoes_stats['total'] if doacoes_stats['total'] is not None else 0.0
        
        areas_dist = run_db_query("SELECT area, COUNT(*) as quantidade FROM voluntarios GROUP BY area ORDER BY quantidade DESC")
        
        return jsonify({
            "voluntarios_qtd": vols_count,
            "doacoes_qtd": d_qty,
            "doacoes_valor": float(d_val),
            "areas_dist": areas_dist
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/voluntarios', methods=['GET'])
def get_voluntarios_admin():
    try:
        vols = run_db_query("SELECT * FROM voluntarios ORDER BY data_cadastro DESC")
        for v in vols:
            if 'data_cadastro' in v and isinstance(v['data_cadastro'], datetime.datetime):
                v['data_cadastro'] = v['data_cadastro'].isoformat()
        return jsonify(vols)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/doacoes', methods=['GET'])
def get_doacoes_admin():
    try:
        doacoes = run_db_query("SELECT * FROM doacoes ORDER BY data_doacao DESC")
        for d in doacoes:
            if 'valor' in d and d['valor'] is not None:
                d['valor'] = float(d['valor'])
            if 'data_doacao' in d and isinstance(d['data_doacao'], datetime.datetime):
                d['data_doacao'] = d['data_doacao'].isoformat()
        return jsonify(doacoes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/equipe', methods=['GET'])
def get_equipe():
    try:
        members = run_db_query("SELECT * FROM equipe ORDER BY ordem ASC")
        return jsonify(members)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── POST ENDPOINTS (PUBLIC) ───────────────────

@app.route('/api/voluntarios', methods=['POST'])
def register_voluntario():
    data = request.json or {}
    nome = data.get('nome')
    email = data.get('email')
    whatsapp = data.get('whatsapp')
    area = data.get('area')
    disp = data.get('disponibilidade')
    msg = data.get('mensagem')
    
    if not nome or not email or not whatsapp:
        return jsonify({"error": "Nome, e-mail e WhatsApp são obrigatórios"}), 400
        
    last_id = run_db_query(
        "INSERT INTO voluntarios (nome, email, whatsapp, area, disponibilidade, mensagem) VALUES (?, ?, ?, ?, ?, ?)",
        (nome, email, whatsapp, area, disp, msg)
    )
    return jsonify({"success": True, "id": last_id})

@app.route('/api/doacoes', methods=['POST'])
def register_doacao():
    data = request.json or {}
    valor = data.get('valor')
    tipo = data.get('tipo', 'PIX')
    status = data.get('status', 'Pendente')
    
    if valor is None:
        return jsonify({"error": "Valor é obrigatório"}), 400
        
    last_id = run_db_query(
        "INSERT INTO doacoes (valor, tipo, status) VALUES (?, ?, ?)",
        (valor, tipo, status)
    )
    return jsonify({"success": True, "id": last_id})

# ── CRUD ENDPOINTS (DESKTOP GUI CLIENT / ADMIN ACCESS) ──

@app.route('/api/voluntarios/<int:vid>', methods=['DELETE'])
def delete_voluntario(vid):
    run_db_query("DELETE FROM voluntarios WHERE id = ?", (vid,))
    return jsonify({"success": True, "message": "Voluntário deletado."})

@app.route('/api/doacoes/<int:did>', methods=['DELETE'])
def delete_doacao(did):
    run_db_query("DELETE FROM doacoes WHERE id = ?", (did,))
    return jsonify({"success": True, "message": "Doação deletada."})

@app.route('/api/equipe', methods=['POST'])
def add_equipe():
    data = request.json or {}
    numero = data.get('numero')
    nome = data.get('nome')
    cargo = data.get('cargo')
    bio = data.get('bio', '')
    ordem = data.get('ordem', 0)
    
    if not nome or not cargo:
        return jsonify({"error": "Nome e cargo são obrigatórios"}), 400
        
    last_id = run_db_query(
        "INSERT INTO equipe (numero, nome, cargo, bio, ordem) VALUES (?, ?, ?, ?, ?)",
        (numero, nome, cargo, bio, ordem)
    )
    return jsonify({"success": True, "id": last_id})

@app.route('/api/equipe/<int:eid>', methods=['DELETE'])
def delete_equipe(eid):
    run_db_query("DELETE FROM equipe WHERE id = ?", (eid,))
    return jsonify({"success": True, "message": "Membro da equipe deletado."})

if __name__ == '__main__':
    init_db()
    # Run server on port 8000
    app.run(host='0.0.0.0', port=8000, debug=True)
