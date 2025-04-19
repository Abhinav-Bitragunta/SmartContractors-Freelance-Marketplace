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

  describe("Refund Process", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, servicePrice, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
    });

    it("should allow client to request refund", async () => {
      const clientBalanceBefore = new BN(await web3.eth.getBalance(client));
      
      // Get the service state before refund
      const serviceBefore = await freelanceMarketplace.services(serviceId);
      assert.equal(serviceBefore.isActive, true, "Service should be active before refund");
      
      // Check escrowed funds before refund
      const escrowedBefore = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedBefore.toString(), servicePrice, "Escrowed amount should match service price");
      
      // Request refund
      const receipt = await freelanceMarketplace.refundClient(serviceId, { from: client });
      
      // Get service state after refund
      const serviceAfter = await freelanceMarketplace.services(serviceId);
      assert.equal(serviceAfter.isActive, false, "Service should be inactive after refund");
      
      // Check escrowed funds after refund
      const escrowedAfter = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAfter.toString(), '0', "Escrowed funds should be zero after refund");
      
      // Check client balance increased by approximately the service price
      const clientBalanceAfter = new BN(await web3.eth.getBalance(client));
      const balanceDiff = clientBalanceAfter.sub(clientBalanceBefore);
      
      // Calculate gas cost
      const gasUsed = new BN(receipt.receipt.gasUsed);
      const tx = await web3.eth.getTransaction(receipt.tx);
      const gasPrice = new BN(tx.gasPrice);
      const gasCost = gasUsed.mul(gasPrice);
      
      // The balance difference should be approximately the service price minus gas cost
      const expectedDiff = new BN(servicePrice).sub(gasCost);
      
      // Allow for a small margin of error due to gas estimation
      const diff = expectedDiff.sub(balanceDiff).abs();
      const threshold = web3.utils.toWei("0.001", "ether"); // 0.001 ETH tolerance
      
      assert(diff.lt(new BN(threshold)), "Client should receive refund");
    });

    it("should prevent non-clients from requesting refund", async () => {
      await expectRevert(
        freelanceMarketplace.refundClient(serviceId, { from: accounts[3] }),
        "Only client can request refund"
      );
    });

    it("should prevent refund after payment", async () => {
      await freelanceMarketplace.releasePayment(serviceId, { from: client });
      
      await expectRevert(
        freelanceMarketplace.refundClient(serviceId, { from: client }),
        "Payment already released"
      );
    });
  });
});