// panel-usuario.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutBtn = document.getElementById('logout-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const profileForm = document.getElementById('profile-form');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const clearNotificationsBtn = document.getElementById('clear-notifications');
    const exportHistoryBtn = document.getElementById('export-history');
    const historyPeriod = document.getElementById('history-period');
    
    // Datos del usuario (en un sistema real, estos vendrían de una API)
    const userData = {
        id: 'USR001',
        dni: '12345678',
        name: 'Juan García',
        lastname: 'Pérez',
        email: 'juan.garcia@email.com',
        phone: '+51 987 654 321',
        address: 'Av. Ejercito 123, Arequipa',
        userType: 'Socio',
        status: 'Activo',
        joinDate: '2024-01-15',
        avatar: 'https://via.placeholder.com/80x80/3498db/ffffff?text=AG'
    };
    
    // Datos de ejemplo para préstamos, reservas, etc.
    const sampleData = {
        activeLoans: [
            {
                id: 'PREST001',
                bookId: 1,
                title: 'Cien años de soledad',
                author: 'Gabriel García Márquez',
                loanDate: '2025-03-01',
                dueDate: '2025-03-16',
                returnDate: null,
                status: 'active',
                daysRemaining: 5,
                isNearDue: true,
                renewalCount: 0
            },
            {
                id: 'PREST002',
                bookId: 3,
                title: '1984',
                author: 'George Orwell',
                loanDate: '2025-03-10',
                dueDate: '2025-03-25',
                returnDate: null,
                status: 'active',
                daysRemaining: 10,
                isNearDue: false,
                renewalCount: 1
            }
        ],
        reservations: [
            {
                id: 'RES001',
                bookId: 2,
                title: 'El Quijote de la Mancha',
                author: 'Miguel de Cervantes',
                reserveDate: '2025-03-05',
                estimatedDate: '2025-03-20',
                position: 1,
                status: 'pending'
            }
        ],
        loanHistory: [
            {
                id: 'PREST003',
                bookId: 4,
                title: 'La ciudad y los perros',
                author: 'Mario Vargas Llosa',
                loanDate: '2025-01-15',
                dueDate: '2025-01-30',
                returnDate: '2025-01-28',
                status: 'returned'
            },
            {
                id: 'PREST004',
                bookId: 5,
                title: 'Rayuela',
                author: 'Julio Cortázar',
                loanDate: '2025-02-01',
                dueDate: '2025-02-16',
                returnDate: '2025-02-20',
                status: 'returned_late'
            }
        ],
        fines: [
            {
                id: 'MULTA001',
                loanId: 'PREST004',
                amount: 20.00,
                reason: 'Retraso en la devolución: 4 días',
                status: 'pending',
                issueDate: '2025-02-21',
                dueDate: '2025-03-21'
            }
        ],
        notifications: [
            {
                id: 'NOT001',
                type: 'reminder',
                title: 'Recordatorio de devolución',
                message: 'Tu préstamo de "Cien años de soledad" vence en 5 días',
                timestamp: '2025-03-11 10:30',
                read: false
            },
            {
                id: 'NOT002',
                type: 'reservation',
                title: 'Reserva disponible',
                message: 'El libro "El Quijote de la Mancha" está disponible para recoger',
                timestamp: '2025-03-10 15:45',
                read: true
            },
            {
                id: 'NOT003',
                type: 'fine',
                title: 'Multa aplicada',
                message: 'Se ha aplicado una multa de S/ 20.00 por retraso en la devolución',
                timestamp: '2025-02-21 09:15',
                read: true
            }
        ]
    };
    
    // Inicializar la página
    function initPage() {
        loadUserData();
        setupEventListeners();
        showTab('prestamos-activos');
        loadActiveLoans();
        loadReservations();
        loadLoanHistory();
        loadFines();
        loadNotifications();
    }
    
    // Cargar datos del usuario
    function loadUserData() {
        document.getElementById('user-name').textContent = `${userData.name} ${userData.lastname}`;
        document.getElementById('user-email').textContent = userData.email;
        document.getElementById('user-type').textContent = `Tipo: ${userData.userType}`;
        document.getElementById('user-status').textContent = `Estado: ${userData.status}`;
        document.getElementById('user-avatar').src = userData.avatar;
        
        // Llenar formulario de perfil
        document.getElementById('profile-dni').value = userData.dni;
        document.getElementById('profile-name').value = userData.name;
        document.getElementById('profile-lastname').value = userData.lastname;
        document.getElementById('profile-email').value = userData.email;
        document.getElementById('profile-phone').value = userData.phone;
        document.getElementById('profile-address').value = userData.address;
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Navegación entre pestañas
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                showTab(tabId);
                
                // Actualizar clase activa
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Cerrar sesión
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Está seguro de que desea cerrar sesión?')) {
                window.location.href = '../HTML/Catálogo_de_Obras_(OPAC).html';
            }
        });
        
        // Modal de pago
        closePaymentModal.addEventListener('click', closePaymentModalFunc);
        cancelPaymentBtn.addEventListener('click', closePaymentModalFunc);
        confirmPaymentBtn.addEventListener('click', processPayment);
        
        // Formulario de perfil
        profileForm.addEventListener('submit', saveProfile);
        document.getElementById('cancel-changes').addEventListener('click', resetProfileForm);
        
        // Notificaciones
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
        clearNotificationsBtn.addEventListener('click', clearNotifications);
        
        // Exportar historial
        exportHistoryBtn.addEventListener('click', exportLoanHistory);
        historyPeriod.addEventListener('change', loadLoanHistory);
        
        // Métodos de pago
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                const methodType = this.getAttribute('data-method');
                openPaymentModal(methodType);
            });
        });
    }
    
    // Mostrar pestaña específica
    function showTab(tabId) {
        // Ocultar todas las pestañas
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Mostrar pestaña solicitada
        document.getElementById(tabId).classList.add('active');
        
        // Cargar datos específicos de la pestaña si es necesario
        switch(tabId) {
            case 'prestamos-activos':
                loadActiveLoans();
                break;
            case 'reservas-pendientes':
                loadReservations();
                break;
            case 'historial-prestamos':
                loadLoanHistory();
                break;
            case 'multas':
                loadFines();
                break;
            case 'notificaciones':
                loadNotifications();
                break;
        }
    }
    
    // Cargar préstamos activos
    function loadActiveLoans() {
        const loansList = document.getElementById('active-loans-list');
        const emptyState = document.getElementById('empty-active-loans');
        const activeCount = document.getElementById('active-loans-count');
        const nearDueCount = document.getElementById('near-due-count');
        
        const activeLoans = sampleData.activeLoans;
        const nearDueLoans = activeLoans.filter(loan => loan.isNearDue);
        
        activeCount.textContent = activeLoans.length;
        nearDueCount.textContent = nearDueLoans.length;
        
        if (activeLoans.length === 0) {
            loansList.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-icon">📚</div>
                <h3>No tienes préstamos activos</h3>
                <p>Visita nuestro catálogo para encontrar libros interesantes.</p>
                <a href="../HTML/index.html" class="btn-primary">Explorar Catálogo</a>
            `;
            return;
        }
        
        loansList.style.display = 'block';
        emptyState.style.display = 'none';
        loansList.innerHTML = '';
        
        activeLoans.forEach(loan => {
            const loanItem = document.createElement('div');
            loanItem.className = 'loan-item';
            
            const statusClass = loan.isNearDue ? 'status-overdue' : 'status-active';
            const statusText = loan.isNearDue ? 'Por vencer' : 'Activo';
            
            loanItem.innerHTML = `
                <div class="loan-header">
                    <div>
                        <h3 class="loan-title">${loan.title}</h3>
                        <p class="loan-author">${loan.author}</p>
                    </div>
                    <span class="loan-status ${statusClass}">${statusText}</span>
                </div>
                <div class="loan-details">
                    <div class="detail-item">
                        <span class="detail-label">ID de Préstamo</span>
                        <span class="detail-value">${loan.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Préstamo</span>
                        <span class="detail-value">${formatDate(loan.loanDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Vencimiento</span>
                        <span class="detail-value">${formatDate(loan.dueDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Días Restantes</span>
                        <span class="detail-value">${loan.daysRemaining} días</span>
                    </div>
                </div>
                <div class="loan-actions">
                    <button class="btn-outline" onclick="viewBookDetails(${loan.bookId})">Ver Libro</button>
                    <button class="btn-primary" onclick="renewLoan('${loan.id}')">Renovar</button>
                    <button class="btn-secondary" onclick="returnLoan('${loan.id}')">Devolver</button>
                </div>
            `;
            
            loansList.appendChild(loanItem);
        });
    }
    
    // Cargar reservas pendientes
    function loadReservations() {
        const reservationsList = document.getElementById('reservations-list');
        const emptyState = document.getElementById('empty-reservations');
        const pendingCount = document.getElementById('pending-reservations-count');
        
        const reservations = sampleData.reservations;
        
        pendingCount.textContent = reservations.length;
        
        if (reservations.length === 0) {
            reservationsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        reservationsList.style.display = 'block';
        emptyState.style.display = 'none';
        reservationsList.innerHTML = '';
        
        reservations.forEach(reservation => {
            const reservationItem = document.createElement('div');
            reservationItem.className = 'reservation-item';
            
            reservationItem.innerHTML = `
                <div class="reservation-header">
                    <div>
                        <h3 class="reservation-title">${reservation.title}</h3>
                        <p class="reservation-author">${reservation.author}</p>
                    </div>
                    <span class="reservation-status status-pending">Pendiente</span>
                </div>
                <div class="reservation-details">
                    <div class="detail-item">
                        <span class="detail-label">ID de Reserva</span>
                        <span class="detail-value">${reservation.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Reserva</span>
                        <span class="detail-value">${formatDate(reservation.reserveDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Posición en cola</span>
                        <span class="detail-value">${reservation.position}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Disponibilidad estimada</span>
                        <span class="detail-value">${formatDate(reservation.estimatedDate)}</span>
                    </div>
                </div>
                <div class="reservation-actions">
                    <button class="btn-outline" onclick="viewBookDetails(${reservation.bookId})">Ver Libro</button>
                    <button class="btn-danger" onclick="cancelReservation('${reservation.id}')">Cancelar Reserva</button>
                </div>
            `;
            
            reservationsList.appendChild(reservationItem);
        });
    }
    
    // Cargar historial de préstamos
    function loadLoanHistory() {
        const historyList = document.getElementById('loan-history-list');
        const emptyState = document.getElementById('empty-history');
        const period = historyPeriod.value;
        
        let history = sampleData.loanHistory;
        
        // Filtrar por período seleccionado
        if (period !== 'all') {
            const days = parseInt(period);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            history = history.filter(loan => {
                const loanDate = new Date(loan.loanDate);
                return loanDate >= cutoffDate;
            });
        }
        
        if (history.length === 0) {
            historyList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        historyList.style.display = 'block';
        emptyState.style.display = 'none';
        historyList.innerHTML = '';
        
        history.forEach(loan => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const statusClass = loan.status === 'returned_late' ? 'status-overdue' : 'status-paid';
            const statusText = loan.status === 'returned_late' ? 'Devuelto con retraso' : 'Devuelto';
            
            historyItem.innerHTML = `
                <div class="loan-header">
                    <div>
                        <h3 class="loan-title">${loan.title}</h3>
                        <p class="loan-author">${loan.author}</p>
                    </div>
                    <span class="loan-status ${statusClass}">${statusText}</span>
                </div>
                <div class="loan-details">
                    <div class="detail-item">
                        <span class="detail-label">ID de Préstamo</span>
                        <span class="detail-value">${loan.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Préstamo</span>
                        <span class="detail-value">${formatDate(loan.loanDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de Devolución</span>
                        <span class="detail-value">${formatDate(loan.returnDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estado</span>
                        <span class="detail-value">${statusText}</span>
                    </div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    // Cargar multas y sanciones
    function loadFines() {
        calculateFines(); // Calcular multas automáticamente
        
        const finesList = document.getElementById('fines-list');
        const emptyState = document.getElementById('empty-fines');
        const paymentSection = document.getElementById('payment-section');
        const totalFines = document.getElementById('total-fines');
        const pendingCount = document.getElementById('pending-fines-count');
        
        // Obtener tanto multas como préstamos pendientes de pago
        const fines = JSON.parse(localStorage.getItem('userFines')) || [];
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
        
        const allPendingItems = [...fines.filter(fine => fine.status === 'pending'), ...pendingPayments];
        const totalAmount = allPendingItems.reduce((sum, item) => sum + item.amount, 0);
        
        totalFines.textContent = `S/ ${totalAmount.toFixed(2)}`;
        pendingCount.textContent = allPendingItems.length;
        
        if (allPendingItems.length === 0) {
            finesList.style.display = 'none';
            emptyState.style.display = 'block';
            paymentSection.style.display = 'none';
            return;
        }
        
        finesList.style.display = 'block';
        emptyState.style.display = 'none';
        paymentSection.style.display = 'block';
        finesList.innerHTML = '';
        
        allPendingItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fine-item';
            
            const isFine = item.id.startsWith('MULTA');
            const title = isFine ? `Multa #${item.id}` : `Préstamo #${item.loanId}`;
            const reason = isFine ? item.reason : `Préstamo pendiente: ${item.bookTitle}`;
            
            itemElement.innerHTML = `
                <div class="fine-header">
                    <div>
                        <h3 class="fine-title">${title}</h3>
                        <p class="fine-reason">${reason}</p>
                    </div>
                    <span class="fine-status status-overdue">Pendiente</span>
                </div>
                <div class="fine-details">
                    <div class="detail-item">
                        <span class="detail-label">Monto</span>
                        <span class="detail-value">S/ ${item.amount.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de emisión</span>
                        <span class="detail-value">${formatDate(item.issueDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha de vencimiento</span>
                        <span class="detail-value">${formatDate(item.dueDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tipo</span>
                        <span class="detail-value">${isFine ? 'Multa' : 'Préstamo'}</span>
                    </div>
                </div>
            `;
            
            finesList.appendChild(itemElement);
        });
    }
    
    // Cargar notificaciones
    function loadNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        const emptyState = document.getElementById('empty-notifications');
        
        const notifications = sampleData.notifications;
        const unreadCount = notifications.filter(notif => !notif.read).length;
        
        if (notifications.length === 0) {
            notificationsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        notificationsList.style.display = 'block';
        emptyState.style.display = 'none';
        notificationsList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'notification-unread'}`;
            
            const icon = getNotificationIcon(notification.type);
            
            notificationItem.innerHTML = `
                <div class="notification-icon" style="background-color: ${getNotificationColor(notification.type)}">
                    ${icon}
                </div>
                <div class="notification-info">
                    <h4 class="notification-title">${notification.title}</h4>
                    <p class="notification-message">${notification.message}</p>
                    <span class="notification-time">${formatDateTime(notification.timestamp)}</span>
                </div>
            `;
            
            notificationItem.addEventListener('click', function() {
                markNotificationAsRead(notification.id);
            });
            
            notificationsList.appendChild(notificationItem);
        });
    }
    
    // Abrir modal de pago
    function openPaymentModal(method) {
        const paymentContent = document.getElementById('payment-content');
        
        // Obtener tanto multas como préstamos pendientes de pago
        const fines = JSON.parse(localStorage.getItem('userFines')) || [];
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
        const pendingFines = [...fines.filter(fine => fine.status === 'pending'), ...pendingPayments];
        
        const totalAmount = pendingFines.reduce((sum, fine) => sum + fine.amount, 0);
        
        let paymentForm = '';
        
        switch(method) {
            case 'yape':
                paymentForm = `
                    <div class="payment-form">
                        <div class="payment-summary">
                            <h4>Resumen de Pago</h4>
                            ${pendingFines.map(item => `
                                <div class="payment-summary-item">
                                    <span>${item.id.startsWith('MULTA') ? 'Multa' : 'Préstamo'} #${item.id}</span>
                                    <span>S/ ${item.amount.toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="payment-summary-item payment-total">
                                <span>Total a pagar</span>
                                <span>S/ ${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <p>Para pagar con Yape, escanee el siguiente código QR:</p>
                        <div style="text-align: center; margin: 1rem 0;">
                            <img src="https://via.placeholder.com/150x150/27ae60/ffffff?text=QR" alt="Código QR Yape" style="width: 150px; height: 150px;">
                        </div>
                        <p>O envíe el pago al número: <strong>987 654 321</strong></p>
                    </div>
                `;
                break;
                
            case 'tarjeta':
                paymentForm = `
                    <div class="payment-form">
                        <div class="payment-summary">
                            <h4>Resumen de Pago</h4>
                            ${pendingFines.map(item => `
                                <div class="payment-summary-item">
                                    <span>${item.id.startsWith('MULTA') ? 'Multa' : 'Préstamo'} #${item.id}</span>
                                    <span>S/ ${item.amount.toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="payment-summary-item payment-total">
                                <span>Total a pagar</span>
                                <span>S/ ${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="card-number">Número de Tarjeta</label>
                            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label for="card-expiry">Fecha de Vencimiento</label>
                                <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label for="card-cvv">CVV</label>
                                <input type="text" id="card-cvv" placeholder="123" maxlength="3">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="card-name">Nombre en la Tarjeta</label>
                            <input type="text" id="card-name" placeholder="Juan Pérez">
                        </div>
                    </div>
                `;
                break;
                
            case 'efectivo':
                paymentForm = `
                    <div class="payment-form">
                        <div class="payment-summary">
                            <h4>Resumen de Pago</h4>
                            ${pendingFines.map(item => `
                                <div class="payment-summary-item">
                                    <span>${item.id.startsWith('MULTA') ? 'Multa' : 'Préstamo'} #${item.id}</span>
                                    <span>S/ ${item.amount.toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="payment-summary-item payment-total">
                                <span>Total a pagar</span>
                                <span>S/ ${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <p>Para pagar en efectivo, acérquese a nuestra biblioteca en horario de atención:</p>
                        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                            <li><strong>Dirección:</strong> Av. Ejercito 123, Arequipa</li>
                            <li><strong>Horario:</strong> Lunes a Viernes 8:00 - 18:00</li>
                            <li><strong>Teléfono:</strong> (054) 123456</li>
                        </ul>
                    </div>
                `;
                break;
        }
        
        paymentContent.innerHTML = paymentForm;
        paymentModal.style.display = 'flex';
    }
    
    // Cerrar modal de pago
    function closePaymentModalFunc() {
        paymentModal.style.display = 'none';
    }
    
    // Procesar pago
    function processPayment() {
        // Obtener tanto multas como préstamos pendientes de pago
        const fines = JSON.parse(localStorage.getItem('userFines')) || [];
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
        
        // Marcar multas como pagadas
        fines.forEach(fine => {
            if (fine.status === 'pending') {
                fine.status = 'paid';
            }
        });
        
        // Eliminar pagos de préstamos pendientes
        localStorage.setItem('pendingPayments', JSON.stringify([]));
        localStorage.setItem('userFines', JSON.stringify(fines));
        
        // Simular procesamiento de pago
        alert('Pago procesado exitosamente. Todos los pendientes han sido saldados.');
        
        closePaymentModalFunc();
        loadFines(); // Recargar la sección de multas
    }
    
    // Guardar perfil
    function saveProfile(e) {
        e.preventDefault();
        
        // En un sistema real, aquí se enviarían los datos a la API
        alert('Perfil actualizado exitosamente');
    }
    
    // Restablecer formulario de perfil
    function resetProfileForm() {
        profileForm.reset();
        loadUserData(); // Volver a cargar los datos originales
    }
    
    // Marcar todas las notificaciones como leídas
    function markAllNotificationsAsRead() {
        sampleData.notifications.forEach(notif => {
            notif.read = true;
        });
        loadNotifications();
    }
    
    // Limpiar notificaciones
    function clearNotifications() {
        if (confirm('¿Está seguro de que desea eliminar todas las notificaciones?')) {
            sampleData.notifications = [];
            loadNotifications();
        }
    }
    
    // Marcar notificación como leída
    function markNotificationAsRead(notificationId) {
        const notification = sampleData.notifications.find(notif => notif.id === notificationId);
        if (notification) {
            notification.read = true;
            loadNotifications();
        }
    }
    
    // Exportar historial a PDF
    function exportLoanHistory() {
        alert('Descargando un PDF con el historial de préstamos (simulación).');
    }
    
    // Funciones auxiliares
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    function formatDateTime(dateTimeString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleDateString('es-ES', options);
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'reminder': return '⏰';
            case 'reservation': return '📚';
            case 'fine': return '💰';
            default: return '🔔';
        }
    }
    
    function getNotificationColor(type) {
        switch(type) {
            case 'reminder': return '#3498db';
            case 'reservation': return '#27ae60';
            case 'fine': return '#e74c3c';
            default: return '#95a5a6';
        }
    }
    
    // Inicializar la página
    initPage();
});

// Funciones globales para los botones de acción
function viewBookDetails(bookId) {
    window.location.href = `../HTML/Detalle_de_Obra.html?id=${bookId}`;
}

function renewLoan(loanId) {
    const userLoans = JSON.parse(localStorage.getItem('userLoans')) || [];
    const loan = userLoans.find(l => l.id === loanId);
    
    if (!loan) {
        alert('Préstamo no encontrado.');
        return;
    }
    
    // Verificar si tiene multas pendientes
    const fines = JSON.parse(localStorage.getItem('userFines')) || [];
    const loanFines = fines.filter(fine => fine.loanId === loanId && fine.status === 'pending');
    
    if (loanFines.length > 0) {
        const totalFines = loanFines.reduce((sum, fine) => sum + fine.amount, 0);
        const payNow = confirm(`Tiene multas pendientes por S/ ${totalFines.toFixed(2)}. ¿Desea pagarlas ahora para poder renovar?`);
        
        if (payNow) {
            // Redirigir a página de pago
            window.location.href = `../HTML/Página_de_Pago.html?type=fines&loanId=${loanId}`;
            return;
        } else {
            alert('No puede renovar el préstamo con multas pendientes.');
            return;
        }
    }
    
    // Proceder con la renovación
    if (loan && loan.renewalCount < 2) {
        loan.renewalCount = (loan.renewalCount || 0) + 1;
        const newReturnDate = new Date(loan.returnDate);
        newReturnDate.setDate(newReturnDate.getDate() + 15);
        loan.returnDate = newReturnDate.toISOString().split('T')[0];
        
        localStorage.setItem('userLoans', JSON.stringify(userLoans));
        alert('Préstamo renovado exitosamente. Nueva fecha de devolución: ' + formatDate(loan.returnDate));
        loadActiveLoans();
    } else {
        alert('No puede renovar este préstamo. Ha alcanzado el límite de renovaciones.');
    }
}

function returnLoan(loanId) {
    if (confirm('¿Está seguro de que desea marcar este libro como devuelto?')) {
        alert('Libro marcado como devuelto exitosamente.');
        // En un sistema real, aquí se enviaría una solicitud a la API
    }
}

function cancelReservation(reservationId) {
    if (confirm('¿Está seguro de que desea cancelar esta reserva?')) {
        alert('Reserva cancelada exitosamente.');
        // En un sistema real, aquí se enviaría una solicitud a la API
    }
}

// Nueva función para crear pagos de préstamos
function createLoanPayment(loanId, amount, bookTitle) {
    const payment = {
        id: 'PAGO' + Date.now().toString().slice(-6),
        loanId: loanId,
        amount: amount,
        bookTitle: bookTitle,
        type: 'loan_payment',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        status: 'pending'
    };
    
    let pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
    pendingPayments.push(payment);
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
    
    return payment;
}

// Función auxiliar para formatear fechas (duplicada para uso global)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para cargar préstamos activos (duplicada para uso global)
function loadActiveLoans() {
    // Implementación similar a la función dentro del DOMContentLoaded
    console.log('Cargando préstamos activos...');
}

// Función para calcular multas (necesaria para loadFines)
function calculateFines() {
    // Lógica para calcular multas automáticamente
    console.log('Calculando multas...');
}