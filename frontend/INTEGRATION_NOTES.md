# Backend Integration Guide

## ✅ What's Already Implemented

This frontend is **production-ready** with complete CSRF authentication:

- **CSRF Token Management**: Automatically fetches and uses tokens
- **Login Form**: Complete with validation and error handling  
- **API Integration**: Ready for Flask endpoints
- **Loading States**: All UI feedback implemented
- **Persian UI**: Error messages and interface

## 🔧 Required Flask Implementation

Need to implement **2 endpoints**:

### 1. CSRF Token Endpoint
```python
@app.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    token = generate_csrf()
    return {'csrf_token': token}
```

### 2. Login Endpoint  
```python
@app.route('/login', methods=['POST'])
def login():
    csrf_token = request.headers.get('X-CSRFToken')
    data = request.get_json()
    
    # Validate CSRF + authenticate user
    if validate_csrf(csrf_token) and authenticate_user(data['email'], data['password']):
        return {'success': True, 'message': 'Login successful'}
    else:
        return {'error': 'Invalid credentials'}, 401
```


## ⚠️ Critical Requirements

1. **CORS**: Must have `supports_credentials=True`
2. **SPA Routing**: All non-API routes must return `index.html` 
3. **CSRF Headers**: Accept `X-CSRFToken` in login requests

## 🔍 API Contract

**Frontend sends:**
- `GET /csrf-token` → Expects: `{'csrf_token': 'token'}`
- `POST /login` with headers `X-CSRFToken` + body `{'email': '...', 'password': '...'}`

**Backend responds:**
- Success: `{'success': True, 'message': '...'}`  
- Error: `{'error': 'error message'}` with appropriate HTTP status
