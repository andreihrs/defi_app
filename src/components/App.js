import React, { Component } from "react";
import { Tabs, Tab } from "react-bootstrap";
import Web3 from "web3";
import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";
import dBank from "../abis/dBank.json";
import Token from "../abis/Token.json";
import Navbar from "./Navbar";
import Main from "./Main";
import "./App.css";
import dbank from "../dbank.png";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();

    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      this.setState({ daiToken });
      let daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ daiTokenBalance: daiTokenBalance.toString() });
    } else {
      window.alert("DaiToken contract not deployed to detected network.");
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      this.setState({ dappToken });
      let dappTokenBalance = await dappToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ dappTokenBalance: dappTokenBalance.toString() });
    } else {
      window.alert("DappToken contract not deployed to detected network.");
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      this.setState({ tokenFarm });
      let stakingBalance = await tokenFarm.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({ stakingBalance: stakingBalance.toString() });
    } else {
      window.alert("TokenFarm contract not deployed to detected network.");
    }

    try {
      const token = new web3.eth.Contract(
        Token.abi,
        Token.networks[networkId].address
      );
      const dbank = new web3.eth.Contract(
        dBank.abi,
        dBank.networks[networkId].address
      );
      const dBankAddress = dBank.networks[networkId].address;
      this.setState({ token: token, dbank: dbank, dBankAddress: dBankAddress });
    } catch (e) {
      console.log("Error", e);
      window.alert("Contracts not deployed to the current network");
    }

    this.setState({ loading: false });
  }

  async deposit(amount) {
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods
          .deposit()
          .send({ value: amount.toString(), from: this.state.account });
      } catch (e) {
        console.log("Error, deposit: ", e);
      }
    }
  }

  async withdraw(e) {
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods
          .withdraw()
          .send({ from: this.state.account });
      } catch (e) {
        console.log("Error, withdraw: ", e);
      }
    }
  }

  async borrow(amount) {
    if (this.state.dbank !== "undefined") {
      try {
        await this.state.dbank.methods
          .borrow()
          .send({ value: amount.toString(), from: this.state.account });
      } catch (e) {
        console.log("Error, borrow: ", e);
      }
    }
  }

  async payOff(e) {
    e.preventDefault();
    if (this.state.dbank !== "undefined") {
      try {
        const collateralEther = await this.state.dbank.methods
          .collateralEther(this.state.account)
          .call({ from: this.state.account });
        const tokenBorrowed = collateralEther / 2;
        await this.state.token.methods
          .approve(this.state.dBankAddress, tokenBorrowed.toString())
          .send({ from: this.state.account });
        await this.state.dbank.methods
          .payOff()
          .send({ from: this.state.account });
      } catch (e) {
        console.log("Error, pay off: ", e);
      }
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.daiToken.methods
      .approve(this.state.tokenFarm._address, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.tokenFarm.methods
      .unstakeTokens()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      dappTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance}
          dappTokenBalance={this.state.dappTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        />
      );
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a target="_blank" rel="noopener noreferrer"></a>

                {content}
              </div>
            </main>
          </div>
          <div className="text-monospace">
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={dbank} className="App-logo" alt="logo" height="32" />
                <b>d₿ank</b>
              </a>
            </nav>
            <div className="container-fluid mt-5 text-center">
              <br></br>
              <h1>Welcome to d₿ank</h1>
              <h2>{this.state.account}</h2>
              <br></br>
              <div className="row">
                <main role="main" className="col-lg-12 d-flex text-center">
                  <div className="content mr-auto ml-auto">
                    <Tabs
                      defaultActiveKey="profile"
                      id="uncontrolled-tab-example"
                    >
                      <Tab eventKey="deposit" title="Deposit">
                        <div>
                          <br></br>
                          How much do you want to deposit?
                          <br></br>
                          (min. amount is 0.01 ETH)
                          <br></br>
                          (1 deposit is possible at the time)
                          <br></br>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              let amount = this.depositAmount.value;
                              amount = amount * 10 ** 18; //convert to wei
                              this.deposit(amount);
                            }}
                          >
                            <div className="form-group mr-sm-2">
                              <br></br>
                              <input
                                id="depositAmount"
                                step="0.01"
                                type="number"
                                ref={(input) => {
                                  this.depositAmount = input;
                                }}
                                className="form-control form-control-md"
                                placeholder="amount..."
                                required
                              />
                            </div>
                            <button type="submit" className="btn btn-primary">
                              DEPOSIT
                            </button>
                          </form>
                        </div>
                      </Tab>
                      <Tab eventKey="withdraw" title="Withdraw">
                        <br></br>
                        Do you want to withdraw + take interest?
                        <br></br>
                        <br></br>
                        <div>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={(e) => this.withdraw(e)}
                          >
                            WITHDRAW
                          </button>
                        </div>
                      </Tab>
                      <Tab eventKey="borrow" title="Borrow">
                        <div>
                          <br></br>
                          Do you want to borrow tokens?
                          <br></br>
                          (You'll get 50% of collateral, in Tokens)
                          <br></br>
                          Type collateral amount (in ETH)
                          <br></br>
                          <br></br>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              let amount = this.borrowAmount.value;
                              amount = amount * 10 ** 18; //convert to wei
                              this.borrow(amount);
                            }}
                          >
                            <div className="form-group mr-sm-2">
                              <input
                                id="borrowAmount"
                                step="0.01"
                                type="number"
                                ref={(input) => {
                                  this.borrowAmount = input;
                                }}
                                className="form-control form-control-md"
                                placeholder="amount..."
                                required
                              />
                            </div>
                            <button type="submit" className="btn btn-primary">
                              BORROW
                            </button>
                          </form>
                        </div>
                      </Tab>
                      <Tab eventKey="payOff" title="Payoff">
                        <div>
                          <br></br>
                          Do you want to payoff the loan?
                          <br></br>
                          (You'll receive your collateral - fee)
                          <br></br>
                          <br></br>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={(e) => this.payOff(e)}
                          >
                            PAYOFF
                          </button>
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
