import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Comparisons from "./components/Comparisons"; // Import the Comparisons page
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import React Router
import { IoTDataProvider } from "./context/IoTDataContext";

const App = () => {
  return (
    <Router>
      <IoTDataProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-grow p-6 ml-72 overflow-y-auto">
            {/* Define Routes for Navigation */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/comparisons/:optionId" element={<Comparisons />} />
            </Routes>
          </div>
        </div>
      </IoTDataProvider>
    </Router>
  );
};

export default App;
