/** @format */

import { useState } from 'react';

import { Link } from 'react-router-dom';

import MenuIcon from 'assets/icons/menu-icon.svg?react';
import CancelIcon from 'assets/icons/cancel-icon.svg?react';
import ArrowUpIcon from 'assets/icons/arrow-up.svg?react';
import EditIcon from 'assets/icons/edit-icon.svg?react';
import PlusIcon from 'assets/icons/uil_plus.svg?react';
import Button from 'components/Button/Button';
import './Navbar.scss';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const isAuth = localStorage.getItem('isAuth');

  return (
    <div className='navbar'>
      {!menuOpen && (
        <nav>
          <Link to='/'>
            <h2>Logo</h2>
          </Link>
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
            {isAuth === '1' && (
              <>
                <li
                  className='edit-business'
                  onClick={() => setEditProfileOpen((prev) => !prev)}
                >
                  <p>Edit Businesses Profile</p>
                  <ArrowUpIcon
                    className={editProfileOpen ? '' : 'arrow-down'}
                    width={14}
                    height={14}
                  />
                </li>
                {editProfileOpen && (
                  <>
                    <li className='business-list-item'>
                      <p>Ngozi Cooks</p>
                      <EditIcon width={22} height={22} />
                    </li>
                    <li className='business-list-item'>
                      <p>Shenmine Pudding</p>
                      <EditIcon width={22} height={22} />
                    </li>
                    <li className='business-list-item'>
                      <p>Uzoma's Pudding</p>
                      <EditIcon width={22} height={22} />
                    </li>
                    <li className='business-list-item'>
                      <p>Coffee and Tea Chi</p>
                      <EditIcon width={22} height={22} />
                    </li>
                  </>
                )}

                <Button
                  className='add-bus-btn'
                  label='Add a new business'
                  variant='transparent'
                  size='lg'
                  icon={<PlusIcon />}
                />
              </>
            )}
            <hr />
            {isAuth !== '1' && (
              <Button
                label='Sign up'
                className='mb-4'
                variant='primary'
                to='/signup'
                onClick={() => setMenuOpen(false)}
              />
            )}
            <Button
              label={isAuth === '1' ? 'Log out' : 'Login'}
              variant='transparent'
              to='/login'
              onClick={() => {
                localStorage.setItem('isAuth', '0');
                setMenuOpen(false);
              }}
            />

            <p className='my-account'>My Account</p>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
