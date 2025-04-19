import React from 'react';

function ClientDashboard({ services, releasePayment, requestRefund }) {
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
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
                {service.isPaid && (
                  <span className="text-success">Payment Released</span>
                )}
                {!service.isActive && !service.isPaid && (
                  <span className="text-secondary">Refunded</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientDashboard;
