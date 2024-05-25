const btn = document.getElementById('genre-btn');
const dropdown = document.getElementById('drop');
let selectedGenres = [];

if (btn && dropdown) {
    btn.addEventListener('click', () => {
        if (dropdown.classList.contains('hide')) {
            dropdown.classList.remove('hide');
            dropdown.classList.toggle('showb');
        } else if (dropdown.classList.contains('showb')) {
            dropdown.classList.remove('showb');
            dropdown.classList.toggle('hide');
        }
    });
}

let anims = document.getElementsByClassName("anims");
Array.from(anims).forEach(function (anim) {
    anim.addEventListener("mouseenter", function () {
        anim.style.opacity = 0.7;
    });
    anim.addEventListener("mouseleave", function () {
        anim.style.opacity = 1;
    });
});

let opts = document.getElementsByClassName("opt");
Array.from(opts).forEach((opt) => {
    let isClicked = false;
    let parent = opt.parentNode;

    opt.addEventListener("click", (e) => {
        if (isClicked === true) {
            opt.style.border = "1px solid transparent";
            isClicked = false;
            parent.appendChild(opt);
            selectedGenres = selectedGenres.filter(genre => genre !== opt.innerHTML);
        } else {
            opt.style.border = "1px solid black";
            isClicked = true;
            parent.insertBefore(opt, parent.firstChild);
            if (!selectedGenres.includes(opt.innerHTML)) {
                selectedGenres.push(opt.innerHTML);
            }
        }
        // Переместили вызов updateAnimeList() сюда
        updateAnimeList();
    });
});

// Функция обновления списка аниме при изменении выбранных жанров
function updateAnimeList() {
    console.log("Updating anime list...");

    // Очищаем список аниме перед загрузкой новых данных
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = '';

    // Создаем запрос к серверу
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log('Received anime data:', data); // Выводим данные аниме в консоль
                appendAnimeToPage(data.anime_data); // Обновляем список аниме на странице
            } else {
                console.error('Error loading anime data:', xhr.status);
            }
        }
    };

    // Получаем текущий номер страницы
    const currentPage = parseInt(document.getElementById('page-number').textContent);

    // Формируем URL-адрес запроса с параметрами "page", "per_page" и "genres"
    const perPage = 10; // Количество аниме на странице
    const genresParam = selectedGenres.join(',');
    xhr.open('GET', `/load_more_anime?page=${currentPage - 1}&per_page=${perPage}&genres=${encodeURIComponent(genresParam)}`, true);
    xhr.send();

    // Выводим выбранные жанры и номер страницы в консоль
    console.log('Selected genres:', selectedGenres);
    console.log('Current page:', currentPage);
}

// Функция для обновления размера выпадающего меню жанров при изменении размера окна
const dropdownBtn = document.querySelector('.genre-btn');
const dropdownMenu = document.querySelector('.dropdown');
if (dropdownBtn && dropdownMenu) {
    dropdownMenu.style.width = dropdownBtn.offsetWidth - 23 + 'px';

    window.addEventListener('resize', () => {
        dropdownMenu.style.width = dropdownBtn.offsetWidth - 20 + 'px';
    });
}

// Пагинация
let currentPage = 1;

const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

if (prevPageBtn && nextPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePageNumber(); // Сначала обновляем номер страницы
            updateAnimeList(); // Затем загружаем новые данные
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        updatePageNumber(); // Сначала обновляем номер страницы
        updateAnimeList(); // Затем загружаем новые данные
    });
}

function updatePageNumber() {
    const pageNumber = document.getElementById('page-number');
    if (pageNumber) {
        pageNumber.textContent = currentPage;
    }
}

// Функция для обновления интерфейса с результатами поиска
function updateSearchResults(results) {
    const searchResults = document.getElementById('search-results');
    // Очищаем контейнер для результатов перед обновлением
    if (searchResults) {
        searchResults.innerHTML = '';

        // Проверяем, есть ли результаты поиска
        if (results && results.length > 0) {
            // Показываем контейнер с результатами поиска
            searchResults.style.display = 'block';

            // Создаем элементы списка для каждого результата поиска
            results.forEach(result => {
                const listItem = document.createElement('li');
                // Предположим, что название аниме может находиться в свойстве 'Title' или 'Short Title'
                const animeTitle = result['Title'] || result['Short title'];
                listItem.textContent = animeTitle;
                // Добавляем обработчик события клика на элемент списка для выбора аниме
                listItem.addEventListener('click', () => {
                    document.getElementById('search-input').value = animeTitle; // Заполнение поля поиска выбранным аниме
                    searchResults.style.display = 'none'; // Скрытие выпадающего списка
                });
                searchResults.appendChild(listItem);
            });
        } else {
            // Скрываем контейнер, если результаты поиска отсутствуют
            searchResults.style.display = 'none';
        }
    }
}

// Обработчик ввода текста в поле поиска
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value;
        if (searchText.trim() !== '') {
            // Отправляем запрос на сервер для поиска аниме по введенному тексту
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        updateSearchResults(data.search_results); // Обновляем результаты поиска
                    } else {
                        console.error('Error searching anime:', xhr.status);
                    }
                }
            };
            xhr.open('GET', `/search?text=${encodeURIComponent(searchText)}`, true);
            xhr.send();
        } else {
            // Если поле поиска пустое, скрываем выпадающее меню
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }
    });
}