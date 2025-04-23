import React from 'react';

function Navbar({ accounts, setActiveTab, isFreelancer, toggleUserType }) {
  const shortAddress = accounts.length > 0 ? 
    `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}` : 
    'Not Connected';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="#!">Freelance DApp</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={() => setActiveTab('marketplace')}>
                Marketplace
              </button>
            </li>
            {isFreelancer && (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => setActiveTab('offerService')}>
                  Offer Service
                </button>
              </li>
            )}
            {isFreelancer && (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => setActiveTab('myServices')}>
                  My Services
                </button>
              </li>
            )}
            {!isFreelancer && (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => setActiveTab('clientDashboard')}>
                  My Hired Services
                </button>
              </li>
            )}
          </ul>
          <div className="navbar-text mr-3">
            <button className="btn btn-sm btn-outline-light" onClick={toggleUserType}>
              Switch to {isFreelancer ? 'Client' : 'Freelancer'} Mode
            </button>
          </div>
          <div className="navbar-text">
            <span className="badge badge-light">{shortAddress}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
