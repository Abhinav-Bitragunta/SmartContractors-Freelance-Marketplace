import React from 'react';

function FreelancerDashboard({ services, currentAccount }) {
  // Filter only the services created by this freelancer
  const myServices = services.filter(service =>
    service.freelancer.toLowerCase() === currentAccount.toLowerCase()
  );

  // Calculate average rating and total number of ratings
  const ratedServices = myServices.filter(s => s.serviceRating > 0);
  const totalRatings = ratedServices.length;
  const avgRating = totalRatings
    ? (ratedServices.reduce((sum, s) => sum + parseInt(s.serviceRating), 0) / totalRatings).toFixed(2)
    : null;

  return (
    <div className="container mt-4">
      <h3>Freelancer Dashboard</h3>
      <p>
        <strong>Average Rating:</strong>{' '}
        {avgRating ? `${avgRating}/5` : 'No ratings yet'}
      </p>
      <p>
        <strong>Total Ratings Received:</strong> {totalRatings}
      </p>

      <div className="row">
        {myServices.map(service => (
          <div key={service.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">{service.title}</h5>
              </div>
              <div className="card-body">
                <p><strong>Price:</strong> {service.price} ETH</p>
                <p><strong>Status:</strong>{' '}
                  {service.isPaid
                    ? 'Payment Received'
                    : service.isActive
                      ? 'In Progress'
                      : 'Cancelled'}
                </p>
                <p><strong>Rating:</strong>{' '}
                  {service.serviceRating > 0
                    ? `${service.serviceRating}/5`
                    : 'Not Rated'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreelancerDashboard;
