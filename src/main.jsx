import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import { createRoot } from 'react-dom/client'
import App from './Components/App.jsx'
import './firebase.js';

createRoot(document.getElementById('root')).render(
  <App />
)
