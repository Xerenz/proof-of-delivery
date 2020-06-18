import React, { Component } from 'react';
import styled from 'styled-components';

export default class Navbar extends Component {
    render() {
        return (
            <NavWrapper className="navbar navbar-expand-sm navbar-dark px-sm">
                {/* 
                https://www.iconfinder.com/icons/1243689/call_phone_icon
                Creative Commons (Attribution 3.0 Unported);
                https://www.iconfinder.com/Makoto_msk 
                */}
                <ul className="navbar-nav align-items-center">
                    <li className="nav-items ml-5">
                        
                    </li>
                </ul>
                <ButtonContainer>
                    <i className="fa fa-cart-plus">  BlockCart</i>
                </ButtonContainer>
            </NavWrapper>
        )
    }
}

const ButtonContainer = styled.button`
    text-transform : capitalize;
    font-size : 1.4rem;
    background : transparent;
    border : 0.05rem solid var(--mainYellow);
    color : var(--mainYellow);
    border-radius : 0.5rem;
    padding : 0.2rem 0.5rem;
    cursor : pointer;
    margin : 0.2rem 0.5rem 0.2rem 0;
    transition : all 0.5s ease-in-and-out;
    &:hover {
        background : var(--mainYellow);
        color : var(--mainWhite);
    }
`

const NavWrapper = styled.nav`
    background : var(--mainBlue);
    .nav-link {
        color : var(--mainWhite) !important;
        font-size : 1.3rem;
        text-transform : capitalize;
    }
`