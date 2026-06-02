import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";
import { IoTDataProvider } from "./context/IoTDataContext";

const App = () => {
  const [activeTab, setActiveTab] = useState("OPERATIONS");

  return (
    <Router>
      <IoTDataProvider>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-grow ml-72 overflow-y-auto">
            <Dashboard activeTab={activeTab} />
          </div>
        </div>
      </IoTDataProvider>
    </Router>
  );
};

export default App;
