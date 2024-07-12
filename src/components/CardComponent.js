import React, { useEffect } from 'react';
import { TweenMax } from 'gsap';
import './CardComponent.css';
import Logo from '../images/trace.svg';
import { useNavigate } from 'react-router-dom';

const CardComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const card = document.querySelector('.card');
    const body = document.querySelector('body');
    const btn = document.querySelector('.btn');

    const handleCardClick = () => {
      if (body.classList.contains('is-open')) {
        body.classList.remove('is-open');
        btn.innerHTML = 'View';
      } else {
        body.classList.add('is-open');
        btn.innerHTML = 'Close';
        TweenMax.set('.card', { clearProps: 'all' });
      }
    };

    const handleMouseMove = (e) => {
      if (body.classList.contains('is-open')) {
        e.preventDefault();
      } else {
        const halfW = card.clientWidth / 2;
        const halfH = card.clientHeight / 2;
        const coorX = halfW - (e.pageX - card.offsetLeft);
        const coorY = halfH - (e.pageY - card.offsetTop);
        const degX = (coorY / halfH) * 10 + 'deg';
        const degY = (coorX / halfW) * -10 + 'deg';
        card.style.transform = `perspective(1600px) translate3d(0, 0px, 0) scale(0.6) rotateX(${degX}) rotateY(${degY})`;
        const cardTitleWrap = card.querySelector('.card-title-wrap');
        cardTitleWrap.style.transform = `perspective(1600px) translate3d(0, 0, 200px) rotateX(${degX}) rotateY(${degY})`;
      }
    };

    const handleMouseOut = () => {
      card.style = '';
      const cardTitleWrap = card.querySelector('.card-title-wrap');
      cardTitleWrap.style = '';
    };

    card.addEventListener('click', handleCardClick);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseout', handleMouseOut);

    return () => {
      card.removeEventListener('click', handleCardClick);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const handleLogoClick = () => {
    navigate('/map');
  };

  return (
    <div className="card">
      <div className="card-title-wrap">
        <h1 className="title" onClick={handleLogoClick}>
          <img src={Logo} alt="Logo" className="logo" />
        </h1>
        <button className="btn" onClick={handleLogoClick}>View</button>
      </div>
      <div className="card-img"></div>
    </div>
  );
};

export default CardComponent;
