/*
===============================================================================
JAVASCRIPT VANILLA EDUCATIVO - GESTOR DE TAREAS
===============================================================================

Este archivo demuestra conceptos fundamentales de JavaScript moderno:

1. CONCEPTOS DE DOM:
   - Selección y manipulación de elementos
   - Event listeners y delegation
   - Creación dinámica de elementos
   - Estados de la aplicación

2. COMUNICACIÓN CON API:
   - Fetch API para requests HTTP
   - Manejo de promesas (async/await)
   - Procesamiento de JSON
   - Manejo de errores de red

3. PATRONES DE DESARROLLO:
   - Separación de responsabilidades
   - Funciones puras cuando es posible
   - Estado centralizado de la aplicación
   - Reutilización de código

4. EXPERIENCIA DE USUARIO:
   - Feedback visual (loading, success, error)
   - Validación de formularios
   - Actualización en tiempo real
   - Responsive interactions

ESTRUCTURA DEL CÓDIGO:
- Configuración y constantes
- Estado de la aplicación
- Funciones de utilidad
- Manipulación del DOM
- Comunicación con API
- Event handlers
- Inicialización
*/

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

// URL base de la API - cambiar según el entorno
const API_BASE_URL = 'http://localhost:5000';

// Endpoints de la API
const API_ENDPOINTS = {
    tasks: `${API_BASE_URL}/tasks`,
    taskById: (id) => `${API_BASE_URL}/tasks/${id}`
};

// Configuración para requests
const REQUEST_CONFIG = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// Mensajes de la aplicación
const MESSAGES = {
    loading: 'Cargando...',
    creating: 'Creando tarea...',
    updating: 'Actualizando...',
    deleting: 'Eliminando...',
    success: {
        create: 'Tarea creada exitosamente',
        update: 'Tarea actualizada',
        delete: 'Tarea eliminada'
    },
    error: {
        network: 'Error de conexión con el servidor',
        create: 'Error al crear la tarea',
        update: 'Error al actualizar la tarea',
        delete: 'Error al eliminar la tarea',
        load: 'Error al cargar las tareas',
        validation: 'Por favor completa todos los campos requeridos'
    }
};

// ============================================================================
// ESTADO DE LA APLICACIÓN
// ============================================================================

/*
El estado centralizado nos ayuda a mantener consistencia en la UI
y facilita el debugging. En aplicaciones más grandes, usaríamos 
librerías como Redux o Zustand.
*/
const appState = {
    tasks: [],              // Array de tareas cargadas
    isLoading: false,       // Estado de carga general
    isSubmitting: false,    // Estado de envío de formulario
    lastError: null,        // Último error ocurrido
    filter: 'all'           // Filtro actual: 'all', 'pending', 'completed'
};

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

