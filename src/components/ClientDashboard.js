import React, { useState } from 'react';

function ClientDashboard({ services, releasePayment, requestRefund, rateService }) {
  const [ratingInputs, setRatingInputs] = useState({});

  // Handle changes in the rating dropdown for each service
  const handleRatingChange = (serviceId, event) => {
    setRatingInputs({ ...ratingInputs, [serviceId]: event.target.value });
  };

  // Call the rateService function with the selected rating
  const handleRate = async (serviceId) => {
    // Use the selected rating from state, or default to 1 if none is set
    const rating = ratingInputs[serviceId] || 1;
    await rateService(serviceId, rating);
  };

  if (services.length === 0) {
    return <div className="alert alert-info">You haven't hired any services yet.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Service</th>
            <th>Freelancer</th>
            <th>Price (ETH)</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => {
            // Parse serviceRating to a number (it might come as a string from the contract)
            const ratingValue = parseInt(service.serviceRating, 10) || 0;
            return (
              <tr key={service.id}>
                <td>{service.title}</td>
                <td>
                  {service.freelancer.substring(0, 6)}...
                  {service.freelancer.substring(service.freelancer.length - 4)}
                </td>
                <td>{service.price}</td>
                <td>
                  {service.isPaid ? (
                    <span className="badge badge-success">Completed</span>
                  ) : service.isActive ? (
                    <span className="badge badge-warning">In Progress</span>
                  ) : (
                    <span className="badge badge-secondary">Cancelled</span>
                  )}
                </td>
                <td>
                  {service.isPaid ? (
                    ratingValue > 0 ? (
                      <span>{ratingValue}/5</span>
                    ) : (
                      // Dropdown for rating if paid but not yet rated
                      <select
                        className="form-control form-control-sm"
                        value={ratingInputs[service.id] || 1}
                        onChange={(e) => handleRatingChange(service.id, e)}
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    )
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {service.isActive && !service.isPaid && (
                    <>
                      <button 
                        className="btn btn-success btn-sm mr-2"
                        onClick={() => releasePayment(service.id)}
                      >
                        Release Payment
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => requestRefund(service.id)}
                      >
                        Request Refund
                      </button>
                    </>
                  )}
                  {service.isPaid && (!service.serviceRating || ratingValue === 0) && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRate(service.id)}
                    >
                      Rate Service
                    </button>
                  )}
                  {service.isPaid && ratingValue > 0 && (
                    <span className="text-success">Rated</span>
                  )}
                  {!service.isActive && !service.isPaid && (
                    <span className="text-secondary">Refunded</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClientDashboard;
