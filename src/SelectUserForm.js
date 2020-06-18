import React,{Component} from 'react';

class SelectUserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 'Buyer'};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.selectUser(this.state.value)
  }
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Select User:
            <select value={this.state.value} onChange={this.handleChange}>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Transporter">Transporter</option>
            </select>
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default SelectUserForm;