/*
Cachear referencias a elementos DOM mejora el rendimiento
y evita búsquedas repetitivas en el árbol DOM
*/
const elements = {
    // Formulario
    taskForm: null,
    taskTitle: null,
    taskDescription: null,
    submitBtn: null,
    submitBtnText: null,
    submitBtnLoading: null,
    
    // Lista de tareas
    tasksContainer: null,
    loadingState: null,
    emptyState: null,
    refreshBtn: null,
    
    // Estadísticas
    totalTasks: null,
    completedTasks: null,
    pendingTasks: null
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Función para hacer logging consistente en desarrollo
 * En producción, estos logs se podrían enviar a un servicio de monitoreo
 */
function log(message, data = null) {
    if (data) {
        console.log(`[TaskApp] ${message}`, data);
    } else {
        console.log(`[TaskApp] ${message}`);
    }
}

/**
 * Función para manejo centralizado de errores
 * Permite consistencia en el manejo de errores a través de la app
 */
function handleError(error, context = 'Unknown') {
    log(`Error in ${context}:`, error);
    appState.lastError = error;
    
    // En una app real, aquí enviaríamos el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
}

/**
 * Debounce function para limitar la frecuencia de llamadas
 * Útil para eventos como typing, scrolling, resizing
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Función para formatear fechas de manera legible
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Función para sanitizar texto del usuario (prevención básica de XSS)
 */
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// FUNCIONES DE MANIPULACIÓN DEL DOM
// ============================================================================

/**
 * Inicializa las referencias a elementos DOM
 * Se ejecuta una sola vez al cargar la página
 */
function initializeDOMElements() {
    // Formulario
    elements.taskForm = document.getElementById('taskForm');
    elements.taskTitle = document.getElementById('taskTitle');
    elements.taskDescription = document.getElementById('taskDescription');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.submitBtnText = elements.submitBtn?.querySelector('.btn-text');
    elements.submitBtnLoading = elements.submitBtn?.querySelector('.btn-loading');
    
    // Lista de tareas
    elements.tasksContainer = document.getElementById('tasksContainer');
    elements.loadingState = document.getElementById('loadingState');
    elements.emptyState = document.getElementById('emptyState');
    elements.refreshBtn = document.getElementById('refreshBtn');
    
    // Estadísticas
    elements.totalTasks = document.getElementById('totalTasks');
    elements.completedTasks = document.getElementById('completedTasks');
    elements.pendingTasks = document.getElementById('pendingTasks');
    
    // Verificar que los elementos críticos existen
    const criticalElements = ['taskForm', 'tasksContainer', 'loadingState'];
    const missingElements = criticalElements.filter(key => !elements[key]);
    
    if (missingElements.length > 0) {
        handleError(new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`), 'DOM Initialization');
    }
}

/**
 * Muestra u oculta el estado de carga
 */
function setLoadingState(isLoading) {
    if (!elements.loadingState) return;
    
    appState.isLoading = isLoading;
    
    if (isLoading) {
        elements.loadingState.style.display = 'block';
        elements.tasksContainer.style.display = 'none';
        elements.emptyState.style.display = 'none';
    } else {
        elements.loadingState.style.display = 'none';
    }
}

/**
 * Actualiza el estado del botón de envío
 */
function setSubmitButtonState(isSubmitting, text = MESSAGES.creating) {
    if (!elements.submitBtn) return;
    
    appState.isSubmitting = isSubmitting;
    elements.submitBtn.disabled = isSubmitting;
    
    if (isSubmitting) {
        elements.submitBtnText.style.display = 'none';
        elements.submitBtnLoading.style.display = 'inline';
        elements.submitBtnLoading.textContent = text;
    } else {
        elements.submitBtnText.style.display = 'inline';
        elements.submitBtnLoading.style.display = 'none';
    }
}

/**
 * Crea el HTML para una tarjeta de tarea
 * Esta función demuestra la creación dinámica de elementos complejos
 */
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card fade-in ${task.completed ? 'completed' : ''}`;
    taskCard.dataset.taskId = task.id;
    
    // Sanitizar los datos del usuario
    const safeTitle = sanitizeText(task.title);
    const safeDescription = task.description ? sanitizeText(task.description) : '';
    const formattedDate = formatDate(task.created_at);
    
    taskCard.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${safeTitle}</h3>
            <div class="task-actions">
                <button class="btn btn-sm btn-success toggle-task" data-task-id="${task.id}" title="Marcar como ${task.completed ? 'pendiente' : 'completada'}">
                    ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="btn btn-sm btn-danger delete-task" data-task-id="${task.id}" title="Eliminar tarea">
                    🗑️
                </button>
            </div>
        </div>
        ${safeDescription ? `<p class="task-description">${safeDescription}</p>` : ''}
        <div class="task-meta">
            <span class="task-date">Creada: ${formattedDate}</span>
            <span class="task-status">${task.completed ? 'Completada' : 'Pendiente'}</span>
        </div>
    `;
    
    return taskCard;
}

/**
 * Renderiza todas las tareas en el DOM
 */
function renderTasks() {
    if (!elements.tasksContainer) return;
    
    // Limpiar contenido anterior
    elements.tasksContainer.innerHTML = '';
    
    // Si no hay tareas, mostrar estado vacío
    if (appState.tasks.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.tasksContainer.style.display = 'none';
        return;
    }
    
    // Ocultar estado vacío y mostrar contenedor
    elements.emptyState.style.display = 'none';
    elements.tasksContainer.style.display = 'block';
    
    // Crear y agregar cada tarjeta de tarea
    appState.tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        elements.tasksContainer.appendChild(taskCard);
    });
    
    log(`Rendered ${appState.tasks.length} tasks`);
}

/**
 * Actualiza las estadísticas mostradas
 */
function updateStats() {
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    if (elements.totalTasks) elements.totalTasks.textContent = total;
    if (elements.completedTasks) elements.completedTasks.textContent = completed;
    if (elements.pendingTasks) elements.pendingTasks.textContent = pending;
}

/**
 * Limpia el formulario después de crear una tarea
 */
function clearForm() {
    if (elements.taskForm) {
        elements.taskForm.reset();
    }
}

// ============================================================================
// FUNCIONES DE COMUNICACIÓN CON LA API
// ============================================================================

/**
 * Función genérica para hacer requests a la API
 * Centraliza el manejo de errores y la configuración
 */
async function apiRequest(url, options = {}) {
    try {
        log(`API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            ...REQUEST_CONFIG,
            ...options
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        log(`API Response:`, data);
        
        return data;
    } catch (error) {
        handleError(error, `API Request to ${url}`);
        throw error;
    }
}

/**
 * Obtiene todas las tareas del servidor
 */
async function fetchTasks() {
    try {
        setLoadingState(true);
        const response = await apiRequest(API_ENDPOINTS.tasks);
        
        if (response.success) {
            appState.tasks = response.data || [];
            renderTasks();
            updateStats();
        } else {
            throw new Error(response.message || 'Error desconocido al cargar tareas');
        }
    } catch (error) {
        handleError(error, 'Fetch Tasks');
        showNotification(MESSAGES.error.load, 'error');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Crea una nueva tarea
 */
async function createTask(taskData) {
    try {
        setSubmitButtonState(true, MESSAGES.creating);
        
        const response = await apiRequest(API_ENDPOINTS.tasks, {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        
        if (response.success) {
            // Agregar la nueva tarea al estado
            appState.tasks.push(response.data);
            
            // Re-renderizar y actualizar stats
            renderTasks();
            updateStats();
            clearForm();
            
            showNotification(MESSAGES.success.create, 'success');
        } else {
            throw new Error(response.message || 'Error al crear la tarea');
        }
    } catch (error) {
        handleError(error, 'Create Task');
        showNotification(MESSAGES.error.create, 'error');
    } finally {
        setSubmitButtonState(false);
    }
}

/**
 * Actualiza una tarea existente
 */
async function updateTask(taskId, updates) {
    try {
        const response = await apiRequest(API_ENDPOINTS.taskById(taskId), {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        
        if (response.success) {
            // Actualizar la tarea en el estado local
            const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                appState.tasks[taskIndex] = { ...appState.tasks[taskIndex], ...updates };
            }
            
            // Re-renderizar y actualizar stats
            renderTasks();
            updateStats();
            
            showNotification(MESSAGES.success.update, 'success');
        } else {
            throw new Error(response.message || 'Error al actualizar la tarea');
        }
    } catch (error) {
        handleError(error, 'Update Task');
        showNotification(MESSAGES.error.update, 'error');
    }
}

/**
 * Elimina una tarea
 */
async function deleteTask(taskId) {
    try {
        const response = await apiRequest(API_ENDPOINTS.taskById(taskId), {
            method: 'DELETE'
        });
        
        if (response.success) {
            // Remover la tarea del estado local
            appState.tasks = appState.tasks.filter(t => t.id !== taskId);
            
            // Re-renderizar y actualizar stats
            renderTasks();
            updateStats();
            
            showNotification(MESSAGES.success.delete, 'success');
        } else {
            throw new Error(response.message || 'Error al eliminar la tarea');
        }
    } catch (error) {
        handleError(error, 'Delete Task');
        showNotification(MESSAGES.error.delete, 'error');
    }
}

// ============================================================================
// SISTEMA DE NOTIFICACIONES
// ============================================================================

/**
 * Muestra notificaciones temporales al usuario
 * En una app más compleja, usaríamos una librería como toastify
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline (en una app real estarían en CSS)
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Color según el tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Maneja el envío del formulario de nueva tarea
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtener y validar datos del formulario
    const title = elements.taskTitle?.value.trim();
    const description = elements.taskDescription?.value.trim();
    
    // Validación básica
    if (!title) {
        showNotification(MESSAGES.error.validation, 'error');
        elements.taskTitle?.focus();
        return;
    }
    
    // Crear objeto de tarea
    const taskData = {
        title: title,
        ...(description && { description: description })
    };
    
    // Enviar a la API
    createTask(taskData);
}

/**
 * Maneja los clics en botones de acción de tareas
 * Usa event delegation para manejar elementos creados dinámicamente
 */
function handleTaskAction(event) {
    const target = event.target;
    const taskId = parseInt(target.dataset.taskId);
    
    if (!taskId) return;
    
    if (target.classList.contains('toggle-task')) {
        // Alternar estado completado/pendiente
        const task = appState.tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { completed: !task.completed });
        }
    } else if (target.classList.contains('delete-task')) {
        // Confirmar eliminación
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            deleteTask(taskId);
        }
    }
}

/**
 * Maneja el botón de actualizar
 */
function handleRefresh() {
    fetchTasks();
}

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Formulario de nueva tarea
    if (elements.taskForm) {
        elements.taskForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Event delegation para botones de tareas
    if (elements.tasksContainer) {
        elements.tasksContainer.addEventListener('click', handleTaskAction);
    }
    
    // Botón de actualizar
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Manejo de errores globales (opcional)
    window.addEventListener('error', (event) => {
        handleError(event.error, 'Global Error Handler');
    });
    
    // Manejo de errores de promesas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
        handleError(event.reason, 'Unhandled Promise Rejection');
        event.preventDefault(); // Evita que se muestre en consola
    });
    
    log('Event listeners configured');
}

/**
 * Función principal de inicialización
 * Se ejecuta cuando el DOM está completamente cargado
 */
async function initializeApp() {
    log('Initializing Task Manager App...');
    
    try {
        // 1. Inicializar referencias DOM
        initializeDOMElements();
        
        // 2. Configurar event listeners
        setupEventListeners();
        
        // 3. Cargar datos iniciales
        await fetchTasks();
        
        // 4. Configurar actualizaciones periódicas (opcional)
        // setInterval(fetchTasks, 30000); // Cada 30 segundos
        
        log('App initialized successfully');
        
    } catch (error) {
        handleError(error, 'App Initialization');
        showNotification('Error al inicializar la aplicación', 'error');
    }
}

// ============================================================================
// PUNTO DE ENTRADA
// ============================================================================

/*
Esperamos a que el DOM esté completamente cargado antes de inicializar.
DOMContentLoaded es más rápido que window.onload porque no espera 
a que se carguen imágenes, stylesheets, etc.
*/
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // El DOM ya está cargado
    initializeApp();
}

// Exportar funciones para testing (en un entorno real)
// window.TaskApp = { fetchTasks, createTask, updateTask, deleteTask };

/*
===============================================================================
NOTAS EDUCATIVAS FINALES
===============================================================================

Este código demuestra varios conceptos importantes del desarrollo frontend:

1. SEPARACIÓN DE RESPONSABILIDADES:
   - Configuración centralizada
   - Estado de aplicación separado
   - Funciones específicas para cada tarea

2. MANEJO DE ASINCRONÍA:
   - Uso de async/await para mejor legibilidad
   - Manejo consistente de errores
   - Estados de carga para mejor UX

3. MANIPULACIÓN DEL DOM:
   - Cacheo de elementos para mejor rendimiento
   - Creación dinámica de contenido
   - Event delegation para elementos dinámicos

4. COMUNICACIÓN CON API:
   - Función genérica para requests
   - Manejo de diferentes tipos de respuesta
   - Configuración centralizada de endpoints

5. EXPERIENCIA DE USUARIO:
   - Estados de carga visual
   - Notificaciones informativas
   - Validación de formularios
   - Confirmaciones para acciones destructivas

6. BUENAS PRÁCTICAS:
   - Sanitización de entrada del usuario
   - Logging para debugging
   - Manejo global de errores
   - Código documentado

Para continuar aprendiendo, considera explorar:
- Frameworks como React, Vue o Angular
- Herramientas de build como Webpack o Vite  
- Testing con Jest o Vitest
- State management con Redux o Zustand
- TypeScript para mejor type safety
*/