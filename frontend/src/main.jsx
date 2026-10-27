import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ChatNotificationProvider } from './contexts/ChatNotificationContext.jsx';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
 <StrictMode>
    <AuthProvider>  {/* <-- Wrap it around everything! */}

      <ChatNotificationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
       </ChatNotificationProvider>
    </AuthProvider>
  </StrictMode>,
)



