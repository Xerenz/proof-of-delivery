pragma solidity ^0.4.0;

contract POD {

    address public seller;
    address public buyer;
    address public transporter;
    address public arbitrator; // Trusted incase of dispute
    address public attestaionAuthority; // Party that attested the smart contract

    uint private keyTr;
    uint private keyBr;

    uint public itemPrice;
    string itemID;

    string public TermsIPFS_Hash; // Terms and conditions agreement IPFS Hash

    // Enum wont allow the contract to be in any other state
    enum contractState { waitingForVerificationbySeller, waitingForVerificationbyTransporter,
                        waitingForVerificationbyBuyer, MoneyWithdrawn, PackageAndTransporterKeyCreated,
                        ItemOnTheWay,PackageKeyGivenToBuyer, ArrivedToDestination, buyerKeysEntered,
                        PaymentSettledSuccess, DisputeVerificationFailure, EtherWithArbitrator,
                        CancellationRefund, Refund, Aborted }

    contractState public state;

    mapping(address => bytes32) public verificationHash;
    mapping(address => bool) public cancellable;

    uint deliveryDuration;
    uint startEntryTransporterKeysBlocktime;
    uint buyerVerificationTimeWindow;
    uint startdeliveryBlocktime;

    constructor(address _seller,
    address _buyer,
    address _transporter,
    address _arbitrator,
    address _attestationAuthority,
    string _itemID) public payable {
        seller = _seller;
        buyer = _buyer;
        transporter = _transporter;
        arbitrator = _arbitrator;
        attestaionAuthority = _attestationAuthority;

        itemPrice = 0.001 ether;
        itemID = _itemID;
        deliveryDuration = 2 hours; // 2 hours
        buyerVerificationTimeWindow = 2 minutes; // Time for the buyer to verify keys after transporter entered the keys
        TermsIPFS_Hash = "QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2td";

        state = contractState.waitingForVerificationbySeller;
    }

    modifier costs() {
       require(msg.value == 2*itemPrice);
       _;
    }

    modifier OnlySeller() {
        require(msg.sender == seller);
        _;
    }

    modifier OnlyBuyer() {
        require(msg.sender == buyer);
        _;
    }

    modifier OnlyTransporter() {
        require(msg.sender == transporter);
        _;
    }

    modifier OnlySeller_Buyer_Transporter() {
        require(msg.sender == seller || msg.sender == buyer || msg.sender == transporter);
        _;
    }

    event TermsAndConditionsSignedBy(string info, address entityAddress);
    event collateralWithdrawnSuccessfully(string info, address entityAddress);
    event PackageCreatedBySeller(string info, address entityAddress);
    event PackageIsOnTheWay(string info, address entityAddress);
    event PackageKeyGivenToBuyer(string info, address entityAddress);
    event ArrivedToDestination(string info, address entityAddress);
    event BuyerEnteredVerificationKeys(string info, address entityAddress);
    event SuccessfulVerification(string info);
    event VerificationFailure(string info);
    event CancellationRequest(address entityAddress, string info, string reason);
    event RefundDueToCancellation(string info);
    event DeliveryTimeExceeded(string info);
    event EtherTransferredToArbitrator(string info, address entityAddress);
    event BuyerExceededVerificationTime(string info, address entityAddress);

    function SignTermsAndConditions() public payable costs OnlySeller_Buyer_Transporter {
        if(msg.sender == seller) {
            require(state == contractState.waitingForVerificationbySeller);
            emit TermsAndConditionsSignedBy("Terms and Conditiond verified : ", msg.sender);
            emit collateralWithdrawnSuccessfully("Double deposit is withdrawn successfully from: ", msg.sender);
            state = contractState.waitingForVerificationbyTransporter;
        }
        else if(msg.sender == transporter) {
            require(state == contractState.waitingForVerificationbyTransporter);
            emit TermsAndConditionsSignedBy("Terms and Conditiond verified : ", msg.sender);
            emit collateralWithdrawnSuccessfully("Double deposit is withdrawn successfully from: ", msg.sender);
            state = contractState.waitingForVerificationbyBuyer;
        }
        else if(msg.sender == buyer) {
            require(state == contractState.waitingForVerificationbyBuyer);
            emit TermsAndConditionsSignedBy("Terms and Conditiond verified : ", msg.sender);
            emit collateralWithdrawnSuccessfully("Double deposit is withdrawn successfully from: ", msg.sender);
            state = contractState.MoneyWithdrawn;
            cancellable[seller] = true;
            cancellable[buyer] = true;
            cancellable[transporter] = true;
        }
    }

    function createPackageAndKey() public payable OnlySeller {
        require(state == contractState.MoneyWithdrawn);

        cancellable[msg.sender] = false;
        cancellable[transporter]=false;
        keyTr = uint(keccak256(
            abi.encodePacked(itemID, transporter, block.timestamp)
        ))/100000000000000000000000000000000000000000000000000000000000000000000000;
        state = contractState.PackageAndTransporterKeyCreated;
        emit PackageCreatedBySeller("Package created and Key given to transporter by the sender ", msg.sender);
    }

    function deliverPackage() public OnlyTransporter {
        require(state == contractState.PackageAndTransporterKeyCreated);
        startdeliveryBlocktime = block.timestamp;//save the delivery time
        cancellable[buyer] = false;
        emit PackageIsOnTheWay("The package is being delivered and the key is received by the ", msg.sender);
        state = contractState.ItemOnTheWay;
    }

    function requestPackageKey() public OnlyBuyer {
        require(state == contractState.ItemOnTheWay);
        keyBr = uint(keccak256(
            abi.encodePacked(itemID, buyer, block.timestamp)
        ))/100000000000000000000000000000000000000000000000000000000000000000000000;
        state = contractState.PackageKeyGivenToBuyer;
        emit PackageKeyGivenToBuyer("The package Key is given to the ", msg.sender);
    }

    function verifyTransporter(string memory keyT, string memory keyR) public OnlyTransporter {
        require(state == contractState.PackageKeyGivenToBuyer);
        emit ArrivedToDestination("Transporter Arrived To Destination and entered keys " , msg.sender);
        verificationHash[transporter] = keccak256(
                abi.encodePacked(keyT, keyR)
            );
        state = contractState.ArrivedToDestination;
        startEntryTransporterKeysBlocktime = block.timestamp;
    }

    function verifyKeyBuyer(string memory keyT, string memory keyR) public OnlyBuyer {
        require(state == contractState.ArrivedToDestination);
        emit BuyerEnteredVerificationKeys("Reciever entered keys, waiting for payment settlement", msg.sender);
        verificationHash[buyer] = keccak256(
                abi.encodePacked(keyT, keyR)
            );
        state = contractState.buyerKeysEntered;
        verification();
    }

    function BuyerExceededTime() public OnlyTransporter {
        require(block.timestamp > startEntryTransporterKeysBlocktime + buyerVerificationTimeWindow &&
        state == contractState.ArrivedToDestination);
        emit BuyerExceededVerificationTime("Dispute: Buyer Exceeded Verification Time", msg.sender);
        state = contractState.buyerKeysEntered;
        verification();
    }

    function refund() public OnlyBuyer {
        //refund incase delivery took more than deadline
        require(block.timestamp > startdeliveryBlocktime+deliveryDuration &&
        (state == contractState.ItemOnTheWay || state == contractState.PackageKeyGivenToBuyer));
        emit DeliveryTimeExceeded("Item not delivered on time, Refund Request");
        state = contractState.Refund;
        buyer.transfer(2*itemPrice);
        seller.transfer(2*itemPrice);
        arbitrator.transfer(address(this).balance); //rest of ether with the arbitrator
        state = contractState.EtherWithArbitrator;
        emit EtherTransferredToArbitrator("Due to exceeding delivery time and refund request by receiver , all Ether deposits have been transferred to arbitrator ", arbitrator);
        state = contractState.Aborted;
    }

    function verification() internal {
        require(state == contractState.buyerKeysEntered);
        if(verificationHash[transporter] == verificationHash[buyer]){
            emit SuccessfulVerification("Payment will shortly be settled , successful verification!");
            buyer.transfer(itemPrice);
            transporter.transfer((2*itemPrice) + ((10*itemPrice)/100));//receiver gets 10% of item price delivered
            seller.transfer((2*itemPrice)+((90*itemPrice)/100));
            state = contractState.PaymentSettledSuccess;
        }
        else {
            //trusted entity the Arbitrator resolves the issue
            emit VerificationFailure("Verification failed , keys do not match. Please solve the dispute off chain. No refunds.");
            state = contractState.DisputeVerificationFailure;
            arbitrator.transfer(address(this).balance);//all ether with the contract
            state = contractState.EtherWithArbitrator;
            emit EtherTransferredToArbitrator("Due to dispute all Ether deposits have been transferred to arbitrator ", arbitrator);
            state = contractState.Aborted;
        }
    }

    function cancelTransaction(string reason)public OnlySeller_Buyer_Transporter{
     require(cancellable[msg.sender] == true);
     state = contractState.CancellationRefund;
     //everyone gets a refund
     seller.transfer(2*itemPrice);
     buyer.transfer(2*itemPrice);
     transporter.transfer(2*itemPrice);
     emit CancellationRequest(msg.sender, " has requested a cancellation due to: ", reason );
     state = contractState.Aborted;
 }

    function returnKey() public view returns(uint){
        if(msg.sender == transporter || msg.sender == seller){
            return keyTr;
        }
        else if(msg.sender == buyer){
            return keyBr;
        }
    }
    function isRefundable() public view OnlyBuyer returns(bool){
      return (block.timestamp > startdeliveryBlocktime+deliveryDuration &&
      (state == contractState.ItemOnTheWay || state == contractState.PackageKeyGivenToBuyer));
    }
    function isBuyerExceededTime() public view OnlyTransporter returns(bool){
      return (block.timestamp > startEntryTransporterKeysBlocktime + buyerVerificationTimeWindow &&
      state == contractState.ArrivedToDestination);
    }

}
