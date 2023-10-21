/** @format */

import homeBgImage from 'assets/images/homebg-img.png';
import BulbIcon from 'assets/icons/bulb-icon.svg?react';
import HandshakeIcon from 'assets/icons/handshake-icon.svg?react';
import MoneybagIcon from 'assets/icons/moneybag-icon.svg?react';
import SearchIcon from 'assets/icons/mag-glass.svg?react';
import PlusIcon from 'assets/icons/uil_plus.svg?react';
import Button from 'components/Button/Button';
import Card from './components/Card/Card';

import './Home.scss';

const Home = () => {
  const isAuth = localStorage.getItem('isAuth');

  return (
    <div className='home'>
      <img src={homeBgImage} alt={homeBgImage} />
      <header>
        <h2>Welcome to Bizconnect</h2>
        <p>
          Connecting Global all small and medium Businesses with their customers
        </p>
        {isAuth !== '1' && (
          <Button label='Get Started' variant='primary' to='/onboarding' />
        )}
        {isAuth === '1' && (
          <div className='button-wrapper'>
            <Button
              label='View your business'
              variant='primary'
              size='lg'
              to='/view-your-business'
              icon={<SearchIcon />}
            />
            <Button
              label='Add a new business'
              variant='transparent'
              size='lg'
              icon={<PlusIcon />}
            />
          </div>
        )}
      </header>

      <section className='section-why'>
        <h2>Why BizConnect?</h2>

        <Card
          icon={<BulbIcon />}
          title='Discover Businesses'
          description='Shinning the spotlight on Immigrant businesses in your neighbourhood
      with ease.'
        />
        <Card
          icon={<HandshakeIcon />}
          title='Connect with Businesses'
          description='BizConnect brings the best of local services to your fingertips, engage with businesses'
        />
        <Card
          icon={<MoneybagIcon />}
          title='Transact with Businesses'
          description='Transact with connected businesses...'
        />
      </section>
    </div>
  );
};

export default Home;
