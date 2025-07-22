"""
API REST con Flask - Tutorial Completo
=====================================

Este archivo contiene una API REST completa usando Flask para gestionar tareas.
Incluye todas las operaciones CRUD (Create, Read, Update, Delete) con documentación
detallada para comprender tanto Flask como los principios REST.

Autor: Tutorial Flask API REST
Fecha: 2025
"""

# Importaciones necesarias
from flask import Flask, request, jsonify  # Flask framework y utilidades
from datetime import datetime  # Para manejar fechas

# Inicialización de la aplicación Flask
# Flask(__name__) crea una instancia de la aplicación
# __name__ le dice a Flask dónde encontrar recursos como templates
app = Flask(__name__)

# =============================================================================
# ALMACÉN DE DATOS EN MEMORIA
# =============================================================================
# En una aplicación real, usarías una base de datos
# Aquí usamos listas y diccionarios para simplicidad educativa

tasks = [
    {
        'id': 1,
        'title': 'Aprender Flask',
        'description': 'Crear mi primera API REST',
        'completed': False,
        'created_at': datetime.now().isoformat()
    },
    {
        'id': 2,
        'title': 'Estudiar APIs REST',
        'description': 'Entender los principios REST',
        'completed': True,
        'created_at': datetime.now().isoformat()
    }
]

# Variable global para generar IDs únicos
# En una app real, la base de datos manejaría esto automáticamente
next_id = 3

# =============================================================================
# ENDPOINT DE INFORMACIÓN GENERAL
# =============================================================================

@app.route('/')
def home():
    """
    Endpoint raíz - Información general de la API
    
    Método HTTP: GET
    Ruta: /
    
    ¿Qué hace?
    - Proporciona información básica sobre la API
    - Lista todos los endpoints disponibles
    - Es útil para documentación automática
    
    Retorna:
    - JSON con información de la API y endpoints disponibles
    - Status code: 200 (OK)
    """
    return jsonify({
        'message': 'API REST con Flask - Gestión de Tareas',
        'version': '1.0',
        'endpoints': {
            'GET /': 'Información de la API',
            'GET /tasks': 'Obtener todas las tareas',
            'GET /tasks/<id>': 'Obtener una tarea específica',
            'POST /tasks': 'Crear nueva tarea',
            'PUT /tasks/<id>': 'Actualizar tarea completa',
            'DELETE /tasks/<id>': 'Eliminar tarea'
        },
        'ejemplo_uso': {
            'crear_tarea': {
                'metodo': 'POST',
                'url': '/tasks',
                'body': {
                    'title': 'Mi nueva tarea',
                    'description': 'Descripción opcional',
                    'completed': False
                }
            }
        }
    })

# =============================================================================
# OPERACIONES CRUD - READ (LEER)
# =============================================================================

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """
    Obtener todas las tareas (READ - Lista completa)
    
    Método HTTP: GET
    Ruta: /tasks
    Parámetros: Ninguno
    
    ¿Qué hace?
    - Recupera todas las tareas del almacén de datos
    - Implementa la operación 'READ' del CRUD
    - En REST, GET se usa para obtener recursos sin modificarlos
    
    Características REST:
    - Idempotente: llamar múltiples veces produce el mismo resultado
    - Seguro: no modifica el estado del servidor
    - Cacheable: las respuestas pueden ser cacheadas
    
    Retorna:
    - JSON con todas las tareas
    - Incluye metadatos (success, count)
    - Status code: 200 (OK)
    """
    return jsonify({
        'success': True,
        'data': tasks,  # Lista completa de tareas
        'count': len(tasks),  # Metadato útil: cantidad total
        'message': f'Se encontraron {len(tasks)} tareas'
    })

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """
    Obtener una tarea específica por ID (READ - Elemento individual)
    
    Método HTTP: GET
    Ruta: /tasks/<int:task_id>
    Parámetros de ruta: 
    - task_id (int): ID único de la tarea
    
    ¿Qué hace?
    - Busca una tarea específica por su ID
    - Implementa la operación 'READ' para un recurso individual
    - Usa <int:task_id> para convertir automáticamente a entero
    
    Características de Flask:
    - <int:task_id> es un convertidor de ruta que valida que sea entero
    - Si no es entero, Flask devuelve 404 automáticamente
    - task_id se pasa como parámetro a la función
    
    Algoritmo:
    1. Buscar en la lista usando next() con generator expression
    2. Si no existe, retornar error 404
    3. Si existe, retornar la tarea
    
    Retorna:
    - Si existe: JSON con la tarea (200)
    - Si no existe: JSON con error (404)
    """
    # Buscar tarea usando generator expression
    # next() encuentra el primer elemento que cumple la condición
    # Si no encuentra nada, retorna None (segundo parámetro)
    task = next((task for task in tasks if task['id'] == task_id), None)
    
    if task is None:
        # Error 404: Not Found - Recurso no existe
        return jsonify({
            'success': False,
            'error': 'Tarea no encontrada',
            'message': f'No existe tarea con ID {task_id}'
        }), 404
    
    # Éxito: retornar la tarea encontrada
    return jsonify({
        'success': True,
        'data': task
    })

