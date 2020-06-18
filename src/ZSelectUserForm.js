import React,{Component} from 'react';


class SelectUserForm extends Component{
  constructor(props) {
    super(props);
    this.state = { user: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }
  handleSubmit(evt) {
    evt.preventDefault();
    this.props.selectUser(this.state.user)
  }
  render(){
    return(
      <div>
        <form onSubmit={this.handleSubmit}>

            <label>Select User:
              <select value={this.state.user} onchange={this.handleChange}  name="user">
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
                <option value="Transporter">Transporter</option>
              </select>
            </label>

          <button>Select User</button>
        </form>
        <h1>{this.state.user}</h1>
      </div>
    )
  }
}

export default SelectUserForm;
