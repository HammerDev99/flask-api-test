# API REST con Flask - Tutorial Completo

Una API REST completamente documentada para aprender Flask y los principios de las APIs REST.

## 🎯 Objetivos de Aprendizaje

- **Flask Framework**: Cómo crear aplicaciones web con Flask
- **API REST**: Principios y mejores prácticas REST
- **HTTP Methods**: GET, POST, PUT, DELETE
- **JSON**: Manejo de datos en formato JSON
- **Error Handling**: Manejo profesional de errores
- **Status Codes**: Códigos de estado HTTP correctos

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Ejecutar la aplicación
```bash
python app.py
```

### 3. Acceder a la API
- **URL Base**: http://localhost:5000
- **Documentación**: http://localhost:5000 (endpoint raíz)

## 📚 Endpoints Disponibles

### 🏠 Información General
```
GET /
```
Retorna información de la API y lista de endpoints.

### 📋 Obtener Todas las Tareas
```
GET /tasks
```
**Respuesta:**
```json
{
    "success": true,
    "data": [...],
    "count": 2,
    "message": "Se encontraron 2 tareas"
}
```

### 🔍 Obtener Tarea Específica
```
GET /tasks/<id>
```
**Ejemplo:**
```bash
curl http://localhost:5000/tasks/1
```

### ➕ Crear Nueva Tarea
```
POST /tasks
Content-Type: application/json
```
**Body:**
```json
{
    "title": "Mi nueva tarea",
    "description": "Descripción opcional",
    "completed": false
}
```

### ✏️ Actualizar Tarea
```
PUT /tasks/<id>
Content-Type: application/json
```
**Body (todos los campos opcionales):**
```json
{
    "title": "Tarea actualizada",
    "completed": true
}
```

### 🗑️ Eliminar Tarea
```
DELETE /tasks/<id>
```

## 🧪 Ejemplos de Uso con curl

### Listar todas las tareas
```bash
curl -X GET http://localhost:5000/tasks
```

### Obtener tarea específica
```bash
curl -X GET http://localhost:5000/tasks/1
```

### Crear nueva tarea
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Aprender APIs REST", "description": "Estudiar conceptos fundamentales"}'
```

### Actualizar tarea
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Eliminar tarea
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

## 🏗️ Conceptos Técnicos Explicados

### ¿Qué es REST?
**REST** (Representational State Transfer) es un estilo arquitectónico para diseñar servicios web. Principios clave:

1. **Stateless**: Cada petición es independiente
2. **Resource-based**: URLs representan recursos
3. **HTTP Methods**: Usar métodos HTTP semánticamente correctos
4. **JSON**: Formato estándar para intercambio de datos

### Métodos HTTP y Operaciones CRUD

| Método HTTP | Operación CRUD | Propósito | Idempotente |
|-------------|----------------|-----------|-------------|
| GET | READ | Obtener datos | ✅ Sí |
| POST | CREATE | Crear recursos | ❌ No |
| PUT | UPDATE | Actualizar completo | ✅ Sí |
| DELETE | DELETE | Eliminar recursos | ✅ Sí |

### Códigos de Estado HTTP Importantes

- **200 OK**: Petición exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos del cliente
- **404 Not Found**: Recurso no encontrado
- **405 Method Not Allowed**: Método HTTP no soportado
- **500 Internal Server Error**: Error del servidor

### Estructura de Respuestas JSON

Todas las respuestas siguen un formato consistente:

```json
{
    "success": true/false,
    "data": {...},           // Solo en respuestas exitosas
    "error": "...",          // Solo en errores
    "message": "...",        // Mensaje descriptivo
    "count": 5               // Metadatos cuando aplica
}
```

## 🔧 Componentes de Flask Explicados

### @app.route()
Decorador que define rutas y métodos HTTP:
```python
@app.route('/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'GET':
        # Obtener tareas
    elif request.method == 'POST':
        # Crear tarea
```

### request.json
Objeto que contiene datos JSON del body:
```python
title = request.json.get('title')  # Obtener campo específico
if not request.json:              # Validar que hay JSON
```

### jsonify()
Convierte diccionarios Python a respuestas JSON:
```python
return jsonify({'success': True}), 201  # JSON + status code
```

### Convertidores de Ruta
Flask puede convertir parámetros automáticamente:
- `<int:id>` - Solo acepta enteros
- `<string:name>` - Acepta strings (default)
- `<float:price>` - Solo acepta decimales

## 🛡️ Manejo de Errores

La API incluye manejo robusto de errores:

1. **Validación de datos**: Campos obligatorios, tipos correctos
2. **Recursos no encontrados**: 404 para IDs inexistentes
3. **Métodos no permitidos**: 405 para métodos HTTP incorrectos
4. **Errores del servidor**: 500 con mensajes seguros

## 🚀 Próximos Pasos

Para expandir esta API puedes agregar:

1. **Base de datos**: SQLAlchemy para persistencia real
2. **Autenticación**: JWT tokens para seguridad
3. **Validación**: Marshmallow para validación avanzada
4. **Paginación**: Para listas grandes de recursos
5. **Filtros**: Query parameters para búsquedas
6. **Testing**: Tests unitarios y de integración
7. **Documentación**: Swagger/OpenAPI
8. **CORS**: Para llamadas desde navegadores

## 📖 Recursos Adicionales

- [Flask Documentation](https://flask.palletsprojects.com/)
- [REST API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [JSON API Specification](https://jsonapi.org/)

¡Feliz aprendizaje! 🎉
