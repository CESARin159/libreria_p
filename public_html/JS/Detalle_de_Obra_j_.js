// Detalle_de_Obra_j_.js
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID del libro de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id') || 1; // Por defecto mostrar el libro con ID 1
    
    // Elementos del DOM
    const bookTitle = document.getElementById('book-title');
    const bookAuthor = document.getElementById('book-author');
    const bookIsbn = document.getElementById('book-isbn');
    const bookLanguage = document.getElementById('book-language');
    const bookTopic = document.getElementById('book-topic');
    const bookYear = document.getElementById('book-year');
    const bookPages = document.getElementById('book-pages');
    const bookPublisher = document.getElementById('book-publisher');
    const bookDescription = document.getElementById('book-description-text');
    const bookImage = document.getElementById('book-image');
    const availabilityStatus = document.getElementById('availability-status');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    const loanBtn = document.getElementById('loan-btn');
    const reserveBtn = document.getElementById('reserve-btn');
    const backBtn = document.getElementById('back-btn');
    
    // Datos de ejemplo (en un sistema real, estos vendrían de una API)
    const books = {
        1: {
            id: 1,
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            isbn: "9788437604947",
            language: "Español",
            topic: "Ficción",
            year: 1967,
            pages: 471,
            publisher: "Editorial Sudamericana",
            description: "Una novela emblemática del realismo mágico que relata la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. La obra es considerada una de las más importantes de la literatura hispanoamericana y universal.",
            available: true,
            image: "../IMG/cien_años.jpg",
            type: "regular"
        },
        2: {
            id: 2,
            title: "El Quijote de la Mancha",
            author: "Miguel de Cervantes",
            isbn: "9788467038878",
            language: "Español",
            topic: "Clásico",
            year: 1605,
            pages: 863,
            publisher: "Francisco de Robles",
            description: "La obra cumbre de la literatura española y una de las más traducidas de la historia. Narra las aventuras de Alonso Quijano, un hidalgo que enloquece leyendo libros de caballerías y decide convertirse en caballero andante.",
            available: false,
            image: "../IMG/don_quijote.jpg",
            type: "special"
        },
        3: {
            id: 3,
            title: "1984",
            author: "George Orwell",
            isbn: "9788499890944",
            language: "Inglés",
            topic: "Ciencia Ficción",
            year: 1949,
            pages: 326,
            publisher: "Secker & Warburg",
            description: "Una distopía que explora temas de vigilancia gubernamental y control social. La novela introduce conceptos como el Gran Hermano, la Policía del Pensamiento y la neolengua.",
            available: true,
            image: "../IMG/1984.jpg",
            type: "regular"
        }
    };
    
    // Libros relacionados (por área temática)
    const relatedBooks = [
        {
            id: 4,
            title: "La casa de los espíritus",
            author: "Isabel Allende",
            image: "../IMG/La_casa_es.jpg"
        },
        {
            id: 5,
            title: "Rayuela",
            author: "Julio Cortázar",
            image: "../IMG/rayuela.jpeg"
        },
        {
            id: 6,
            title: "Pedro Páramo",
            author: "Juan Rulfo",
            image: "../IMG/paramo.jpg"
        }
    ];
    
    // Cargar datos del libro
    function loadBookData() {
        const book = books[bookId];
        
        if (!book) {
            // Si no se encuentra el libro, redirigir al catálogo
            window.location.href = '../HTML/index.html';
            return;
        }
        
        // Actualizar la página con los datos del libro
        bookTitle.textContent = book.title;
        bookAuthor.textContent = book.author;
        bookIsbn.textContent = book.isbn;
        bookLanguage.textContent = book.language;
        bookTopic.textContent = book.topic;
        bookYear.textContent = book.year;
        bookPages.textContent = book.pages;
        bookPublisher.textContent = book.publisher;
        bookDescription.textContent = book.description;
        bookImage.src = book.image;
        bookImage.alt = `Portada de ${book.title}`;
        breadcrumbTitle.textContent = book.title;
        
        // Actualizar estado de disponibilidad
        if (book.available) {
            availabilityStatus.textContent = 'Disponible para préstamo';
            availabilityStatus.className = 'availability-status available';
            reserveBtn.style.display = 'none'; // Ocultar botón de reserva si está disponible
        } else {
            availabilityStatus.textContent = 'No disponible - Actualmente prestado';
            availabilityStatus.className = 'availability-status unavailable';
            loanBtn.style.display = 'none'; // Ocultar botón de préstamo si no está disponible
        }
        
        // Actualizar título de la página
        document.title = `${book.title} - Ediciones Saberum`;
    }
    
    // Cargar libros relacionados
    function loadRelatedBooks() {
        const container = document.getElementById('related-books-container');
        container.innerHTML = '';
        
        relatedBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'related-book-card';
            bookCard.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            `;
            
            bookCard.addEventListener('click', function() {
                window.location.href = `../HTML/Detalle_de_Obra.html?id=${book.id}`;
            });
            
            container.appendChild(bookCard);
        });
    }
    
    // Configurar eventos de los botones
    function setupEventListeners() {
        // Botón de préstamo
        loanBtn.addEventListener('click', function() {
            // Verificar si el usuario está logueado (en un sistema real)
            const isLoggedIn = checkUserLogin(); // Función simulada
            
            if (isLoggedIn) {
                window.location.href = `../HTML/Solicitud_de_Préstamo.html?bookId=${bookId}`;
            } else {
                showLoginModal();
            }
        });
        
        // Botón de reserva
        reserveBtn.addEventListener('click', function() {
            const isLoggedIn = checkUserLogin();
            
            if (isLoggedIn) {
                reserveBook();
            } else {
                showLoginModal();
            }
        });
        
        // Botón de volver
        backBtn.addEventListener('click', function() {
            window.location.href = '../HTML/Catálogo_de_Obras_(OPAC).html';
        });
    }
    
    // Función para verificar si el usuario está logueado (simulada)
    function checkUserLogin() {
        // En un sistema real, esto verificaría la sesión del usuario
        // Por ahora, simulamos que el usuario no está logueado
        return true;
    }
    
    // Mostrar modal de login requerido
    function showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Iniciar sesión requerido</h3>
                <p>Para solicitar un préstamo o reservar un libro, debe iniciar sesión en su cuenta.</p>
                <div class="modal-buttons">
                    <button id="go-to-login" class="btn-primary">Ir a Iniciar Sesión</button>
                    <button id="cancel-modal" class="btn-outline">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos del modal
        document.getElementById('go-to-login').addEventListener('click', function() {
            // Redirigir a la página de login (que en nuestro caso es el panel de usuario)
            window.location.href = '../HTML/Panel_de_Usuario.html';
        });
        
        document.getElementById('cancel-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Función para reservar libro (simulada)
    function reserveBook() {
        // En un sistema real, esto enviaría una solicitud a la API
        alert('Libro reservado exitosamente. Será notificado cuando esté disponible.');
    }
    
    // Inicializar la página
    loadBookData();
    loadRelatedBooks();
    setupEventListeners();
});

// Sistema de tarifas (simulado)
const LibraryPaymentSystem = {
    calculateLoanFee: function(bookType, days) {
        const baseRate = bookType === 'special' ? 5 : 3;
        return baseRate * days;
    }
};

// Función global para solicitar notificación
function requestNotification(bookId) {
    const userEmail = prompt('Ingrese su email para ser notificado cuando el libro esté disponible:');
    if (userEmail) {
        alert(`Será notificado en ${userEmail} cuando el libro esté disponible.`);
        
        const notificationRequest = {
            bookId: bookId,
            userEmail: userEmail,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Guardar en localStorage (simulado)
        saveNotificationRequest(notificationRequest);
    }
}

function saveNotificationRequest(request) {
    // Simular guardado en localStorage
    let notifications = JSON.parse(localStorage.getItem('bookNotifications')) || [];
    notifications.push(request);
    localStorage.setItem('bookNotifications', JSON.stringify(notifications));
}