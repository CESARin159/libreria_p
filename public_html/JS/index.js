// catalogo.js
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const searchTerm = document.getElementById('search-term');
    const resultsContainer = document.getElementById('results-container');
    
    // Datos de ejemplo (en un sistema real, estos vendrían de una API)
    const sampleBooks = [
        {
            id: 1,
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            isbn: "9788437604947",
            language: "Español",
            topic: "Ficción",
            description: "Una novela emblemática del realismo mágico que relata la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
            available: true
        },
        {
            id: 2,
            title: "El Quijote de la Mancha",
            author: "Miguel de Cervantes",
            isbn: "9788467038878",
            language: "Español",
            topic: "Clásico",
            description: "La obra cumbre de la literatura española y una de las más traducidas de la historia.",
            available: false
        },
        {
            id: 3,
            title: "1984",
            author: "George Orwell",
            isbn: "9788499890944",
            language: "Inglés",
            topic: "Ciencia Ficción",
            description: "Una distopía que explora temas de vigilancia gubernamental y control social.",
            available: true
        }
    ];
    
    // Función para mostrar libros
    function displayBooks(books) {
        resultsContainer.innerHTML = '';
        
        if (books.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron resultados para su búsqueda.</p>';
            return;
        }
        
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            bookCard.innerHTML = `
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p><strong>Autor:</strong> ${book.author} | <strong>ISBN:</strong> ${book.isbn} | <strong>Idioma:</strong> ${book.language} | <strong>Área:</strong> ${book.topic}</p>
                    <p>${book.description}</p>
                    <p class="${book.available ? 'available' : 'unavailable'}">${book.available ? 'Disponible' : 'No disponible'}</p>
                </div>
                <div class="book-actions">
                    <button onclick="viewBookDetails(${book.id})">Ver detalles</button>
                    ${book.available ? `<button onclick="requestLoan(${book.id})">Solicitar préstamo</button>` : ''}
                </div>
            `;
            
            resultsContainer.appendChild(bookCard);
        });
    }
    
    // Función para buscar libros
    function searchBooks() {
        const term = searchTerm.value.toLowerCase();
        const language = document.getElementById('language-filter').value;
        const topic = document.getElementById('topic-filter').value;
        
        const filteredBooks = sampleBooks.filter(book => {
            const matchesTerm = !term || 
                book.title.toLowerCase().includes(term) || 
                book.author.toLowerCase().includes(term) || 
                book.isbn.includes(term);
            
            const matchesLanguage = !language || book.language.toLowerCase() === language.toLowerCase();
            const matchesTopic = !topic || book.topic.toLowerCase() === topic.toLowerCase();
            
            return matchesTerm && matchesLanguage && matchesTopic;
        });
        
        displayBooks(filteredBooks);
    }
    
    // Event listeners
    searchBtn.addEventListener('click', searchBooks);
    
    // También buscar al presionar Enter en el campo de búsqueda
    searchTerm.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchBooks();
        }
    });
    
    // Mostrar todos los libros al cargar la página
    displayBooks(sampleBooks);
});

// Funciones globales para los botones
function viewBookDetails(bookId) {
    window.location.href = `../HTML/Detalle_de_Obra.html?id=${bookId}`;
}

function requestLoan(bookId) {
    window.location.href = `../HTML/Solicitud_de_Préstamo.html?bookId=${bookId}`;
}

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
        
        saveNotificationRequest(notificationRequest);
    }
}