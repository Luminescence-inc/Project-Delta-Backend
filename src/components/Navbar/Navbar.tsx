/** @format */

import { useState } from 'react';
// import { Link } from 'react-router-dom';

import MenuIcon from 'assets/icons/menu-icon.svg?react';
import CancelIcon from 'assets/icons/cancel-icon.svg?react';
import './Navbar.scss';
import Button from 'components/Button/Button';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className='navbar'>
      {!menuOpen && (
        <nav>
          <h2>Logo</h2>
          <MenuIcon className='icon-menu' onClick={() => setMenuOpen(true)} />
        </nav>
      )}
      {menuOpen && (
        <div className='nav-content'>
          <CancelIcon
            className='icon-cancel'
            onClick={() => setMenuOpen(false)}
          />

          <ul className='nav-content-items'>
            <li>
              <p>About us</p>
            </li>
            <li>
              <p>Discover Businesses</p>
            </li>
            <hr />
            <Button label='Sign up' variant='primary' to='/signup' />
            <Button label='Login' variant='transparent' />
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
