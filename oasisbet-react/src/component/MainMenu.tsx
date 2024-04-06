import './MainMenu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import Button from 'react-bootstrap/Button';
import React from 'react';

export default function MainMenu(){
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav">
                    <li className="nav-item">
                        <Button className="nav-link main-menu-link">Odds</Button>
                    </li>
                    <li className="nav-item">
                        <Button className="nav-link main-menu-link">Result</Button>
                    </li>
                   <li className="nav-item">
                        <Button className="nav-link main-menu-link">Account</Button>
                    </li>
                    </ul>
                </div>

                <div className="right-navbar">
                    <ul className="navbar-nav">
                        <li className="nav-item user-menu-display">
                            <span style={{borderRight: '1px solid #ccc'}}>LOGGED IN &nbsp;</span>
                            <Button type="button" variant="secondary" className="btn-logout">Logout</Button>
                            <FontAwesomeIcon icon={faUser} className="user-icon"/>
                            <span className="login-username-tag">&nbsp; CHOONANN</span>
                        </li>
                        <li className ="nav-item">
                            <span className="balance-textbox">Balance: $99.88</span>
                        </li>
                    </ul>
                </div>
            </nav>

            
        </header>
    );
}