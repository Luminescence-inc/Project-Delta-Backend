/** @format */

import { Route, Routes } from 'react-router-dom';

import Footer from 'components/Footer/Footer';
import Navbar from 'components/Navbar/Navbar';
import Home from 'pages/Home/Home';

function App() {
  return (
    <div id='app-container'>
      <Navbar />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
