# Este arquivo contém a estrutura de dados Python para os reagentes.
# No contexto de um projeto Flask (app.py), ele seria importado.

REAGENTS_DATA = [
    {
        "id": "1",
        "name": "Chumbo (II)",
        "formula": "Pb²⁺",
        "color_class": "reagent-blue",
        "description": "Cátion metálico pesado, forma precipitados característicos com diversos ânions.",
        "properties": ["Massa molar: 207.2 g/mol", "Estado: Cátion em solução aquosa", "Cor: Incolor em solução"],
        "reactions": [
            "Pb²⁺ + 2Cl⁻ → PbCl₂ (precipitado branco)",
            "Pb²⁺ + CrO₄²⁻ → PbCrO₄ (precipitado amarelo)",
            "Pb²⁺ + S²⁻ → PbS (precipitado preto)",
        ],
        "safety": "Tóxico por ingestão e inalação. Use luvas e trabalhe em capela.",
        "category": "cation",
    },
    {
        "id": "2",
        "name": "Cobre (II)",
        "formula": "Cu²⁺",
        "color_class": "reagent-orange",
        "description": "Cátion de transição que forma soluções azuis características.",
        "properties": ["Massa molar: 63.5 g/mol", "Estado: Cátion em solução aquosa", "Cor: Azul em solução aquosa"],
        "reactions": [
            "Cu²⁺ + 2OH⁻ → Cu(OH)₂ (precipitado azul)",
            "Cu²⁺ + 4NH₃ → [Cu(NH₃)₄]²⁺ (complexo azul intenso)",
            "Cu²⁺ + S²⁻ → CuS (precipitado preto)",
        ],
        "safety": "Irritante para pele e olhos. Use equipamento de proteção adequado.",
        "category": "cation",
    },
    {
        "id": "3",
        "name": "Cobalto (II)",
        "formula": "Co²⁺",
        "color_class": "reagent-red",
        "description": "Cátion de transição que apresenta cores variadas dependendo da coordenação.",
        "properties": ["Massa molar: 58.9 g/mol", "Estado: Cátion em solução aquosa", "Cor: Rosa em solução aquosa"],
        "reactions": [
            "Co²⁺ + 2OH⁻ → Co(OH)₂ (precipitado azul)",
            "Co²⁺ + 6NH₃ → [Co(NH₃)₆]²⁺ (complexo amarelo-marrom)",
            "Co²⁺ + S²⁻ → CoS (precipitado preto)",
        ],
        "safety": "Possível carcinogênico. Evite contato e inalação.",
        "category": "cation",
    },
    {
        "id": "4",
        "name": "Sódio",
        "formula": "Na⁺",
        "color_class": "reagent-yellow",
        "description": "Cátion alcalino muito solúvel, identificado por teste de chama amarela.",
        "properties": ["Massa molar: 23.0 g/mol", "Estado: Cátion em solução aquosa", "Teste de chama: Amarelo intenso"],
        "reactions": [
            "Na⁺ + Sb(OH)₆⁻ → NaSb(OH)₆ (precipitado branco)",
            "Teste de chama: Chama amarela característica",
            "Altamente solúvel em água",
        ],
        "safety": "Geralmente seguro em soluções diluídas. Use proteção básica.",
        "category": "cation",
    },
    {
        "id": "5",
        "name": "Potássio",
        "formula": "K⁺",
        "color_class": "reagent-purple",
        "description": "Cátion alcalino identificado por teste de chama violeta.",
        "properties": ["Massa molar: 39.1 g/mol", "Estado: Cátion em solução aquosa", "Teste de chama: Violeta"],
        "reactions": [
            "K⁺ + Na₃[Co(NO₂)₆] → K₂Na[Co(NO₂)₆] (precipitado amarelo)",
            "Teste de chama: Chama violeta característica",
            "Altamente solúvel em água",
        ],
        "safety": "Geralmente seguro em soluções diluídas. Use proteção básica.",
        "category": "cation",
    },
    {
        "id": "6",
        "name": "Ácido Clorídrico",
        "formula": "HCl",
        "color_class": "reagent-light-gray",
        "description": "Ácido forte usado para precipitação de cloretos insolúveis.",
        "properties": ["Concentração típica: 6M", "pH: < 1", "Estado: Solução aquosa"],
        "reactions": ["Precipita Ag⁺, Pb²⁺, Hg₂²⁺ como cloretos", "HCl + NaOH → NaCl + H₂O"],
        "safety": "Corrosivo. Use luvas, óculos e trabalhe em capela.",
        "category": "solvent",
    },
    {
        "id": "7",
        "name": "Hidróxido de Amônio",
        "formula": "NH₄OH",
        "color_class": "reagent-light-gray",
        "description": "Base fraca usada para precipitação de hidróxidos e formação de complexos.",
        "properties": ["Concentração típica: 6M", "pH: > 11", "Estado: Solução aquosa"],
        "reactions": ["Precipita hidróxidos de metais", "Forma complexos com Cu²⁺, Ag⁺, Zn²⁺"],
        "safety": "Irritante. Evite inalação. Use em capela.",
        "category": "solvent",
    },
    {
        "id": "8",
        "name": "Sulfeto de Hidrogênio",
        "formula": "H₂S",
        "color_class": "reagent-light-gray",
        "description": "Reagente para precipitação de sulfetos metálicos.",
        "properties": ["Estado: Gás dissolvido em água", "Odor: Ovos podres", "pH: Ácido"],
        "reactions": ["Precipita sulfetos de metais pesados", "H₂S + Pb²⁺ → PbS (preto)", "H₂S + Cu²⁺ → CuS (preto)"],
        "safety": "Extremamente tóxico. Use apenas em capela com ventilação adequada.",
        "category": "solvent",
    },
]

# Para simular o uso no frontend, criamos uma estrutura JSON que o JavaScript consumirá.
# Em um ambiente Flask, isso seria passado para o template ou servido por uma API.
import json
REAGENTS_JSON = json.dumps(REAGENTS_DATA)

# Categorias para os botões de filtro
CATEGORIES = [
    {"value": "all", "label": "Todos"},
    {"value": "cation", "label": "Cátions"},
    {"value": "anion", "label": "Ânions"},
    {"value": "indicator", "label": "Indicadores"},
    {"value": "solvent", "label": "Solventes"},
]
CATEGORIES_JSON = json.dumps(CATEGORIES)

# Exemplo de como você poderia usar isso no seu app.py (Flask)
# from flask import Flask, render_template
# from .reagentes_data import REAGENTS_DATA, CATEGORIES

# app = Flask(__name__)

# @app.route("/reagentes")
# def reagentes():
#     return render_template("reagentes.html", reagents=REAGENTS_DATA, categories=CATEGORIES)
