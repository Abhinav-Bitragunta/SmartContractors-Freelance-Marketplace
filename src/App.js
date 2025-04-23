import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FreelanceMarketplaceABI from './contracts/FreelanceMarketplace.json';
import './App.css';
import ServiceList from './components/ServiceList';
import ServiceForm from './components/ServiceForm';
import Navbar from './components/Navbar';
import ClientDashboard from './components/ClientDashboard';


function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientServices, setClientServices] = useState([]);
  const [isFreelancer, setIsFreelancer] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Connect to Web3
        let web3Instance;
        if (window.ethereum) {
          web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
          web3Instance = new Web3(window.web3.currentProvider);
        } else {
          setError('No Ethereum browser extension detected. Please install MetaMask.');
          setLoading(false);
          return;
        }

        // Get connected accounts
        const accounts = await web3Instance.eth.getAccounts();
        
        // Get contract instance
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = FreelanceMarketplaceABI.networks[networkId];
        
        if (!deployedNetwork) {
          setError('Contract not deployed on the detected network. Please switch to the correct network.');
          setLoading(false);
          return;
        }
        
        const contractInstance = new web3Instance.eth.Contract(
          FreelanceMarketplaceABI.abi,
          deployedNetwork.address
        );
        
        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(contractInstance);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', async (newAccounts) => {
          setAccounts(newAccounts);
          await loadServices(web3Instance, contractInstance, newAccounts[0]);
        });
        
        await loadServices(web3Instance, contractInstance, accounts[0]);
        setLoading(false);
      } catch (error) {
        console.error("Could not connect to contract or blockchain:", error);
        setError('Failed to load the application. Check console for details.');
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadServices = async (web3, contract, account) => {
    try {
      const serviceCount = await contract.methods.getServiceCount().call();
      const loadedServices = [];
      const clientServicesTemp = [];
      
      for (let i = 0; i < serviceCount; i++) {
        const service = await contract.methods.services(i).call();
        if (service.freelancer !== '0x0000000000000000000000000000000000000000') {
          // Get the freelancer's average rating from the contract
          const avgRating = await contract.methods.getAverageRating(service.freelancer).call();
          const ratingCount = await contract.methods.getRatingCount(service.freelancer).call();

          const formattedService = {
            id: i,
            freelancer: service.freelancer,
            client: service.client,
            title: service.title,
            price: web3.utils.fromWei(service.price, 'ether'),
            isActive: service.isActive,
            isPaid: service.isPaid,
            serviceRating: service.rating, // Rating submitted for this service (0 if not rated)
            avgRating: avgRating,        // Freelancer's overall average rating
            ratingCount: ratingCount
          };
          
          loadedServices.push(formattedService);
          
          // Check if current user is the client for this service
          if (service.client.toLowerCase() === account.toLowerCase()) {
            clientServicesTemp.push(formattedService);
          }
        }
      }
      
      setServices(loadedServices);
      setClientServices(clientServicesTemp);
    } catch (error) {
      console.error("Error loading services:", error);
      setError('Failed to load services. Check console for details.');
    }
  };

  const createService = async (title, price) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const priceInWei = web3.utils.toWei(price, 'ether');
      await contract.methods.offerService(title, priceInWei).send({ from: accounts[0] });
      setSuccess('Service created successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error creating service:", error);
      setError('Failed to create service. Check console for details.');
    }
    
    setLoading(false);
  };

  const hireFreelancer = async (serviceId, price) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const priceInWei = web3.utils.toWei(price, 'ether');
      await contract.methods.hireFreelancer(serviceId).send({ 
        from: accounts[0],
        value: priceInWei
      });
      setSuccess('Freelancer hired successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error hiring freelancer:", error);
      setError('Failed to hire freelancer. Check console for details.');
    }
    
    setLoading(false);
  };

  const releasePayment = async (serviceId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await contract.methods.releasePayment(serviceId).send({ from: accounts[0] });
      setSuccess('Payment released successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error releasing payment:", error);
      setError('Failed to release payment. Check console for details.');
    }
    
    setLoading(false);
  };

  const rateService = async (serviceId, rating) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await contract.methods.rateService(serviceId, rating).send({ from: accounts[0] });
      setSuccess('Service rated successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error rating service:", error);
      setError('Failed to rate service. Check console for details.');
    }

    setLoading(false);
  };

  const getAverageRating = async (freelancerAddress) => {
    try {
      const avgRating = await contract.methods.getAverageRating(freelancerAddress).call();
      return avgRating;
    } catch (error) {
      console.error("Error fetching average rating:", error);
      setError('Failed to get average rating. Check console for details.');
      return "0";
    }
  };

  const getRatingCount = async (freelancerAddress) => {
    try {
      const ratingCount = await contract.methods.getRatingCount(freelancerAddress).call();
      return ratingCount;
    } catch (error) {
      console.error("Error fetching rating count:", error);
      setError('Failed to get rating count. Check console for details.');
      return "0";
    }
  };

  const toggleUserType = () => {
    setIsFreelancer(!isFreelancer);
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar 
        accounts={accounts} 
        setActiveTab={setActiveTab}
        isFreelancer={isFreelancer}
        toggleUserType={toggleUserType}
      />
      
      <div className="container mt-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        {activeTab === 'marketplace' && (
          <div>
            <h2>Available Services</h2>
            <ServiceList 
              services={services} 
              currentAccount={accounts[0]} 
              hireFreelancer={hireFreelancer}
              isFreelancer={isFreelancer}
            />
          </div>
        )}
        
        {activeTab === 'offerService' && isFreelancer && (
          <div>
            <h2>Offer Your Service</h2>
            <ServiceForm createService={createService} />
          </div>
        )}
        
        {activeTab === 'clientDashboard' && !isFreelancer && (
          <div>
            <h2>Services You've Hired</h2>
            <ClientDashboard 
              services={clientServices}
              releasePayment={releasePayment}
              rateService={rateService}
              getAverageRating={getAverageRating}  /* Optionally pass this if needed */
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
