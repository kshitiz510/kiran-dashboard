import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Comparisons from "./components/Comparisons"; // Import the Comparisons page
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import React Router

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow p-6 ml-72 overflow-y-auto">
          {/* Define Routes for Navigation */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comparisons" element={<Comparisons />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
