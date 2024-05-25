from flask import Flask, render_template, jsonify
import json
from flask import request

app = Flask(__name__)

# Маршрут для основной страницы
@app.route('/')
def index():
    with open('anime_final.json', 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Передаем данные в HTML шаблон
    return render_template('tcard.html', anime_data=data)



@app.route('/load_more_anime')
def load_more_anime():
    page = int(request.args.get('page', 0))
    per_page = int(request.args.get('per_page', 10))
    start = page * per_page
    end = start + per_page
    try:
        with open('anime_final.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
        # Добавляем уникальные идентификаторы к объектам аниме
        for idx, anime in enumerate(data):
            anime['id'] = idx + 1
        return jsonify(anime_data=data[start:end])
    except Exception as e:
        return jsonify(error=str(e))

@app.route('/anime/<int:anime_id>')
def anime_detail(anime_id):
    with open('anime_final.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Добавляем уникальные идентификаторы к объектам аниме
    for idx, anime in enumerate(data):
        anime['id'] = idx + 1

    anime = next((item for item in data if item['id'] == anime_id), None)
    if anime:
        return render_template('anime_detail.html', anime=anime)
    else:
        return "Anime not found", 404



@app.route('/search')
def search():
    search_text = request.args.get('text', '')

    # Открываем файл с данными аниме
    with open('anime_final.json', 'r', encoding='utf-8') as file:
        all_data = json.load(file)

    # Нормализуем текст поиска
    normalized_search_text = search_text.lower()

    # Фильтруем данные по введенному тексту поиска
    search_results = [anime for anime in all_data 
                      if normalized_search_text in anime['Short title'].lower()
                      or normalized_search_text in anime['Title'].lower()]

    # Возвращаем результаты поиска в формате JSON
    return jsonify(search_results=search_results)



if __name__ == "__main__":
    app.run(debug=True)