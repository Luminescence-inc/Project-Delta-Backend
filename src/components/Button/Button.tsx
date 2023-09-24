/** @format */

import { Link } from 'react-router-dom';

import './Button.scss';

interface IButton {
  label: string;
  variant?: 'primary' | 'transparent' | 'default';
  to?: string;
}

const Button = ({ label, variant = 'default', to = '' }: IButton) => {
  const ButtonComponent = to ? Link : 'button';
  return (
    <ButtonComponent className={`btn btn-${variant}`} to={to}>
      {label}
    </ButtonComponent>
  );
};

export default Button;
