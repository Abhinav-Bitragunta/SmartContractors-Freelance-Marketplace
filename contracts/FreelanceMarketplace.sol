// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FreelanceMarketplace is ReentrancyGuard {
    // Service struct to store service details
    struct Service {
        uint256 id;
        address freelancer;
        address client;
        string title;
        uint256 price;
        bool isActive;
        bool isPaid;
        uint8 rating; // Rating from the client (0 = not rated, 1-5 valid ratings)
    }

    // Struct to aggregate freelancer ratings
    struct FreelancerRating {
        uint256 total; // Sum of rating values
        uint256 count; // Number of ratings received
    }

    // Counter for service IDs
    uint256 private serviceCounter;
    
    // Mapping from service ID to Service struct
    mapping(uint256 => Service) public services;
    
    // Mapping to track escrowed funds for each service
    mapping(uint256 => uint256) public escrowedFunds;

    // Mapping from freelancer address to their aggregated rating data
    mapping(address => FreelancerRating) public freelancerRatings;
    
    // Events
    event ServiceOffered(uint256 indexed serviceId, address indexed freelancer, string title, uint256 price);
    event FreelancerHired(uint256 indexed serviceId, address indexed client);
    event PaymentReleased(uint256 indexed serviceId, address indexed freelancer, uint256 amount);
    event ServiceRated(uint256 indexed serviceId, address indexed client, uint8 rating);
    
    /**
     * @dev Allows freelancers to list their services
     * @param _title Short service title
     * @param _price Service cost in wei
     */
    function offerService(string memory _title, uint256 _price) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        uint256 serviceId = serviceCounter;
        
        services[serviceId] = Service({
            id: serviceId,
            freelancer: msg.sender,
            client: address(0),
            title: _title,
            price: _price,
            isActive: true,
            isPaid: false,
            rating: 0
        });
        
        serviceCounter++;
        
        emit ServiceOffered(serviceId, msg.sender, _title, _price);
        return serviceId;
    }
    
    /**
     * @dev Allows clients to hire a freelancer and escrow payment
     * @param _serviceId ID of the service to hire
     */
    function hireFreelancer(uint256 _serviceId) external payable nonReentrant {
        Service storage service = services[_serviceId];
        
        require(service.freelancer != address(0), "Service does not exist");
        require(service.isActive, "Service is not active");
        require(service.client == address(0), "Service already hired");
        require(msg.value == service.price, "Payment must match service price");
        
        service.client = msg.sender;
        escrowedFunds[_serviceId] = msg.value;
        
        emit FreelancerHired(_serviceId, msg.sender);
    }
    
    /**
     * @dev Allows client to release payment to freelancer after work completion
     * @param _serviceId ID of the service
     */
    function releasePayment(uint256 _serviceId) external nonReentrant {
        Service storage service = services[_serviceId];
        
        require(service.client == msg.sender, "Only client can release payment");
        require(!service.isPaid, "Payment already released");
        require(escrowedFunds[_serviceId] > 0, "No funds in escrow");
        // Should there be a 'require(service.price == escrowedFunds[_serviceID], "Escrowed funds do not match price"); ?'       
        uint256 amount = escrowedFunds[_serviceId];
        //Shouldn't this be below be after the payment failed line? [APPARENTLY NOT, REENTRANCY ATTACK]
        escrowedFunds[_serviceId] = 0;
        service.isPaid = true;
        service.isActive = false;
        
        (bool success, ) = payable(service.freelancer).call{value: amount}("");
        require(success, "Payment failed");
        
        emit PaymentReleased(_serviceId, service.freelancer, amount);
    }
    
    /**
     * @dev Allows the client to rate a service (only if payment was released).
     * @param _serviceId ID of the service to rate.
     * @param _rating Service rating value (must be between 1 and 5).
     */
    function rateService(uint256 _serviceId, uint8 _rating) external nonReentrant {
        Service storage service = services[_serviceId];

        require(service.client == msg.sender, "Only client can rate the service");
        require(service.isPaid, "Service payment not released yet");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(service.rating == 0, "Service already rated");
        
        // Update the service rating
        service.rating = _rating;
        
        // Update the freelancer's aggregated ratings
        freelancerRatings[service.freelancer].total += _rating;
        freelancerRatings[service.freelancer].count += 1;
        
        emit ServiceRated(_serviceId, msg.sender, _rating);
    }

    /**
     * @dev Returns the average rating of a freelancer.
     * @param _freelancer Address of the freelancer.
     * @return The average rating as an integer (0 if no ratings present).
     *
     * Note: This returns an integer average with division truncation. For more precise ratings,
     * additional logic could be implemented to return a fixed-point number.
     */
    function getAverageRating(address _freelancer) external view returns (uint256) {
        FreelancerRating memory rating = freelancerRatings[_freelancer];
        if (rating.count == 0) {
            return 0;
        }
        return rating.total / rating.count;
    }

    /**
     * @dev Returns the number of ratings received by a certain freelancer.
     * @param _freelancer Address of the freelancer.
     * @return The number of ratings as an integer (0 if no ratings present).
     */
    function getRatingCount(address _freelancer) external view returns (uint256) {
        return freelancerRatings[_freelancer].count;
    }

    /**
     * @dev Returns all listed services
     */
    function getServiceCount() external view returns (uint256) {
        return serviceCounter;
    }
}
