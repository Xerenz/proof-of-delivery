import React,{Component} from 'react';
import web3 from './web3.js';
import POD from './POD';

import { ButtonContainer } from './components/Button';


class Buyer extends Component {
  constructor(props){
    super(props)
    this.state = {
      signed:false,
      key:'0',
      showKey:false,
      transporterKey:'0',
      cancellable: false,
      reason:'r',
      isRefundable:false
    }
    this.sign = this.sign.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.update = this.update.bind(this)
    this.tick= this.tick.bind(this)
    this.requestPackageKey= this.requestPackageKey.bind(this)
    this.verifyKeyBuyer= this.verifyKeyBuyer.bind(this)
    this.cancelTransaction= this.cancelTransaction.bind(this)
    this.refund= this.refund.bind(this)
  }

  handleChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }
  sign = (event) => {
    this.setState({
      signed:true
    })
    this.props.SignTermsAndConditions(this.props.address)
  }

  async requestPackageKey(){
    await POD.methods.requestPackageKey().send({
      from: this.props.address
    })
  }

  async verifyKeyBuyer(evt){
    evt.preventDefault()
    console.log("verify");
    await POD.methods.verifyKeyBuyer(this.state.transporterKey,this.state.key).send({
      from: this.props.address
    })
  }

  async cancelTransaction(){
    await POD.methods.cancelTransaction(this.state.reason).send({
      from: this.props.address
    })
  }

  async refund(){
    await POD.methods.refund().send({
      from: this.props.address
    })
  }

  async tick() {
    console.log("tick",this.props.index)
    if(this.props.index !== await POD.methods.state().call()){
      this.props.reRender();
    }
    let keyb = await POD.methods.returnKey().call({
      from: this.props.address
    })
    if(this.state.key !== keyb){
      this.setState({
        key: keyb
      })
    }
    let cancellable = await POD.methods.cancellable(this.props.address).call()
    if(this.state.cancellable != cancellable){
      this.setState({
        cancellable: cancellable
      })
    }
    let isRefundable = await POD.methods.isRefundable().call({
      from: this.props.address
    })
    console.log(isRefundable)
    if(this.state.isRefundable != isRefundable){
      this.setState({
        isRefundable: isRefundable
      })
    }
  }
  async update(){
    console.log("update",this.props.index)
    const interval = setInterval( () => {
      this.tick()
    }, 3000);
  }
  componentDidUpdate(prevProps, prevState) {
    this.update()
  }
  componentDidMount(prevProps, prevState) {
    this.update()
  }
  render(){

    return(


      <div className="container">
        <div className="d-flex justify-content-center py-5">
          <img className="img-rounded" src="buyer.jpg" />
        </div>
        <div className="d-flex justify-content-center">
          <h1 className="text-uppercase text-title">buyer</h1>
       </div>
       <div className="d-flex justify-content-center">
    <p>Adderss: {this.props.address.slice(0, 4)}...{this.props.address.slice(25, 29)}</p>
       </div>
       <div className="d-flex justify-content-center">
       <h3 className="text-muted">
         {this.props.state==="waitingForVerificationbyBuyer"?"Please sign the Terms and Conditions":null}
         {this.props.state==="waitingForVerificationbyTransporter"?"Waiting for Transporter":null}
         {this.props.state==="waitingForVerificationbySeller"?"Waiting for Seller to confirm":null}
         {this.props.state==="PackageAndTransporterKeyCreated"?"Your package has been shiped!":null}
         {this.props.state==="ItemOnTheWay"?"Your package is on the way!":null}
         {this.props.state==="PaymentSettledSuccess"?"Your packaged is delivered!!":null}
         {this.props.state === "ArrivedToDestination"?"Your package has arrived!":null}
      </h3> 
      <h3 className="text-danger">
        {this.props.state === "DisputeVerificationFailure"?"Issue in verification":null}
        {this.props.state === "CancellationRefund"?"Cancelled transaction, initiating refund":null}
        {this.props.state === "Aborted"?"Transaction Aborted":null}
      </h3>
       </div>
       <div className="d-flex justify-content-center py-5">
          <h3>Price: {this.props.price}</h3>
       </div>  
        
       {this.props.state!=='Aborted' && this.props.state !=='PaymentSettledSuccess' ?
        <div>
          <div className="d-flex justify-content-center">
            {this.props.state==='waitingForVerificationbyBuyer' ?  <ButtonContainer onClick={this.sign}>Agree terms and conditions</ButtonContainer>:null}
            {this.props.state==='ItemOnTheWay'? <ButtonContainer cart="true" onClick={this.requestPackageKey}>Get Verification Key</ButtonContainer>:null}
          </div>
          <div className="d-flex justify-content-center py-5">
            {this.state.key !== '0' ?
              (
                this.state.showKey ?
                <div>
                  <h4>Your Key: 
                    {this.state.key}
                  </h4>
                  <button className="btn btn-warning" onClick={() => {this.setState({showKey: !this.state.showKey})}}>Hide Key</button>
                </div>
                :<button className="btn btn-primary" onClick={() => {this.setState({showKey: !this.state.showKey})}}>Show Key</button>
              )
              :null}
          </div>

          {this.props.state === "ArrivedToDestination"  ?
          <div className="d-flex justify-content-center py-5">
            <form onSubmit={this.verifyKeyBuyer}>
              <div className="form-group">
              <label htmlFor='key'>Enter Transporter key: </label>
              <input
                className="form-control"
                type='text'
                name='transporterKey'
                value={this.state.transporterKey}
                onChange={this.handleChange}
                id='transporterKey'
              />
              </div>
              {this.state.transporterKey !== '0' && this.state.transporterKey !== '' ? <button className="btn">Verify</button> : null}
            </form>
          </div>
          : null}

          {(this.props.state==='ItemOnTheWay' || this.props.state==='PackageKeyGivenToBuyer') && this.state.isRefundable ?
            <div className="d-flex justify-content-center py-3">
              <label htmlFor='refund'>Transporter exceeded time: </label>
                <ButtonContainer
                  className="ml-3"
                  name='refund'
                  onClick={this.refund}
                  id='refund'
                >Refund</ButtonContainer>
            </div>
          :null}

          {this.state.cancellable ?
            <div className="d-flex justify-content-center py-5">
              <button className="btn btn-danger btn-lg" onClick={this.cancelTransaction}>Cancel Order</button>
            </div>
          :null}

        </div>
        :null}
      </div>

    )
  }
}


export default Buyer;
