import React from 'react';

function ServiceList({ services, currentAccount, hireFreelancer, isFreelancer }) {
  // Filter active services that haven't been hired yet
  const availableServices = services.filter(service => 
    service.isActive && 
    service.client === '0x0000000000000000000000000000000000000000'
  );

  // Filter out user's own services if in freelancer mode
  const filteredServices = isFreelancer 
    ? availableServices.filter(service => service.freelancer.toLowerCase() !== currentAccount.toLowerCase())
    : availableServices;

  if (filteredServices.length === 0) {
    return <div className="alert alert-info">No services available at the moment.</div>;
  }

  return (
    <div className="row">
      {filteredServices.map(service => (
        <div key={service.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">{service.title}</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                <strong>Price:</strong> {service.price} ETH
              </p>
              <p className="card-text text-truncate">
                <small className="text-muted">
                  Freelancer: {service.freelancer.substring(0, 6)}...{service.freelancer.substring(service.freelancer.length - 4)}
                </small>
              </p>
            </div>
            <div className="card-footer">
              {!isFreelancer && (
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => hireFreelancer(service.id, service.price)}
                >
                  Hire Freelancer
                </button>
              )}
              {isFreelancer && (
                <button className="btn btn-secondary btn-block" disabled>
                  Not Available (Freelancer Mode)
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceList;
