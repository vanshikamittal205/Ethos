import React, { useState, Fragment, useEffect } from "react";
import { GoldRushClient } from '@covalenthq/client-sdk';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Use Routes instead of Switch
import Graph from './Graph'; // Import the Graph component

function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("eth-mainnet");
  const [tokenData, setTokenData] = useState(null);
  const [nftData, setNftData] = useState(null);
  const [nativeCurrencyData, setNativeCurrencyData] = useState(null);
  const [loading, setLoading] = useState(false);

  const client = new GoldRushClient(process.env.REACT_APP_API_KEY);

  const getWalletTokenBalance = async () => {
    try {
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(network, address);
      setTokenData(resp.data);
    } catch (error) {
      console.error(error);
    }
  }

  const getWalletNfts = async () => {
    try {
      const resp = await client.NftService.getNftsForAddress(network, address);
      setNftData(resp.data);
    } catch (error) {
      console.error(error);
    }
  }

  const getNativeTokenBalance = async () => {
    try {
      const resp = await client.BalanceService.getNativeTokenBalance(network, address);
      setNativeCurrencyData(resp.data);
    } catch (error) {
      console.error(error);
    }
  }

  const addressChangeHandler = (e) => {
    e.preventDefault();
    setAddress(e.target.value);
  }

  const networkChangeHandler = (e) => {
    e.preventDefault();
    setNetwork(e.target.value);
  }

  const fetchWalletTokens = async (e) => {
    e.preventDefault();

    if (address === "" || network === "") {
      alert("Input an address and select a blockchain network");
    } else {
      setLoading(true);
      await getNativeTokenBalance();
      await getWalletTokenBalance();
      await getWalletNfts();
      setLoading(false);
    }
  }

  return (
    <Router>
      <div className="App">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light bg-primary mb-1">
            <a className="navbar-brand text-light font-weight-bold" href="!#">Portfolio Tracker</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarText">
              <ul className="navbar-nav mr-auto"></ul>
              <span className="navbar-text text-light">
                Track your crypto assets across different blockchains
              </span>
            </div>
          </nav>

          <div className="row">
            <div className="col-md-12">
              <form>
                <div className="input-group mb-3 input-group-lg">
                  <input type="text" className="form-control" placeholder="Wallet Address" onChange={addressChangeHandler} />
                  <select className="form-control" value={network} onChange={networkChangeHandler}>
                    <option value="eth-mainnet">Ethereum</option>
                    <option value="bsc-mainnet">Binance</option>
                    <option value="matic-mainnet">Polygon</option>
                    <option value="fantom-mainnet">Fantom</option>
                  </select>
                  <div className="input-group-append">
                    <button className="btn btn-primary" onClick={fetchWalletTokens}>Explore</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Add a button that links to the Graph page */}
          <div className="row">
            <div className="col-md-12 mb-3">
              
              <Link to="/graph" className="btn btn-secondary">Go to Graph</Link>
            
            </div>
          </div>

          {/* Switch between routes */}
          <Routes>
            <Route path="/graph" element={<Graph />} />
            <Route path="/" element={
              <Fragment>
                <div className="row mt-4">
                  <div className="col-md-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <span>
                          Currency: {nativeCurrencyData !== null && nativeCurrencyData.items.length > 0 && ethers.utils.formatUnits(nativeCurrencyData.items[0].balance, nativeCurrencyData.items[0].contract_decimals)}
                          <strong>{nativeCurrencyData !== null && nativeCurrencyData.items.length > 0 && nativeCurrencyData.items[0].contract_ticker_symbol}</strong>
                        </span>
                        <h3>{nativeCurrencyData !== null && nativeCurrencyData.items.length > 0 && nativeCurrencyData.items[0].pretty_quote}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <span>Tokens</span>
                        <h3>{tokenData !== null && tokenData.items.length}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <span>NFTs:</span>
                        <h3>{nftData !== null && nftData.items.length}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-5">
                  <div className="col-md-12">
                    <ul className="nav nav-tabs nav-justified">
                      <li className="nav-item">
                        <a className="nav-link active" data-toggle="tab" href="#tokens">Tokens</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" data-toggle="tab" href="#nfts">NFTs</a>
                      </li>
                    </ul>

                    <div className="tab-content">
                      <div className="tab-pane container active" id="tokens">
                        <div className="table-responsive my-4">
                          <table className="table table-striped table-light">
                            <thead>
                              <tr>
                                <th scope="col">SN</th>
                                <th scope="col">Token</th>
                                <th scope="col">Symbol</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Value</th>
                              </tr>
                            </thead>

                            <tbody>
                              {tokenData !== null && tokenData.items.length > 0 && 
                                tokenData.items.map((item, index) => (
                                  <tr key={item.contract_address}>
                                    <th scope="row">{index + 1}</th>
                                    <td><img style={{ width: "30px" }} src={`${item.logo_url}`} alt="" /> {item.contract_name}</td>
                                    <td>{item.contract_ticker_symbol}</td>
                                    <td>{ethers.utils.formatUnits(item.balance_24h, item.contract_decimal)}</td>
                                    <td>{item.pretty_quote_24h === null ? "$0.00" : item.pretty_quote_24h}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="tab-pane container fade" id="nfts">
                        <div className="table-responsive my-4">
                          <table className="table table-striped table-light">
                            <thead>
                              <tr>
                                <th scope="col">SN</th>
                                <th scope="col">NFT</th>
                                <th scope="col">Symbol</th>
                                <th scope="col">Contract Address</th>
                                <th scope="col">Floor Price</th>
                              </tr>
                            </thead>

                            <tbody>
                              {nftData !== null && nftData.items.length > 0 && 
                                nftData.items.map((item, index) => (
                                  <tr key={item.contract_address}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{item.contract_name}</td>
                                    <td>{item.contract_ticker_symbol}</td>
                                    <td>{item.contract_address}</td>
                                    <td>{item.pretty_floor_price_quote === null ? "$0.00" : item.pretty_floor_price_quote}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