# =============================================================================
# OPERACIONES CRUD - CREATE (CREAR)
# =============================================================================

@app.route('/tasks', methods=['POST'])
def create_task():
    """
    Crear una nueva tarea (CREATE)
    
    Método HTTP: POST
    Ruta: /tasks
    Content-Type: application/json
    
    Body esperado (JSON):
    {
        "title": "string" (obligatorio),
        "description": "string" (opcional),
        "completed": boolean (opcional, default: false)
    }
    
    ¿Qué hace?
    - Crea una nueva tarea en el sistema
    - Implementa la operación 'CREATE' del CRUD
    - POST es el método estándar para crear recursos
    
    Características REST:
    - No idempotente: crear el mismo recurso múltiples veces crea duplicados
    - Modifica el estado del servidor
    - Retorna 201 (Created) en caso de éxito
    
    Validaciones:
    1. Verifica que el request tenga JSON
    2. Verifica que el campo 'title' exista y no esté vacío
    3. Usa valores por defecto para campos opcionales
    
    Algoritmo:
    1. Validar datos de entrada
    2. Crear diccionario con los datos de la nueva tarea
    3. Asignar ID único y timestamp
    4. Agregar a la lista de tareas
    5. Incrementar contador de IDs
    6. Retornar la tarea creada
    """
    global next_id  # Necesario para modificar variable global
    
    # Validación 1: Verificar que el request tenga JSON
    if not request.json:
        return jsonify({
            'success': False,
            'error': 'Content-Type debe ser application/json',
            'message': 'El body del request debe ser JSON válido'
        }), 400  # Bad Request
    
    # Validación 2: Verificar campos obligatorios
    if not request.json.get('title'):
        return jsonify({
            'success': False,
            'error': 'El campo title es obligatorio',
            'message': 'Debe proporcionar un título para la tarea'
        }), 400  # Bad Request
    
    # Crear nueva tarea con los datos proporcionados
    new_task = {
        'id': next_id,  # ID único autogenerado
        'title': request.json['title'],  # Campo obligatorio
        'description': request.json.get('description', ''),  # Opcional, default ''
        'completed': request.json.get('completed', False),  # Opcional, default False
        'created_at': datetime.now().isoformat()  # Timestamp automático
    }
    
    # Agregar al almacén de datos
    tasks.append(new_task)
    next_id += 1  # Incrementar para próxima tarea
    
    # Retornar tarea creada con status 201 (Created)
    return jsonify({
        'success': True,
        'message': 'Tarea creada exitosamente',
        'data': new_task
    }), 201

# =============================================================================
# OPERACIONES CRUD - UPDATE (ACTUALIZAR)
# =============================================================================

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """
    Actualizar una tarea completa (UPDATE)
    
    Método HTTP: PUT
    Ruta: /tasks/<int:task_id>
    Content-Type: application/json
    
    Body (JSON) - todos los campos son opcionales:
    {
        "title": "string",
        "description": "string",
        "completed": boolean
    }
    
    ¿Qué hace?
    - Actualiza una tarea existente
    - Implementa la operación 'UPDATE' del CRUD
    - PUT se usa para actualizaciones completas del recurso
    
    Diferencia PUT vs PATCH:
    - PUT: reemplaza el recurso completo (lo que hacemos aquí parcialmente)
    - PATCH: actualiza solo campos específicos
    - En este ejemplo usamos PUT pero con lógica de PATCH (más práctica)
    
    Características REST:
    - Idempotente: aplicar la misma actualización múltiples veces = mismo resultado
    - Requiere que el recurso exista previamente
    
    Algoritmo:
    1. Buscar la tarea por ID
    2. Si no existe, retornar 404
    3. Validar que haya datos JSON
    4. Actualizar solo los campos proporcionados
    5. Mantener valores existentes para campos no proporcionados
    6. Retornar tarea actualizada
    """
    # Buscar tarea existente
    task = next((task for task in tasks if task['id'] == task_id), None)
    
    if task is None:
        return jsonify({
            'success': False,
            'error': 'Tarea no encontrada',
            'message': f'No existe tarea con ID {task_id} para actualizar'
        }), 404
    
    # Validar que haya datos JSON
    if not request.json:
        return jsonify({
            'success': False,
            'error': 'Datos JSON requeridos',
            'message': 'Debe enviar al menos un campo para actualizar'
        }), 400
    
    # Actualizar campos proporcionados, mantener existentes si no se proporcionan
    # get(clave, default) retorna el valor si existe, sino el default
    task['title'] = request.json.get('title', task['title'])
    task['description'] = request.json.get('description', task['description'])
    task['completed'] = request.json.get('completed', task['completed'])
    
    return jsonify({
        'success': True,
        'message': 'Tarea actualizada exitosamente',
        'data': task
    })

