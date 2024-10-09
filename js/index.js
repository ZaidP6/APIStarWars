$(document).ready(function () {
    var currentUrl = "https://swapi.dev/api/people"; // URL inicial
    var currentPage = 1;

    // Cargar la primera página de personajes al cargar la página
    getCharacterList(currentUrl, currentPage);

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
        getCharacterList(currentUrl, currentPage);
    });

    // Función para cargar la lista de personajes
    function getCharacterList(url, page) {
        var limit = 82; // Número de personajes por página
        var apiUrl = `${url}?page=${page}`; // swapi usa paginación basada en 'page'

        $(".star-container").html("<img src='loading.gif' />"); // Mostrar loader

        $.ajax({
            url: apiUrl,
            method: "GET",
        }).done(function (resp) {
            setTimeout(function () {
                $(".star-container").html(""); // Limpiar el contenedor
                var listadoPersonajes = resp.results;
                listadoPersonajes.forEach(function (personaje) {
                    var personajeId = personaje.url.split("/")[5]; // ID del personaje
                    console.log("Character ID:", personajeId);
                    var template = `
                        <div class="star">
                            <div>
                                <a type="button" class="btn btn-danger personaje-btn btn-outline-light btn-lg" data-id="${personajeId}" data-name="${personaje.name}" data-bs-toggle="modal" data-bs-target="#modalDetail">
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
                updatePagination(page, resp.count);
            }, 1000);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("API request failed:", textStatus, errorThrown);
            $(".star-container").html("<p>Error al cargar los personajes.</p>"); // Mostrar mensaje de error
        });
    }

    // Manejo del click en los personajes para abrir el modal y cargar sus detalles
    $(document).on("click", ".personaje-btn", function () {
        var personajeId = $(this).data("id");

        // Hacer una llamada AJAX para obtener los detalles del personaje
        $.ajax({
            url: `https://swapi.dev/api/people/${personajeId}/`,
            method: "GET",
        }).done(function (personajeData) {
            // Obtener los nombres de las películas
            let filmPromises = personajeData.films.map(filmUrl => {
                return $.get(filmUrl).then(filmData => filmData.title);
            });

            // Obtener el nombre del planeta natal
            let homeworldPromise = $.get(personajeData.homeworld).then(homeworldData => homeworldData.name);

            // Obtener los nombres de las especies
            let speciesPromises = personajeData.species.map(speciesUrl => {
                return $.get(speciesUrl).then(speciesData => speciesData.name);
            });

            // Obtener los nombres de los vehículos
            let vehiclePromises = personajeData.vehicles.map(vehicleUrl => {
                return $.get(vehicleUrl).then(vehicleData => vehicleData.name);
            });

            // Obtener los nombres de las naves
            let starshipPromises = personajeData.starships.map(starshipUrl => {
                return $.get(starshipUrl).then(starshipData => starshipData.name);
            });

            // Esperar a que todas las promesas se resuelvan
            $.when(...filmPromises, homeworldPromise, ...speciesPromises, ...vehiclePromises, ...starshipPromises).done(function (...results) {
                // results contiene los títulos de las películas, el nombre del planeta, los nombres de las especies, los nombres de los vehículos y las naves
                let filmTitles = results.slice(0, filmPromises.length);
                let homeworldName = results[filmPromises.length];
                let speciesNames = results.slice(filmPromises.length + 1, filmPromises.length + 1 + speciesPromises.length);
                let vehicleNames = results.slice(filmPromises.length + 1 + speciesPromises.length, filmPromises.length + 1 + speciesPromises.length + vehiclePromises.length);
                let starshipNames = results.slice(filmPromises.length + 1 + speciesPromises.length + vehiclePromises.length);

                // Insertar los detalles en el modal
                $("#modalDetail .modal-title").text(personajeData.name);
                $("#modalDetail .modal-body").html(`
                    <div class="row">
                        <div class="col-md-6 border-end">
                            <p><strong>Altura:</strong> ${personajeData.height} cm</p>
                            <p><strong>Peso:</strong> ${personajeData.mass} kg</p>
                            <p><strong>Año Nacimiento:</strong> ${personajeData.birth_year}</p>
                            <p><strong>Género:</strong> ${personajeData.gender}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Planeta Natal:</strong> <span id="homeworldName">${homeworldName}</span></p>
                            <p><strong>Películas:</strong> <span id="filmList">${filmTitles.join(", ")}</span></p>
                            <p><strong>Especie:</strong> <span id="speciesName">${speciesNames.join(", ")}</span></p>
                            <p><strong>Vehículos:</strong> <span id="vehicleList">${vehicleNames.join(", ")}</span></p>
                            <p><strong>Naves:</strong> <span id="starshipList">${starshipNames.join(", ")}</span></p>
                        </div>
                    </div>
                `);

                // Mostrar el modal
                $("#modalDetail").modal("show");
            });
        }).fail(function () {
            alert("Error al cargar los detalles del personaje.");
        });
    });

    // Función para actualizar la paginación
    function updatePagination(page, totalCount) {
        var pagination = $(".pagination");
        var totalPages = Math.ceil(totalCount / 10); // swapi tiene 10 personajes por página

        // Limpiar los elementos de paginación anteriores
        pagination.html("");

        // Agregar botón de anterior
        pagination.append(`
            <li class="page-item ${page === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" aria-label="Previous">&laquo;</a>
            </li>
        `);

        // Mostrar hasta 5 páginas en la paginación
        for (var i = 1; i <= totalPages; i++) {
            pagination.append(`
                <li class="page-item ${i === page ? "active" : ""}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `);
        }

        // Agregar botón de siguiente
        pagination.append(`
            <li class="page-item ${page === totalPages ? "disabled" : ""}">
                <a class="page-link" href="#" aria-label="Next">&raquo;</a>
            </li>
        `);
    }
});
