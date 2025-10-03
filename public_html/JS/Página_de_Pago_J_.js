document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const stepSummary = document.getElementById('step-summary');
    const stepPaymentMethod = document.getElementById('step-payment-method');
    const stepConfirmation = document.getElementById('step-confirmation');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');
    const backToSummaryBtn = document.getElementById('back-to-summary');
    const continueToConfirmBtn = document.getElementById('continue-to-confirm');
    const paymentMethods = document.querySelectorAll('.payment-method-card');
    const paymentFormContainer = document.getElementById('payment-form-container');
    const printReceiptBtn = document.getElementById('print-receipt');
    const downloadReceiptBtn = document.getElementById('download-receipt');
    
    // Variables para almacenar datos del pago
    let selectedPaymentMethod = null;
    let paymentData = {};
    
    // Inicializar la página
    function initPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentType = urlParams.get('type') || 'fines'; // 'fines' o 'loan'
        const loanId = urlParams.get('loanId');
        
        loadPaymentSummary(paymentType, loanId);
        setupEventListeners();
    }
    
    // Modificar loadPaymentSummary para manejar diferentes tipos
    function loadPaymentSummary(paymentType, loanId) {
        const transactionDetails = document.getElementById('transaction-details');
        const finesSummary = document.getElementById('fines-summary');
        const totalPayment = document.getElementById('total-payment');
        
        let paymentInfo = {};
        
        if (paymentType === 'loan') {
            // Pago de préstamo
            paymentInfo = getLoanPaymentInfo(loanId);
        } else {
            // Pago de multas (por defecto)
            paymentInfo = getFinesPaymentInfo();
        }
        
        const totalAmount = paymentInfo.items.reduce((sum, item) => sum + item.amount, 0);
        
        // Llenar detalles de la transacción
        transactionDetails.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">ID de Transacción:</span>
                <span class="detail-value">${paymentInfo.transactionId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${paymentInfo.timestamp}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Usuario:</span>
                <span class="detail-value">${paymentInfo.user.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tipo de Pago:</span>
                <span class="detail-value">${paymentType === 'loan' ? 'Préstamo' : 'Multas'}</span>
            </div>
        `;
        
        // Llenar lista de items a pagar
        finesSummary.innerHTML = '';
        paymentInfo.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fine-item';
            itemElement.innerHTML = `
                <span>${item.description}</span>
                <span>S/ ${item.amount.toFixed(2)}</span>
            `;
            finesSummary.appendChild(itemElement);
        });
        
        // Actualizar total
        totalPayment.textContent = `S/ ${totalAmount.toFixed(2)}`;
        
        // Guardar datos
        paymentData = {
            totalAmount: totalAmount,
            items: paymentInfo.items,
            user: paymentInfo.user,
            transactionId: paymentInfo.transactionId,
            timestamp: paymentInfo.timestamp,
            paymentType: paymentType,
            loanId: loanId
        };
    }
    
    // Nueva función para información de pago de préstamo
    function getLoanPaymentInfo(loanId) {
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
        const loanPayment = pendingPayments.find(payment => payment.loanId === loanId && payment.status === 'pending');
        
        if (!loanPayment) {
            // Crear pago si no existe
            const loans = JSON.parse(localStorage.getItem('userLoans')) || [];
            const loan = loans.find(l => l.id === loanId);
            
            if (loan) {
                const newPayment = {
                    id: 'PAGO' + Date.now().toString().slice(-6),
                    loanId: loanId,
                    amount: 10.00, // Tarifa estándar de préstamo
                    description: `Tarifa de préstamo: ${loan.book.title}`,
                    type: 'loan_payment'
                };
                
                return {
                    transactionId: 'TXN' + Date.now().toString().slice(-6),
                    timestamp: new Date().toLocaleString('es-ES'),
                    items: [newPayment],
                    user: getUserData()
                };
            }
        }
        
        return {
            transactionId: 'TXN' + Date.now().toString().slice(-6),
            timestamp: new Date().toLocaleString('es-ES'),
            items: [{
                id: loanPayment.id,
                description: `Tarifa de préstamo: ${loanPayment.bookTitle}`,
                amount: loanPayment.amount,
                loanId: loanId
            }],
            user: getUserData()
        };
    }
    
    // Función para obtener información de pago de multas
    function getFinesPaymentInfo() {
        // Datos de ejemplo para multas (en un sistema real, estos vendrían de una API)
        return {
            transactionId: 'TXN' + Date.now().toString().slice(-6),
            timestamp: new Date().toLocaleString('es-ES'),
            items: [
                {
                    id: 'MULTA001',
                    description: 'Multa por retraso en devolución',
                    amount: 15.00,
                    loanId: 'PREST004'
                },
                {
                    id: 'MULTA002',
                    description: 'Multa por daño en libro',
                    amount: 25.00,
                    loanId: 'PREST005'
                }
            ],
            user: getUserData()
        };
    }
    
    // Función para obtener datos del usuario
    function getUserData() {
        // En un sistema real, esto vendría de la sesión
        return {
            name: 'Juan García',
            email: 'juan.garcia@email.com',
            userId: 'USR001'
        };
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Navegación entre pasos
        continueToPaymentBtn.addEventListener('click', function() {
            showStep('payment-method');
            updateStepIndicator(2);
        });
        
        backToSummaryBtn.addEventListener('click', function() {
            showStep('summary');
            updateStepIndicator(1);
        });
        
        continueToConfirmBtn.addEventListener('click', function() {
            if (validatePaymentForm()) {
                processPayment();
            }
        });
        
        // Selección de método de pago
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                selectPaymentMethod(this);
            });
        });
        
        // Botones de confirmación
        printReceiptBtn.addEventListener('click', printReceipt);
        downloadReceiptBtn.addEventListener('click', downloadReceipt);

        // Enlaces en el resumen
        document.querySelector('a[href="../HTML/Panel_de_Usuario.html"]').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../HTML/Panel_de_Usuario.html';
        });
        
        // Botón en confirmación
        document.querySelector('#step-confirmation a[href="../HTML/Panel_de_Usuario.html"]').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../HTML/Panel_de_Usuario.html';
        });
    }
    
    // Función para redireccionar al panel después del pago
    function redirectToPanel() {
        setTimeout(() => {
            window.location.href = '../HTML/Panel_de_Usuario.html';
        }, 3000);
    }    

    // Mostrar paso específico
    function showStep(step) {
        // Ocultar todos los pasos
        stepSummary.classList.remove('active');
        stepPaymentMethod.classList.remove('active');
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
    
    // Seleccionar método de pago
    function selectPaymentMethod(methodElement) {
        // Quitar selección anterior
        paymentMethods.forEach(method => {
            method.classList.remove('selected');
            const radio = method.querySelector('input[type="radio"]');
            radio.checked = false;
        });
        
        // Seleccionar nuevo método
        methodElement.classList.add('selected');
        const radio = methodElement.querySelector('input[type="radio"]');
        radio.checked = true;
        
        selectedPaymentMethod = methodElement.getAttribute('data-method');
        loadPaymentForm(selectedPaymentMethod);
        continueToConfirmBtn.disabled = false;
    }
    
    // Cargar formulario de pago según el método seleccionado
    function loadPaymentForm(method) {
        let formHTML = '';
        
        switch(method) {
            case 'yape':
                formHTML = `
                    <div class="payment-form">
                        <h3>Pago con Yape</h3>
                        <p>Para completar su pago, escanee el código QR con la aplicación Yape:</p>
                        
                        <div class="qr-container">
                            <div class="qr-code">
                                <img src="../IMG/yape_qr.png" alt="YapeQR">
                            </div>
                            <p>O envíe el pago al número: <strong>987 654 321</strong></p>
                        </div>
                        
                        <div class="form-group">
                            <label for="yape-phone">Número de teléfono Yape</label>
                            <input type="tel" id="yape-phone" placeholder="987 654 321" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="yape-reference">Número de referencia (opcional)</label>
                            <input type="text" id="yape-reference" placeholder="Referencia del pago">
                        </div>
                    </div>
                `;
                break;
                
            case 'tarjeta':
                formHTML = `
                    <div class="payment-form">
                        <h3>Pago con Tarjeta</h3>
                        
                        <div class="form-group">
                            <label for="card-number">Número de Tarjeta</label>
                            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-expiry">Fecha de Vencimiento</label>
                                <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label for="card-cvv">CVV</label>
                                <input type="text" id="card-cvv" placeholder="123" maxlength="3" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="card-name">Nombre en la Tarjeta</label>
                            <input type="text" id="card-name" placeholder="Juan Pérez" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-dni">DNI del Titular</label>
                                <input type="text" id="card-dni" placeholder="12345678" required>
                            </div>
                            <div class="form-group">
                                <label for="card-installments">Cuotas</label>
                                <select id="card-installments">
                                    <option value="1">1 cuota</option>
                                    <option value="3">3 cuotas</option>
                                    <option value="6">6 cuotas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'transferencia':
                formHTML = `
                    <div class="payment-form">
                        <h3>Transferencia Bancaria</h3>
                        <p>Realice una transferencia a nuestra cuenta bancaria con los siguientes datos:</p>
                        
                        <div class="bank-info">
                            <div class="bank-detail">
                                <span>Banco:</span>
                                <span><strong>Banco de Crédito del Perú</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Tipo de Cuenta:</span>
                                <span><strong>Cuenta Corriente</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Número de Cuenta:</span>
                                <span><strong>215-00345678-0-85</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>CCI:</span>
                                <span><strong>002-215-000345678085-18</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Titular:</span>
                                <span><strong>Ediciones Saberum S.A.C.</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Monto a Transferir:</span>
                                <span><strong>S/ ${paymentData.totalAmount.toFixed(2)}</strong></span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="transfer-reference">Número de Operación</label>
                            <input type="text" id="transfer-reference" placeholder="Número de operación bancaria" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="transfer-date">Fecha de Transferencia</label>
                            <input type="date" id="transfer-date" required>
                        </div>
                    </div>
                `;
                break;
                
            case 'efectivo':
                formHTML = `
                    <div class="payment-form">
                        <h3>Pago en Efectivo</h3>
                        <p>Para pagar en efectivo, acérquese a nuestra biblioteca en el siguiente horario:</p>
                        
                        <div class="bank-info">
                            <div class="bank-detail">
                                <span>Dirección:</span>
                                <span><strong>Av. Ejercito 123, Arequipa</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Horario de Atención:</span>
                                <span><strong>Lunes a Viernes: 8:00 - 18:00</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Sábados:</span>
                                <span><strong>9:00 - 13:00</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Teléfono:</span>
                                <span><strong>(054) 123456</strong></span>
                            </div>
                            <div class="bank-detail">
                                <span>Monto a Pagar:</span>
                                <span><strong>S/ ${paymentData.totalAmount.toFixed(2)}</strong></span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="cash-date">Fecha prevista de pago</label>
                            <input type="date" id="cash-date" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="cash-comments">Comentarios adicionales</label>
                            <textarea id="cash-comments" rows="3" placeholder="Información adicional para el pago..."></textarea>
                        </div>
                    </div>
                `;
                break;
        }
        
        paymentFormContainer.innerHTML = formHTML;
        
        // Agregar validación en tiempo real para los campos de entrada
        if (method === 'tarjeta') {
            const cardNumber = document.getElementById('card-number');
            const cardExpiry = document.getElementById('card-expiry');
            const cardCvv = document.getElementById('card-cvv');
            
            if (cardNumber) {
                cardNumber.addEventListener('input', formatCardNumber);
                cardNumber.addEventListener('blur', validateCardNumber);
            }
            
            if (cardExpiry) {
                cardExpiry.addEventListener('input', formatExpiryDate);
                cardExpiry.addEventListener('blur', validateExpiryDate);
            }
            
            if (cardCvv) {
                cardCvv.addEventListener('blur', validateCvv);
            }
        }
    }
    
    // Validar formulario de pago
    function validatePaymentForm() {
        // Validación básica - en un sistema real sería más compleja
        if (!selectedPaymentMethod) {
            alert('Por favor seleccione un método de pago');
            return false;
        }
        
        // Validaciones específicas por método
        switch(selectedPaymentMethod) {
            case 'tarjeta':
                if (!validateCardForm()) return false;
                break;
            case 'transferencia':
                if (!validateTransferForm()) return false;
                break;
            case 'efectivo':
                if (!validateCashForm()) return false;
                break;
        }
        
        return true;
    }
    
    // Validar formulario de tarjeta
    function validateCardForm() {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;
        
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            alert('Por favor ingrese un número de tarjeta válido (16 dígitos)');
            return false;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            alert('Por favor ingrese una fecha de vencimiento válida (MM/AA)');
            return false;
        }
        
        if (cardCvv.length !== 3 || !/^\d+$/.test(cardCvv)) {
            alert('Por favor ingrese un CVV válido (3 dígitos)');
            return false;
        }
        
        if (cardName.trim().length < 3) {
            alert('Por favor ingrese el nombre del titular de la tarjeta');
            return false;
        }
        
        return true;
    }
    
    // Validar formulario de transferencia
    function validateTransferForm() {
        const reference = document.getElementById('transfer-reference').value;
        const date = document.getElementById('transfer-date').value;
        
        if (!reference.trim()) {
            alert('Por favor ingrese el número de operación bancaria');
            return false;
        }
        
        if (!date) {
            alert('Por favor seleccione la fecha de transferencia');
            return false;
        }
        
        return true;
    }
    
    // Validar formulario de efectivo
    function validateCashForm() {
        const date = document.getElementById('cash-date').value;
        
        if (!date) {
            alert('Por favor seleccione la fecha prevista de pago');
            return false;
        }
        
        return true;
    }
    
    // Procesar pago
    function processPayment() {
        // Recopilar datos del formulario según el método seleccionado
        paymentData.paymentMethod = selectedPaymentMethod;
        paymentData.paymentDate = new Date().toISOString();
        paymentData.status = 'completed';
        
        // Actualizar estado en localStorage si es un pago de préstamo
        if (paymentData.paymentType === 'loan' && paymentData.loanId) {
            updateLoanPaymentStatus(paymentData.loanId);
        }
        
        // Simular procesamiento (en un sistema real, esto enviaría a una pasarela de pago)
        setTimeout(() => {
            showStep('confirmation');
            updateStepIndicator(3);
            displayConfirmationDetails();
        }, 1500);
    }
    
    // Actualizar estado del pago de préstamo en localStorage
    function updateLoanPaymentStatus(loanId) {
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
        const paymentIndex = pendingPayments.findIndex(payment => payment.loanId === loanId);
        
        if (paymentIndex !== -1) {
            pendingPayments[paymentIndex].status = 'paid';
            pendingPayments[paymentIndex].paymentDate = new Date().toISOString();
            localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        }
    }
    
    // Mostrar detalles de confirmación
    function displayConfirmationDetails() {
        const confirmationDetails = document.getElementById('confirmation-details-content');
        const transactionInfo = document.getElementById('transaction-info-content');
        
        // Detalles de confirmación
        confirmationDetails.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Método de Pago:</span>
                <span class="detail-value">${getPaymentMethodName(selectedPaymentMethod)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Monto Total:</span>
                <span class="detail-value">S/ ${paymentData.totalAmount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha de Pago:</span>
                <span class="detail-value">${new Date(paymentData.paymentDate).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tipo de Pago:</span>
                <span class="detail-value">${paymentData.paymentType === 'loan' ? 'Préstamo' : 'Multas'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value" style="color: #27ae60;">Completado</span>
            </div>
        `;
        
        // Información de la transacción
        transactionInfo.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">ID de Transacción:</span>
                <span class="detail-value">${paymentData.transactionId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha y Hora:</span>
                <span class="detail-value">${paymentData.timestamp}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Usuario:</span>
                <span class="detail-value">${paymentData.user.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Items Pagados:</span>
                <span class="detail-value">${paymentData.items.length}</span>
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
                <title>Comprobante de Pago - Ediciones Saberum</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                    .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
                    .receipt-details { margin-bottom: 20px; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .receipt-total { border-top: 2px solid #2c3e50; padding-top: 10px; font-weight: bold; font-size: 1.1em; }
                    .receipt-footer { margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; text-align: center; font-size: 0.9em; color: #666; }
                    @media print { body { margin: 0; } .receipt { border: none; box-shadow: none; } }
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
        alert('Descargando un PDF del comprobante de pago (simulación).');
        // En un sistema real, aquí se generaría y descargaría un PDF
    }
    
    // Generar HTML del comprobante
    function generateReceiptHTML() {
        const paymentTypeText = paymentData.paymentType === 'loan' ? 'Préstamo' : 'Multas';
        
        return `
            <div class="receipt">
                <div class="receipt-header">
                    <h2>Ediciones Saberum</h2>
                    <h3>Comprobante de Pago - ${paymentTypeText}</h3>
                    <p>${paymentData.timestamp}</p>
                </div>
                <div class="receipt-details">
                    <div class="receipt-item">
                        <span>ID de Transacción:</span>
                        <span>${paymentData.transactionId}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Usuario:</span>
                        <span>${paymentData.user.name}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Tipo de Pago:</span>
                        <span>${paymentTypeText}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Método de Pago:</span>
                        <span>${getPaymentMethodName(paymentData.paymentMethod)}</span>
                    </div>
                    <div class="receipt-item">
                        <span>Fecha de Pago:</span>
                        <span>${new Date(paymentData.paymentDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    
                    <h4>Detalle del Pago:</h4>
                    ${paymentData.items.map(item => `
                        <div class="receipt-item">
                            <span>${item.description}</span>
                            <span>S/ ${item.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                    
                    <div class="receipt-item receipt-total">
                        <span>Total Pagado:</span>
                        <span>S/ ${paymentData.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="receipt-footer">
                    <p>¡Gracias por su pago!</p>
                    <p>Este comprobante es su constancia de pago. Consérvelo para cualquier consulta.</p>
                </div>
            </div>
        `;
    }
    
    // Funciones auxiliares para formato de tarjeta
    function formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
    }
    
    function formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }
    
    function validateCardNumber() {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        // Validación básica - en un sistema real usaríamos el algoritmo de Luhn
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            document.getElementById('card-number').style.borderColor = '#e74c3c';
        } else {
            document.getElementById('card-number').style.borderColor = '#27ae60';
        }
    }
    
    function validateExpiryDate() {
        const expiry = document.getElementById('card-expiry').value;
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            document.getElementById('card-expiry').style.borderColor = '#e74c3c';
        } else {
            document.getElementById('card-expiry').style.borderColor = '#27ae60';
        }
    }
    
    function validateCvv() {
        const cvv = document.getElementById('card-cvv').value;
        if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
            document.getElementById('card-cvv').style.borderColor = '#e74c3c';
        } else {
            document.getElementById('card-cvv').style.borderColor = '#27ae60';
        }
    }
    
    function getPaymentMethodName(method) {
        switch(method) {
            case 'yape': return 'Yape';
            case 'tarjeta': return 'Tarjeta de Crédito/Débito';
            case 'transferencia': return 'Transferencia Bancaria';
            case 'efectivo': return 'Efectivo';
            default: return 'Desconocido';
        }
    }
    
    // Inicializar la página
    initPage();
});