import React,{Component} from 'react';
import web3 from './web3.js';
import POD from './POD';

import { ButtonContainer } from "./components/Button";

var keyT=null;

class Seller extends Component{
  constructor(props){
    super(props)
    this.state = {
      signed:false,
      Key:'0',
      cancellable: false,
      reason: 'r'
    }
    this.sign = this.sign.bind(this)
    this.update = this.update.bind(this)
    this.tick= this.tick.bind(this)
    this.createPackageAndKey=this.createPackageAndKey.bind(this)
    this.cancelTransaction= this.cancelTransaction.bind(this)

  }
  sign = (event) => {
    this.setState({
      signed:true
    })

    this.props.SignTermsAndConditions(this.props.address)
  }

  async createPackageAndKey(){
    await POD.methods.createPackageAndKey().send({
      from: this.props.address
    })
  }

  async cancelTransaction(){
    await POD.methods.cancelTransaction(this.state.reason).send({
      from: this.props.address
    })
  }


  async tick() {
    console.log("tick",this.props.index)
    if(this.props.index !== await POD.methods.state().call() ){
      this.props.reRender();
    }

    let keyt = await POD.methods.returnKey().call({
      from: this.props.address
    })
    console.log(keyt);
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
          <img className="img-rounded" src="art_seller.png" />
        </div>
        <div className="d-flex justify-content-center">
          <h1 className="text-uppercase text-title">seller</h1>
       </div>
       <div className="d-flex justify-content-center">
    <p>Adderss: {this.props.address.slice(0, 4)}...{this.props.address.slice(25, 29)}</p>
       </div>
       <div className="d-flex justify-content-center">
      <h3 className="text-muted">
         {this.props.state==="waitingForVerificationbyBuyer"?"Waiting for Buyer to confirm":null}
         {this.props.state==="waitingForVerificationbyTransporter"?"Waiting for transporter to confirm":null}
         {this.props.state==="waitingForVerificationbySeller"?"Please agree the Terms and Conditions":null}
         {this.props.state==="MoneyWithdrawn"?"Collateral deposited!":null}
         {this.props.state==="PackageAndTransporterKeyCreated"?"Package is ready to be delivered!":null}
         {this.props.state==="ItemOnTheWay"?"Package is on the way":null}
         {this.props.state==="PaymentSettledSuccess"?"Package Delivered":null}
         {this.props.state === "ArrivedToDestination"?"Package reached the destination":null}
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

       {this.props.state!=='Aborted' && this.props.state!=='PaymentSettledSuccess' ?   
          <div className="d-flex justify-content-center">
            {this.props.state==='waitingForVerificationbySeller' ?  <ButtonContainer onClick={this.sign}>Agree terms and conditions</ButtonContainer>:null}
            {this.props.state==='MoneyWithdrawn'? <ButtonContainer cart="true" onClick={this.createPackageAndKey}>Create Package And Key</ButtonContainer>:null}
            {this.props.state==='PackageAndTransporterKeyCreated'?
              <h3>Transporter Key: {this.state.key}</h3>
            :null}
          </div>
        :null}

        {this.state.cancellable ?
          <div className="d-flex justify-content-center py-4">
            <ButtonContainer cart="true" onClick={this.cancelTransaction}>Cancel Sale</ButtonContainer>
          </div>
        :null}
      </div>

    )
  }
}

export default Seller;
