## P Regen

Консольная утилита для регенерации кода проекта на основании декларации с сервера. 

Приложение обращается к серверу, генерирует сниппеты через подсистему codegen. Сниппеты сохраняются в файловую базу. Каждый сниппеты имеет конфигурацию в JSON файле. 

Алгоритм работы утилиты. 

Обрабатываем аргументы. Если справка / версия - выводим их. Иначе начинаем главный процесс. 

Грузим конфигурацию. Обрабатывать в конфигурации будем блок фрагментов. 

Для каждого фрагмента в цикле: загружаем его описание - api path для получения текущего кода с сервера. Папку где храним текущие версии фрагментов. Ссылку на файл с кодом. Идентификатор фрагмента. 

Загружаем файл с кодом. Находим фрагмент. Создаем в памяти образ фрагмента. Берем текущий фрагмент в базе, загружаем в память. Сравниваем фрагменты в коде и базе. Если не совпадают - то не обрабатываем файл.

Если фрагменты совпадают - можно спрашивать обновление. Делаем запрос на сервер с текущим статусом фрагмента. Если текущий отличается от базы - то будем обновлять. Сделаем новый идентификатор и сохраним его. Сохраним фрагмент в базу. Заменим фрагмент в коде и сохраним файл. 

Проект обработан. 

Итого - блоки функциональности: 
* Парсинг аргументов
* Вывод внрсии
* Вывод справки
* Обработка фрагмента
* Тестировать совпадение фрагментов
* Получить фрагмент из файла
* заменить фрагмент в файле
