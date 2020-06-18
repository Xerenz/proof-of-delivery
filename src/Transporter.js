import React,{Component} from 'react';
import web3 from './web3.js';
import POD from './POD';

import { ButtonContainer } from './components/Button';


class Transporter extends Component{
  constructor(props){
    super(props)
    this.state = {
      signed:false,
      key:'0',
      keySubmitted:false,
      keyGenerated:false,
      showKey: false,
      buyerKey: '0',
      cancellable: false,
      reason:'r',
      isBuyerExceededTime:false
    }
    this.sign = this.sign.bind(this)
    this.update = this.update.bind(this)
    this.tick= this.tick.bind(this)
    this.setKey = this.setKey.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.deliverPackage = this.deliverPackage.bind(this)
    this.verifyTransporter = this.verifyTransporter.bind(this)
    this.cancelTransaction= this.cancelTransaction.bind(this)
    this.BuyerExceededTime= this.BuyerExceededTime.bind(this)
  }
  sign = (event) => {
    this.setState({
      signed:true
    })

    this.props.SignTermsAndConditions(this.props.address)
  }
  handleChange(evt) {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }
  setKey(evt){
    evt.preventDefault();
    this.setState({
      keySubmitted: !this.state.keySubmitted
    })
  }

  async deliverPackage(){
    await POD.methods.deliverPackage().send({
      from: this.props.address
    })
  }

  async verifyTransporter(evt){
    evt.preventDefault()
    await POD.methods.verifyTransporter(this.state.key,this.state.buyerKey).send({
      from: this.props.address
    })
  }

  async cancelTransaction(){
    await POD.methods.cancelTransaction(this.state.reason).send({
      from: this.props.address
    })
  }

  async BuyerExceededTime(){
    await POD.methods.BuyerExceededTime().send({
      from: this.props.address
    })
  }

  async tick() {
    console.log("tick",this.props.index)
    if(this.props.index !== await POD.methods.state().call()){
      this.props.reRender();
    }
    let keyt = await POD.methods.returnKey().call({
      from: this.props.address
    })
    if(this.state.key !== keyt){
      this.setState({
        key: keyt
      })
    }
    let cancellable = await POD.methods.cancellable(this.props.address).call()
    if(this.state.cancellable != cancellable){
      this.setState({
        cancellable: cancellable
      })
    }
    let isBuyerExceededTime = await POD.methods.isBuyerExceededTime().call({
      from: this.props.address
    })
    if(this.state.isBuyerExceededTime != isBuyerExceededTime){
      this.setState({
        isBuyerExceededTime: isBuyerExceededTime
      })
    }
  }
  async update(){
    console.log("update",this.props.index)
    const interval = setInterval( () => {
      this.tick()
    }, 3500);
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
          <img className="img-rounded" src="owl.jpg" />
        </div>
        <div className="d-flex justify-content-center">
          <h1 className="text-uppercase text-title">transporter</h1>
       </div>
       <div className="d-flex justify-content-center">
    <p>Adderss: {this.props.address.slice(0, 4)}...{this.props.address.slice(25, 29)}</p>
       </div>
       <div className="d-flex justify-content-center">
       
      <h3 className="text-muted">
         {this.props.state==="waitingForVerificationbyBuyer"?"Waiting for Buyer to confirm":null}
         {this.props.state==="waitingForVerificationbyTransporter"?"Please agree the Terms and Conditions":null}
         {this.props.state==="waitingForVerificationbySeller"?"Waiting for Seller to confirm":null}
         {this.props.state==="PackageAndTransporterKeyCreated"?"Shipping package":null}
         {this.props.state==="ItemOnTheWay"?"Package is on the way":null}
         {this.props.state==="PaymentSettledSuccess"?"Package Delivered":null}
         {this.props.state === "ArrivedToDestination"?"You have reached the destination":null}
      </h3> 
      <h3 className="text-danger">
        {this.props.state === "DisputeVerificationFailure"?"Issue in verification":null}
        {this.props.state === "CancellationRefund"?"Cancelled transaction, initiating refund":null}
        {this.props.state === "Aborted"?"Transaction Aborted":null}
      </h3>
       </div>

        {this.props.state!=='Aborted' && this.props.state!=='PaymentSettledSuccess' ?
        <div>

          {this.props.state==='waitingForVerificationbyTransporter' ?  (
          <div className="d-flex justify-content-center">
            <ButtonContainer onClick={this.sign}>Agree terms and conditions</ButtonContainer>
          </div>
          ):null}

          {this.state.key !== '0' ?
            (
              <div className="d-flex justify-content-center py-5">
                {this.state.showKey ?
                <div>
                  <h3>key: {this.state.key}</h3>
                  <button className="btn btn-warning" onClick={() => {this.setState({showKey: !this.state.showKey})}}>Hide Key</button>
                </div>
                :<button className="btn btn-primary" onClick={() => {this.setState({showKey: !this.state.showKey})}}>Show Key</button>
                }
              </div>
            )
          :null}

          {this.props.state === "PackageAndTransporterKeyCreated" ?
          <div className="d-flex justify-content-center">     
            <ButtonContainer onClick={this.deliverPackage}>Start Package Delivery</ButtonContainer>
          </div>
          : null}

          {this.props.state === "PackageKeyGivenToBuyer"  ?
            <div className="d-flex justify-content-center py-3">
              <form onSubmit={this.verifyTransporter}>
                <div className="form-group">
                <label htmlFor='key'>Enter Buyer key: </label>
                <input
                  className="form-control"
                  type='text'
                  name='buyerKey'
                  value={this.state.buyerKey}
                  onChange={this.handleChange}
                  id='buyerKey'
                />
                </div>
                {this.state.buyerKey !== '0' && this.state.buyerKey !== '' ? <button className="btn">Submit</button> : null}
              </form>
            </div>
          : null}

          {(this.props.state==='ArrivedToDestination') && this.state.isBuyerExceededTime ?
            <div className="d-flex justify-content-center py-3">
              <label htmlFor='BuyerExceededTime'>Buyer exceeded time: </label>
                <ButtonContainer cart="true"
                  name='BuyerExceededTime'
                  onClick={this.BuyerExceededTime}
                  id='BuyerExceededTime'
                >Cancel</ButtonContainer>
            </div>
            :null}

          {this.state.cancellable ?
          <div className="d-flex justify-content-center py-3">
            <button className="btn btn-danger" onClick={this.cancelTransaction}>Cancel</button>
          </div>
          :null}


        </div>
        :null}

    </div>
      

    )
  }
}

export default Transporter;
