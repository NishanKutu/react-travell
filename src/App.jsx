import React from 'react';
import Navbar from './components/Navbar';
import MyRout from './MyRout';
import Footer from './components/Footer';

const App = () => {
  return (
    <div>
      <Navbar />
      <main>
        <MyRout />
      </main>
      <Footer/>
    </div>
  );
}

export default App;