/** @format */

import { Route, Routes } from 'react-router-dom';

import Footer from 'components/Footer/Footer';
import Navbar from 'components/Navbar/Navbar';
import Home from 'pages/Home/Home';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
