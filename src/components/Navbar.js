import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Nav = styled.nav`
  position: absolute; /* Absolute position to overlay on top */
  top: 0; /* Align to the top of the page */
  width: calc(100% - 200px); /* Full width minus space for map and car info */
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  padding: 1rem;
  z-index: 1000; /* Ensure it's on top of other content */
  background-color: transparent; /* No background color */
  left: 100px; /* Left padding to create space for map and car info */
`;

const NavItem = styled.li`
  list-style: none;
  margin: 0 1rem;

  a {
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #bada55;
    }
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const MobileNavToggle = styled.button`
  display: none; /* Hide initially on desktop */
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (max-width: 767px) {
    display: block; /* Display on mobile */
  }

  &:hover {
    color: #bada55;
  }
`;

const DesktopNav = styled.ul`
  display: flex;
  flex-direction: row;

  @media (max-width: 767px) {
    display: none; /* Hide on mobile */
  }
`;

const MobileNav = styled.ul`
  display: none;
  flex-direction: column;
  margin: 0;
  padding: 0;

  @media (max-width: 767px) {
    display: flex; /* Display on mobile */
  }
`;

const Navbar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  return (
    <Nav>
      <Logo>Ardusim</Logo>
      <MobileNavToggle onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
        {isMobileNavOpen ? 'Close' : 'Menu'}
      </MobileNavToggle>
      <DesktopNav>
        <NavItem><Link to="/">Home</Link></NavItem>
        <NavItem><Link to="/map">Map</Link></NavItem>
        <NavItem><Link to="/home">Car Info</Link></NavItem>
      </DesktopNav>
      <MobileNav style={{ display: isMobileNavOpen ? 'flex' : 'none' }}>
        <NavItem><Link to="/">Home</Link></NavItem>
        <NavItem><Link to="/map">Map</Link></NavItem>
        <NavItem><Link to="/home">Car Info</Link></NavItem>
      </MobileNav>
    </Nav>
  );
};

export default Navbar;
