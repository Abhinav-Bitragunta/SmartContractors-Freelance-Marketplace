import React, { useState } from 'react';

function ClientDashboard({ services, releasePayment, rateService }) {
  const [ratingInputs, setRatingInputs] = useState({});

  const handleRatingChange = (serviceId, event) => {
    setRatingInputs({ ...ratingInputs, [serviceId]: event.target.value });
  };

  const handleRate = async (serviceId) => {
    const rating = ratingInputs[serviceId] || 5;
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
                    <span className="badge2 badge-success">Completed</span>
                  ) : service.isActive ? (
                    <span className="badge2 badge-warning">In Progress</span>
                  ) : (
                    <span className="badge2 badge-secondary">Cancelled</span>
                  )}
                </td>
                <td>
                  {service.isPaid ? (
                    ratingValue > 0 ? (
                      <span>{ratingValue}/5</span>
                    ) : (
                      <select
                        className="form-control form-control-sm"
                        value={ratingInputs[service.id] || 5}
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
