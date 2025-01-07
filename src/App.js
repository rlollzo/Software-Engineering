import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import NavBar from './NavBar';
import Community from './Community';
import SignUp from './SignUp';
import Login from './Login';
import Home from './Home'; 
import Real from './Components/Real';

import SettlementPrice from './Components/SettlementPrice';
import PastTransactionTrend from './Components/PastTransactionTrend';
import Previous from './Components/Previous';
import News from './Components/News';  
import ModelLSTM from './Components/ModelLSTM.js'

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} /> 
          
          <Route path="/SettlementPrice" element={<SettlementPrice />} /> 
          <Route path="/Real" element={<Real />} /> 
          <Route path="/PastTransactionTrend" element={<PastTransactionTrend />} />  
          <Route path="/Previous" element={<Previous />} /> 
          <Route path="/News" element={<News />} />  
          <Route path="/ModelLSTM" element={<ModelLSTM />} />  

        </Routes>
      </div>
    </Router>
  );
}

export default App;
