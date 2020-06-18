import React,{Component} from 'react';
import { Route, Switch, NavLink } from "react-router-dom";



class Select extends Component{
  render(){
    return(
      <div className='App'>
        <nav className='App-nav'>

          <NavLink activeClassName='active-link' to='/buyer'>
            Buyer
          </NavLink>
          <NavLink activeClassName='active-link' to='/seller'>
            Seller
          </NavLink>

          <NavLink activeClassName='active-link' to='/transporter'>
            Transporter
          </NavLink>

        </nav>
      </div>

    )
  }
}


export default Select;
