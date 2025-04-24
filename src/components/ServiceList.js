import React from 'react';

function ServiceList({ services, currentAccount, hireFreelancer, isFreelancer, activeTab }) {
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
                 <strong> Freelancer: </strong> {service.freelancer.substring(0, 6)}...{service.freelancer.substring(service.freelancer.length - 4)}
              </p>
              <p className="card-text">
              <strong> Avg. Rating: </strong> {parseInt(service.avgRating) > 0 ? `${service.avgRating}/5` : 'No ratings yet'}
              </p>
              <p className="card-text">
                <strong> Number of reviews: </strong> {parseInt(service.ratingCount) > 0 ? `${service.ratingCount}`: 0}
              </p>
            </div>
            <div className="card-footer">
            {!isFreelancer && activeTab === 'marketplace' && (
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => hireFreelancer(service.id, service.price)}
                >
                  Hire Freelancer
                </button>
              )}
              {/* {isFreelancer && activeTab === 'My Services' && (
                <div>
                  {service.isPaid ? (
                    <span className="badge status-badge badge-success">Completed</span>
                  ) : service.isActive ? (
                    <span className="badge status-badge badge-warning">In Progress</span>
                  ) : (
                    <span className="badge status-badge badge-danger">Cancelled</span>
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceList;
