/** @format */

import { Link } from 'react-router-dom';

import './Button.scss';

interface IButton {
  label: string;
  variant?: 'primary' | 'transparent' | 'default';
  size?: 'md' | 'lg';
  to?: string;
  onClick?: () => void;
  icon?: JSX.Element;
}

const Button = ({
  label,
  variant = 'default',
  size = 'md',
  to = '',
  onClick,
  icon,
}: IButton) => {
  const ButtonComponent = to ? Link : 'button';
  return (
    <ButtonComponent
      className={`btn btn-${variant} btn-${size}`}
      to={to}
      onClick={onClick}
    >
      {icon ? icon : null}
      {label}
    </ButtonComponent>
  );
};

export default Button;
