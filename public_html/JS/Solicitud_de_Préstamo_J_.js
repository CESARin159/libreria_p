document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID del libro de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId') || 1;
    
    // Elementos del DOM
    const stepVerification = document.getElementById('step-verification');
    const stepDetails = document.getElementById('step-details');
    const stepConfirmation = document.getElementById('step-confirmation');
    const continueToDetailsBtn = document.getElementById('continue-to-details');
    const backToVerificationBtn = document.getElementById('back-to-verification');
    const loanForm = document.getElementById('loan-form');
    const generateReceiptBtn = document.getElementById('generate-receipt');
    const newLoanBtn = document.getElementById('new-loan');
    const goToCatalogBtn = document.getElementById('go-to-catalog');
    const receiptModal = document.getElementById('receipt-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const printReceiptBtn = document.getElementById('print-receipt');
    const downloadReceiptBtn = document.getElementById('download-receipt');
    const closeReceiptBtn = document.getElementById('close-receipt');
    
    // Variables para almacenar datos del préstamo
    let currentBook = null;
    let loanData = {};
    
    // Datos de ejemplo (en un sistema real, estos vendrían de una API)
    const books = {
        1: {
            id: 1,
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            isbn: "9788437604947",
            language: "Español",
            topic: "Ficción",
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
            available: false,
            image: "../IMG/don_quijote.jpg",
            type: "regular"
        },
        3: {
            id: 3,
            title: "1984",
            author: "George Orwell",
            isbn: "9788499890944",
            language: "Inglés",
            topic: "Ciencia Ficción",
            available: true,
            image: "../IMG/1984.jpg",
            type: "premium"
        }
    };
    
    // Sistema de pagos simulado
    const LibraryPaymentSystem = {
        calculateLoanFee: function(bookType, days) {
            const baseFee = 2.00; // Tarifa base
            const premiumFee = 5.00; // Tarifa para libros premium
            
            if (bookType === 'premium') {
                return premiumFee;
            }
            return baseFee;
        }
    };
    
    // Inicializar la página
    function initPage() {
        loadBookData();
        setupEventListeners();
        setupFormValidation();
        calculateReturnDate();
    }
    
    // Cargar datos del libro
    function loadBookData() {
        currentBook = books[bookId];
        
        if (!currentBook) {
            window.location.href = '../HTML/Catálogo_de_Obras_(OPAC).html';
            return;
        }
        
        // Actualizar breadcrumb
        const breadcrumbBook = document.getElementById('breadcrumb-book');
        breadcrumbBook.href = `../HTML/Detalle_de_Obra.html?id=${bookId}`;
        breadcrumbBook.textContent = currentBook.title;

        // Actualizar resumen del libro
        const bookSummary = document.getElementById('book-summary-content');
        bookSummary.innerHTML = `
            <div class="book-info-card">
                <div class="book-cover-small" style="background-color: #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')};">
                    ${currentBook.title.substring(0, 20)}...
                </div>
                <div class="book-details">
                    <h3>${currentBook.title}</h3>
                    <p><strong>Autor:</strong> ${currentBook.author}</p>
                    <p><strong>ISBN:</strong> ${currentBook.isbn}</p>
                    <p><strong>Idioma:</strong> ${currentBook.language}</p>
                    <p><strong>Área temática:</strong> ${currentBook.topic}</p>
                    <p><strong>Tipo:</strong> ${currentBook.type === 'premium' ? 'Premium' : 'Regular'}</p>
                </div>
            </div>
        `;
        
        // Actualizar mensaje de disponibilidad
        const availabilityMessage = document.getElementById('availability-message');
        if (currentBook.available) {
            availabilityMessage.innerHTML = `
                <div class="status-available">
                    ✓ Recurso disponible para préstamo
                </div>
            `;
        } else {
            availabilityMessage.innerHTML = `
                <div class="status-unavailable">
                    ✗ Recurso no disponible actualmente
                </div>
            `;
            continueToDetailsBtn.disabled = true;
        }
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Selects de verificación
        document.getElementById('resource-type').addEventListener('change', validateVerificationStep);
        
        // Botón para continuar a detalles
        continueToDetailsBtn.addEventListener('click', function() {
            if (validateVerificationStep()) {
                showStep('details');
                updateStepIndicator(2);
            }
        });
        
        // Botón para volver a verificación
        backToVerificationBtn.addEventListener('click', function() {
            showStep('verification');
            updateStepIndicator(1);
        });
        
        // Formulario de préstamo
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateLoanForm()) {
                processLoanRequest();
            }
        });
        
        // Fecha de préstamo - calcular automáticamente fecha de devolución
        document.getElementById('loan-date').addEventListener('change', calculateReturnDate);
        
        // Botones de confirmación
        generateReceiptBtn.addEventListener('click', showReceiptModal);
        newLoanBtn.addEventListener('click', function() {
            window.location.href = '../HTML/Catálogo_de_Obras_(OPAC).html';
        });
        goToCatalogBtn.addEventListener('click', function() {
            window.location.href = '../HTML/Catálogo_de_Obras_(OPAC).html';
        });
    
        
        // Modal de comprobante
        closeModalBtn.addEventListener('click', closeReceiptModal);
        printReceiptBtn.addEventListener('click', printReceipt);
        downloadReceiptBtn.addEventListener('click', downloadReceipt);
        closeReceiptBtn.addEventListener('click', closeReceiptModal);
        
        // Cerrar modal al hacer clic fuera
        receiptModal.addEventListener('click', function(e) {
            if (e.target === receiptModal) {
                closeReceiptModal();
            }
        });
    }
    
    // Configurar validación del formulario
    function setupFormValidation() {
        const loanDate = document.getElementById('loan-date');
        const returnDate = document.getElementById('return-date');
        const agreeTerms = document.getElementById('agree-terms');
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        loanDate.min = today;
        
        // Validar en tiempo real
        loanDate.addEventListener('change', validateLoanForm);
        returnDate.addEventListener('change', validateLoanForm);
        agreeTerms.addEventListener('change', validateLoanForm);
    }
    
    // Validar paso de verificación
    function validateVerificationStep() {
        const resourceType = document.getElementById('resource-type').value;
        const isValid = resourceType && currentBook.available;
        
        continueToDetailsBtn.disabled = !isValid;
        return isValid;
    }
    
    // Validar formulario de préstamo
    function validateLoanForm() {
        const loanDate = document.getElementById('loan-date').value;
        const returnDate = document.getElementById('return-date').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        const submitBtn = document.getElementById('submit-loan');
        const isValid = loanDate && returnDate && agreeTerms;
        
        submitBtn.disabled = !isValid;
        return isValid;
    }
    
    // Calcular fecha de devolución automáticamente
    function calculateReturnDate() {
        const loanDateInput = document.getElementById('loan-date');
        const returnDateInput = document.getElementById('return-date');
        
        if (loanDateInput.value) {
            const loanDate = new Date(loanDateInput.value);
            const returnDate = new Date(loanDate);
            returnDate.setDate(returnDate.getDate() + 15); // 15 días de préstamo
            
            returnDateInput.value = returnDate.toISOString().split('T')[0];
            returnDateInput.min = loanDateInput.value;
        }
    }
    
    // Mostrar paso específico
    function showStep(step) {
        // Ocultar todos los pasos
        stepVerification.classList.remove('active');
        stepDetails.classList.remove('active');
        stepConfirmation.classList.remove('active');
        
        // Mostrar paso solicitado
        document.getElementById(`step-${step}`).classList.add('active');
    }
    
    // Actualizar indicador de pasos
    function updateStepIndicator(stepNumber) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Verificar límite de préstamos del usuario
    function checkUserLoanLimit() {
        // Simular verificación de límite de préstamos
        const userLoans = JSON.parse(localStorage.getItem('userLoans') || '[]');
        const activeLoans = userLoans.filter(loan => loan.status === 'active');
        
        if (activeLoans.length >= 3) { // Límite de 3 préstamos activos
            alert('Has alcanzado el límite máximo de préstamos activos (3). Por favor, devuelve algún libro antes de solicitar otro.');
            return false;
        }
        return true;
    }
    
    // Crear pago asociado al préstamo
    function createLoanPayment(loanId, amount, bookTitle) {
        const payment = {
            id: 'PAY' + Date.now().toString().slice(-6),
            loanId: loanId,
            amount: amount,
            description: `Préstamo: ${bookTitle}`,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Guardar en localStorage (simulación)
        const payments = JSON.parse(localStorage.getItem('loanPayments') || '[]');
        payments.push(payment);
        localStorage.setItem('loanPayments', JSON.stringify(payments));
        
        return payment;
    }
    
    // Guardar préstamo en el sistema
    function saveLoanToSystem(loanData) {
        const loans = JSON.parse(localStorage.getItem('userLoans') || '[]');
        loans.push(loanData);
        localStorage.setItem('userLoans', JSON.stringify(loans));
    }
    
    // Procesar solicitud de préstamo - AGREGAR CONFIRMACIÓN DE PAGO
    function processLoanRequest() {
        if (!checkUserLoanLimit()) {
            return;
        }

        const loanFee = LibraryPaymentSystem.calculateLoanFee(currentBook.type || 'regular', 15);
        
        const confirmPayment = confirm(
            `¿Confirmar solicitud de préstamo?\n\n` +
            `Libro: ${currentBook.title}\n` +
            `Tarifa: S/ ${loanFee.toFixed(2)}\n` +
            `Duración: 15 días\n\n` +
            `El pago se procesará al confirmar.`
        );
        
        if (!confirmPayment) {
            return;
        }

        // Crear préstamo y pago asociado
        loanData = {
            id: 'PREST' + Date.now().toString().slice(-6),
            book: currentBook,
            loanDate: document.getElementById('loan-date').value,
            returnDate: document.getElementById('return-date').value,
            purpose: document.getElementById('loan-purpose').value,
            fee: loanFee,
            status: 'pending_payment', // Cambiado a pendiente de pago
            timestamp: new Date().toLocaleString('es-ES')
        };

        // Crear pago asociado al préstamo
        createLoanPayment(loanData.id, loanFee, currentBook.title);
        
        // Guardar préstamo
        saveLoanToSystem(loanData);
        
        // Redirigir a página de pago
        window.location.href = `../HTML/Página_de_Pago.html?type=loan&loanId=${loanData.id}`;
    }
    
    // Mostrar resumen del préstamo en confirmación
    function displayLoanSummary() {
        const summaryContent = document.getElementById('loan-summary-content');
        summaryContent.innerHTML = `
            <div class="loan-summary-item">
                <span>ID de Préstamo:</span>
                <span><strong>${loanData.loanId}</strong></span>
            </div>
            <div class="loan-summary-item">
                <span>Libro:</span>
                <span>${loanData.book.title}</span>
            </div>
            <div class="loan-summary-item">
                <span>Autor:</span>
                <span>${loanData.book.author}</span>
            </div>
            <div class="loan-summary-item">
                <span>Fecha de Préstamo:</span>
                <span>${formatDate(loanData.loanDate)}</span>
            </div>
            <div class="loan-summary-item">
                <span>Fecha de Devolución:</span>
                <span>${formatDate(loanData.returnDate)}</span>
            </div>
            <div class="loan-summary-item">
                <span>Tarifa:</span>
                <span>S/ ${loanData.fee ? loanData.fee.toFixed(2) : '0.00'}</span>
            </div>
            <div class="loan-summary-item">
                <span>Estado:</span>
                <span class="status-pending">Pendiente de Pago</span>
            </div>
        `;
    }
    
    // Mostrar modal de comprobante
    function showReceiptModal() {
        const receiptContent = document.getElementById('receipt-content');
        receiptContent.innerHTML = generateReceiptHTML();
        receiptModal.style.display = 'flex';
    }
    
    // Cerrar modal de comprobante
    function closeReceiptModal() {
        receiptModal.style.display = 'none';
    }
    
    // Generar HTML del comprobante
    function generateReceiptHTML() {
        return `
            <div class="receipt">
                <div class="receipt-header">
                    <h3>Ediciones Saberum</h3>
                    <p>Comprobante de Préstamo</p>
                    <p>${loanData.timestamp}</p>
                </div>
                <div class="receipt-details">
                    <div class="receipt-item">
                        <span>ID de Préstamo:</span>
                        <span>${loanData.id}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Libro:</span>
                        <span>${loanData.book.title}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Autor:</span>
                        <span>${loanData.book.author}</span>
                    </div>
                    <div class="receipt-item">
                        <span>ISBN:</span>
                        <span>${loanData.book.isbn}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Fecha de Préstamo:</span>
                        <span>${formatDate(loanData.loanDate)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Fecha de Devolución:</span>
                        <span>${formatDate(loanData.returnDate)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Días de Préstamo:</span>
                        <span>15 días</span>
                    </div>
                    <div class="receipt-item">
                        <span>Tarifa:</span>
                        <span>S/ ${loanData.fee ? loanData.fee.toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Estado del Pago:</span>
                        <span class="status-pending">Pendiente</span>
                    </div>
                </div>
                <div class="receipt-footer">
                    <p>¡Gracias por utilizar nuestro servicio!</p>
                    <p>Complete el pago para activar su préstamo.</p>
                </div>
            </div>
        `;
    }
    
    // Imprimir comprobante
    function printReceipt() {
        const receiptHTML = generateReceiptHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Préstamo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt { max-width: 500px; margin: 0 auto; }
                    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .receipt-footer { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; text-align: center; font-size: 12px; }
                    .status-pending { color: #e67e22; font-weight: bold; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>${receiptHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    // Descargar comprobante como PDF (simulado)
    function downloadReceipt() {
        alert('Descargando un PDF del comprobante (simulación).');
        // En un sistema real, aquí se generaría y descargaría un PDF
    }
    
    // Formatear fecha
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    // Inicializar la página
    initPage();
});