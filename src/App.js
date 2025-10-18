// src/App.js
import React from 'react';
import TodoList from './TodoList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>React To-Do List ✅</h1>
      </header>
      <TodoList />
    </div>
  );
}

export default App;