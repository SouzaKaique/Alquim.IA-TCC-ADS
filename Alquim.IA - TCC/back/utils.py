import json
import os

# Define o caminho para o arquivo de dados dos reagentes
DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")

def carregar_dados_reagentes():
    """Carrega todos os dados de reagentes do arquivo JSON."""
    # Se o arquivo não existir ou estiver vazio, retorna um dicionário vazio
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        return {} 
    
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            # O arquivo deve conter um dicionário principal
            return json.load(f)
        except json.JSONDecodeError:
            # Em caso de JSON inválido, retorna vazio para evitar crash
            return {}

def salvar_dados_reagentes(dados):
    """Salva o dicionário de dados de reagentes no arquivo JSON."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)

# Adicionamos uma função auxiliar para gerar IDs únicos (bom para TCC)
def gerar_novo_id(lista_itens):
    """Gera um ID numérico único para um novo item em uma lista."""
    # Se a lista estiver vazia, retorna 1
    if not lista_itens:
        return 1
    # Pega o ID máximo existente e soma 1
    return max(item.get('id', 0) for item in lista_itens) + 1