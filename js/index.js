$(document).ready(function () {
    var currentUrl = "https://swapi.dev/api/people"; // URL inicial
    var currentPage = 1;

    // Cargar la primera página de Pokémon al cargar la página
    getPokemonListV2(currentUrl, currentPage);

    // Manejo del click en los botones de paginación
    $(document).on("click", ".pagination .page-link", function (e) {
        e.preventDefault();

        // Verificar si es el botón de anterior o siguiente
        if ($(this).attr("aria-label") === "Previous") {
            if (currentPage > 1) {
                currentPage--;
            }
        } else if ($(this).attr("aria-label") === "Next") {
            currentPage++;
        } else {
            // Para el caso de los números
            currentPage = parseInt($(this).text());
        }

        // Llamar la función para cargar la nueva página
        getPokemonListV2(currentUrl, currentPage);
    });

    // Función para cargar la lista de Pokémon y manejar la paginación
    function getPokemonListV2(url, page) {
        var limit = 30; // Número de Pokémon por página (por defecto 20 en la API)
        var offset = (page - 1) * limit; // Calcular el offset para la paginación
        var apiUrl = `${url}?offset=${offset}&limit=${limit}`;

        $(".star-container").html("<img src='loading.gif' />"); // Mostrar loader

        $.ajax({
            url: apiUrl,
            method: "GET",
        }).done(function (resp) {
            setTimeout(function () {
                $(".star-container").html(""); // Limpiar el contenedor
                var listadoPokemon = resp.results;
                listadoPokemon.forEach(function (pokemon) {
                    var pokemonId = personaje.url.split("/")[5]; // ID del Pokémon
                    console.log("Character ID:", pokemonId);
                    var template = `
                        <div class="star">
                            <div>
                                <a type="button" class="btn btn-primary pokemon-btn" data-id="${pokemonId}" data-name="${pokemon.name}" data-bs-toggle="modal" data-bs-target="#modalDetail">
                                    <div class="card-body">
                                        <h5 class="card-title text-capitalize" style="text-align: center;">${personaje.name}</h5>
                                    </div>
                                </a>
                            </div>
                        </div>
                    `;
                    $(".star-container").append(template);
                });

                // Actualizar la paginación
                updatePagination(page);
            }, 1000);
        });
    }

    // Manejo del click en los Pokémon para abrir el modal y cargar sus detalles
    $(document).on("click", ".pokemon-btn", function () {
        var id = $(this).data("id");

        // Hacer una llamada AJAX para obtener los detalles del Pokémon
        $.ajax({
            url: `https://swapi.dev/api/people/${id}`,
            method: "GET",
        }).done(function (pokemonData) {
            // Insertar los detalles en el modal
            $("#pokemonName").text(pokemonData.name);
            $("#pokemonId").text(pokemonData.id);
            $("#pokemonImage").attr("src", pokemonData.sprites.front_default);
            $("#pokemonHeight").text(pokemonData.height);
            $("#pokemonWeight").text(pokemonData.weight);

            // Mostrar el modal
            $("#modalDetail").modal("show");
        });
    });

    // Función para actualizar la paginación
    function updatePagination(page) {
        var pagination = $(".pagination");

        // Limpiar los elementos de paginación anteriores
        pagination.html("");

        // Agregar botón de anterior
        pagination.append(`
            <li class="page-item ${page === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" aria-label="Previous">&laquo;</a>
            </li>`);

        // Mostrar hasta 5 páginas en la paginación
        for (var i = 1; i <= 5; i++) {
            pagination.append(`
                <li class="page-item ${i === page ? "active" : ""}">
                    <a class="page-link" href="#">${i}</a>
                </li>`);
        }

        // Agregar botón de siguiente
        pagination.append(`
            <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">&raquo;</a>
            </li>`);
    }
});