# =============================================================================
# OPERACIONES CRUD - DELETE (ELIMINAR)
# =============================================================================

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    Eliminar una tarea (DELETE)
    
    Método HTTP: DELETE
    Ruta: /tasks/<int:task_id>
    Parámetros: task_id (int) en la URL
    
    ¿Qué hace?
    - Elimina una tarea del sistema
    - Implementa la operación 'DELETE' del CRUD
    - DELETE es el método estándar para eliminar recursos
    
    Características REST:
    - Idempotente: eliminar un recurso ya eliminado debería tener el mismo efecto
    - En este caso, si ya no existe retornamos 404
    - Algunos APIs retornan 200 incluso si no existía (design choice)
    
    Algoritmo:
    1. Buscar la tarea por ID
    2. Si no existe, retornar 404
    3. Si existe, eliminarla de la lista
    4. Retornar confirmación de eliminación
    
    Técnica de eliminación:
    - Recreamos la lista sin el elemento a eliminar
    - En bases de datos usarías DELETE FROM table WHERE id = task_id
    """
    global tasks  # Necesario para modificar la lista global
    
    # Verificar que la tarea existe antes de eliminar
    task = next((task for task in tasks if task['id'] == task_id), None)
    
    if task is None:
        return jsonify({
            'success': False,
            'error': 'Tarea no encontrada',
            'message': f'No existe tarea con ID {task_id} para eliminar'
        }), 404
    
    # Eliminar tarea: crear nueva lista sin la tarea a eliminar
    # List comprehension: mantener todas las tareas excepto la que tiene task_id
    tasks = [task for task in tasks if task['id'] != task_id]
    
    return jsonify({
        'success': True,
        'message': f'Tarea con ID {task_id} eliminada exitosamente'
    })

# =============================================================================
# MANEJO DE ERRORES GLOBALES
# =============================================================================

@app.errorhandler(404)
def not_found(error):
    """
    Manejador de errores 404 - Página no encontrada
    
    ¿Cuándo se ejecuta?
    - Cuando se accede a una ruta que no existe
    - Cuando Flask no puede convertir parámetros de ruta (ej: /tasks/abc)
    
    Mejora la experiencia del usuario:
    - Respuesta consistente en formato JSON
    - Mensaje explicativo
    - Mantiene el formato de respuesta de la API
    """
    return jsonify({
        'success': False,
        'error': 'Endpoint no encontrado',
        'message': 'La ruta solicitada no existe en esta API',
        'codigo_status': 404
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """
    Manejador de errores 405 - Método no permitido
    
    ¿Cuándo se ejecuta?
    - Cuando se usa un método HTTP no soportado en una ruta
    - Ejemplo: POST /tasks/1 (solo se permite PUT y DELETE)
    """
    return jsonify({
        'success': False,
        'error': 'Método HTTP no permitido',
        'message': 'El método HTTP usado no está permitido para esta ruta',
        'codigo_status': 405
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """
    Manejador de errores 500 - Error interno del servidor
    
    ¿Cuándo se ejecuta?
    - Cuando hay un error no manejado en el código
    - Errores de programación, divisiones por cero, etc.
    
    En producción:
    - No mostrar detalles del error (seguridad)
    - Registrar el error en logs
    - Retornar mensaje genérico
    """
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor',
        'message': 'Ocurrió un error inesperado. Intente nuevamente.',
        'codigo_status': 500
    }), 500

# =============================================================================
# EJECUCIÓN DE LA APLICACIÓN
# =============================================================================

if __name__ == '__main__':
    """
    Punto de entrada de la aplicación
    
    ¿Qué hace?
    - Inicia el servidor de desarrollo de Flask
    - Solo se ejecuta si el archivo se ejecuta directamente (no importado)
    
    Parámetros de app.run():
    - debug=True: Activa modo depuración
      * Reinicia automáticamente cuando cambias código
      * Muestra errores detallados en el navegador
      * NUNCA usar en producción (inseguro)
    
    - host='0.0.0.0': Escucha en todas las interfaces de red
      * Permite conexiones desde otras máquinas
      * Default es '127.0.0.1' (solo local)
    
    - port=5000: Puerto donde escucha el servidor
      * Default de Flask
      * Puedes cambiarlo si está ocupado
    
    Para producción usar:
    - Gunicorn, uWSGI o similar
    - Nginx como proxy reverso
    - Variables de entorno para configuración
    """
    print("🚀 Iniciando API REST con Flask...")
    print("📍 Servidor disponible en: http://localhost:5000")
    print("🛑 Presiona Ctrl+C para detener")
    
    app.run(
        debug=True,      # Modo desarrollo
        host='0.0.0.0',  # Escuchar en todas las interfaces
        port=5000        # Puerto del servidor
    )