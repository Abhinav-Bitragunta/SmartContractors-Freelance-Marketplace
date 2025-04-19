import React, { useState } from 'react';

function ServiceForm({ createService }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) return;
    
    createService(title, price);
    setTitle('');
    setPrice('');
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Service Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Web Development"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (ETH)</label>
            <input
              type="number"
              className="form-control"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Service</button>
        </form>
      </div>
    </div>
  );
}

export default ServiceForm;
