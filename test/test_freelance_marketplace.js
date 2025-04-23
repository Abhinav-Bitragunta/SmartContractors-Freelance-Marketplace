const FreelanceMarketplace = artifacts.require("FreelanceMarketplace");
const { BN, expectRevert } = require('@openzeppelin/test-helpers');

contract("FreelanceMarketplace", accounts => {
  const freelancer = accounts[1];
  const client = accounts[2];
  const servicePrice = web3.utils.toWei("0.1", "ether");
  const serviceTitle = "Web Development";
  
  let freelanceMarketplace;
  let serviceId;

  beforeEach(async () => {
    freelanceMarketplace = await FreelanceMarketplace.new();
  });

  describe("Service Listing", () => {
    it("should allow freelancers to list services", async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, servicePrice, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      
      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.freelancer, freelancer, "Freelancer address mismatch");
      assert.equal(service.title, serviceTitle, "Service title mismatch");
      assert.equal(service.price, servicePrice, "Service price mismatch");
      assert.equal(service.isActive, true, "Service should be active");
    });

    it("should reject empty titles", async () => {
      await expectRevert(
        freelanceMarketplace.offerService("", servicePrice, { from: freelancer }),
        "Title cannot be empty"
      );
    });

    it("should reject zero prices", async () => {
      await expectRevert(
        freelanceMarketplace.offerService(serviceTitle, 0, { from: freelancer }),
        "Price must be greater than 0"
      );
    });
  });

  describe("Hiring Process", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, servicePrice, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
    });

    it("should allow clients to hire freelancers", async () => {
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
      
      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.client, client, "Client address mismatch");
      
      const escrowedAmount = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAmount, servicePrice, "Escrowed funds mismatch");
    });

    it("should reject hiring with incorrect payment amount", async () => {
      const incorrectPrice = web3.utils.toWei("0.05", "ether");
      
      await expectRevert(
        freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: incorrectPrice }),
        "Payment must match service price"
      );
    });

    it("should prevent hiring already hired services", async () => {
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
      
      await expectRevert(
        freelanceMarketplace.hireFreelancer(serviceId, { from: accounts[3], value: servicePrice }),
        "Service already hired"
      );
    });
  });

  describe("Payment Release", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, servicePrice, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
    });

    it("should allow client to release payment", async () => {
      const freelancerBalanceBefore = new BN(await web3.eth.getBalance(freelancer));
      
      await freelanceMarketplace.releasePayment(serviceId, { from: client });
      
      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.isPaid, true, "Service should be marked as paid");
      assert.equal(service.isActive, false, "Service should be inactive");
      
      const escrowedAmount = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAmount, 0, "Escrowed funds should be zero");
      
      const freelancerBalanceAfter = new BN(await web3.eth.getBalance(freelancer));
      assert.equal(
        freelancerBalanceAfter.sub(freelancerBalanceBefore).toString(),
        servicePrice,
        "Freelancer should receive payment"
      );
    });

    it("should prevent non-clients from releasing payment", async () => {
      await expectRevert(
        freelanceMarketplace.releasePayment(serviceId, { from: accounts[3] }),
        "Only client can release payment"
      );
    });

    it("should prevent double payment", async () => {
      await freelanceMarketplace.releasePayment(serviceId, { from: client });
      
      await expectRevert(
        freelanceMarketplace.releasePayment(serviceId, { from: client }),
        "Payment already released"
      );
    });
  });
});