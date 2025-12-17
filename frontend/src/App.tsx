import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HelloWorldProvider } from './context';
import { HelloWorldPage } from './pages';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Condomin-IA</h1>
        <p className="text-gray-600 mb-8">Welcome to the application</p>
        <Link
          to="/hello-world"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Hello World Example
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <HelloWorldProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hello-world" element={<HelloWorldPage />} />
        </Routes>
      </Router>
    </HelloWorldProvider>
  );
}

export default App;
