// src/TodoList.js
import React, { useState, useEffect } from 'react'; // 1. Import useEffect

// API key is read from environment variable REACT_APP_OPENWEATHER_KEY
// Create a .env (or .env.local) in project root with:
// REACT_APP_OPENWEATHER_KEY=your_real_key_here
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;

const TodoList = () => {
    // 2. Change useState to load from localStorage
    const [todos, setTodos] = useState(() => {
        const savedTodos = localStorage.getItem('todos');
        return savedTodos ? JSON.parse(savedTodos) : [];
    });
    
    const [inputValue, setInputValue] = useState('');
    // Weather feature state
    const [pinCode, setPinCode] = useState('');
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState('');

    // 3. Add useEffect to save todos to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    // ... (the rest of your functions: handleAddTodo, handleToggleComplete, etc. remain the same)
    
    // Function to handle adding a new todo
    const handleAddTodo = () => {
        if (inputValue.trim() === '') return;
        const newTodo = {
            id: Date.now(),
            text: inputValue,
            completed: false,
        };
        setTodos([...todos, newTodo]);
        setInputValue('');
    };
    
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAddTodo();
        }
    };

    const handleToggleComplete = (id) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(updatedTodos);
    };

    const handleDeleteTodo = (id) => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
    };

    // --- Weather by Indian PIN code ---
    const validPIN = (pin) => /^\d{6}$/.test(pin);

    const fetchWeatherByPIN = async () => {
        setWeather(null);
        setWeatherError('');

        if (!OPENWEATHER_API_KEY) {
            setWeatherError('OpenWeatherMap API key not found. Create a .env file with REACT_APP_OPENWEATHER_KEY and restart the dev server. See .env.example');
            return;
        }

        if (!validPIN(pinCode)) {
            setWeatherError('Enter a valid 6-digit Indian PIN code.');
            return;
        }

        setWeatherLoading(true);
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(pinCode)},IN&units=metric&appid=${encodeURIComponent(OPENWEATHER_API_KEY)}`;
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                const msg = body && body.message ? body.message : `HTTP ${res.status}`;
                throw new Error(msg);
            }
            const data = await res.json();
            setWeather(data);
        } catch (err) {
            setWeatherError(err.message || 'Failed to fetch weather');
        } finally {
            setWeatherLoading(false);
        }
    };

        return (
                <>
                <div className="todo-container">
            <div className="input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                />
                <button onClick={handleAddTodo}>Add</button>
            </div>

            <ul className="todo-list">
                {todos.map(todo => (
                    <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                        <span onClick={() => handleToggleComplete(todo.id)}>
                            {todo.text}
                        </span>
                        <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
    </div>

    <div className="weather-container" style={{ marginTop: 24, padding: 12, borderTop: '1px solid #eee' }}>
            <h3>Get Weather by Indian PIN code</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                    type="text"
                    placeholder="PIN code (e.g. 110001)"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    style={{ flex: 1 }}
                />
                <button onClick={fetchWeatherByPIN} disabled={weatherLoading}>
                    {weatherLoading ? 'Fetching…' : 'Get Weather'}
                </button>
            </div>

            {weatherError && <div style={{ color: '#b00' }}>{weatherError}</div>}

            {weather && (
                <div style={{ marginTop: 8, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
                    <div><strong>Location:</strong> {weather.name || 'Unknown'}</div>
                    <div><strong>Weather:</strong> {weather.weather && weather.weather[0] ? weather.weather[0].description : 'N/A'}</div>
                    <div><strong>Temperature:</strong> {weather.main ? `${weather.main.temp} °C` : 'N/A'}</div>
                    <div><strong>Humidity:</strong> {weather.main ? `${weather.main.humidity}%` : 'N/A'}</div>
                </div>
            )}
        </div>
        </>
    );
};

export default TodoList;