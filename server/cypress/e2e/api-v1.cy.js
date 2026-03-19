const API_URL =
  Cypress.env("API_URL") ||
  Cypress.config("baseUrl") ||
  "http://localhost:3001";

const ENDPOINT = `${API_URL.replace(/\/$/, "")}/customers`;

const ALLOWED_SIZES = [
  "Small",
  "Medium",
  "Enterprise",
  "Large Enterprise",
  "Very Large Enterprise",
];

const ALLOWED_INDUSTRIES = ["Logistics", "Retail", "Technology", "HR", "Finance"];

function expectedSizeFromEmployees(employees) {
  if (employees < 100) return "Small";
  if (employees >= 100 && employees < 1000) return "Medium";
  if (employees >= 1000 && employees < 10000) return "Enterprise";
  if (employees >= 10000 && employees < 50000) return "Large Enterprise";
  return "Very Large Enterprise";
}

function assertCustomerShape(customer) {
  expect(customer).to.have.all.keys([
    "id",
    "name",
    "employees",
    "contactInfo",
    "size",
    "industry",
    "address",
  ]);

  expect(customer.id).to.be.a("number");
  expect(customer.name).to.be.a("string");
  expect(customer.employees).to.be.a("number");

  // contactInfo can be null or object with {name,email}
  expect(customer.contactInfo === null || typeof customer.contactInfo === "object")
    .to.eq(true);

  if (customer.contactInfo !== null) {
    expect(customer.contactInfo).to.have.all.keys(["name", "email"]);
    expect(customer.contactInfo.name).to.be.a("string");
    expect(customer.contactInfo.email).to.be.a("string");
  }

  // address can be null or object with specified keys
  expect(customer.address === null || typeof customer.address === "object").to.eq(
    true,
  );

  if (customer.address !== null) {
    expect(customer.address).to.have.all.keys([
      "street",
      "city",
      "state",
      "zipCode",
      "country",
    ]);
    expect(customer.address.street).to.be.a("string");
    expect(customer.address.city).to.be.a("string");
    expect(customer.address.state).to.be.a("string");
    expect(customer.address.zipCode).to.be.a("string");
    expect(customer.address.country).to.be.a("string");
  }

  expect(ALLOWED_SIZES).to.include(customer.size);
  expect(ALLOWED_INDUSTRIES).to.include(customer.industry);
}

function assertPageInfoShape(pageInfo) {
  expect(pageInfo).to.have.all.keys(["currentPage", "totalPages", "totalCustomers"]);
  expect(pageInfo.currentPage).to.be.a("number");
  expect(pageInfo.totalPages).to.be.a("number");
  expect(pageInfo.totalCustomers).to.be.a("number");
}

describe("GET /customers - contract & validation", () => {
  it("returns 200 and expected structure (customers + pageInfo) when request succeeds", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      failOnStatusCode: false,
    }).then((res) => {
      // The spec says: if there are customers, return described JSON on success.
      // If DB is empty, some APIs still return 200 with {customers:[], pageInfo:{...}}.
      // We'll accept either, but enforce the shape when 200.
      expect(res.status).to.eq(200);

      expect(res.body).to.have.property("customers");
      expect(res.body).to.have.property("pageInfo");

      expect(res.body.customers).to.be.an("array");
      assertPageInfoShape(res.body.pageInfo);

      // default page should be 1 per spec
      expect(res.body.pageInfo.currentPage).to.eq(1);

      // if there are customers, validate each item’s schema
      res.body.customers.forEach(assertCustomerShape);
    });
  });

  it("uses default query params when omitted: page=1, limit=10, size=All, industry=All", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
    }).then((res) => {
      expect(res.status).to.eq(200);

      // default currentPage should be 1
      expect(res.body.pageInfo.currentPage).to.eq(1);

      // if API returns <=10 customers on first page, ensure it never exceeds 10
      expect(res.body.customers.length).to.be.lte(10);
    });
  });

  it("supports pagination with page and limit (e.g., page=2&limit=10) and returns consistent pageInfo", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { page: 2, limit: 10 },
      failOnStatusCode: false,
    }).then((res) => {
      // If totalPages is 1, page=2 may be invalid depending on implementation.
      // Spec only states invalid params => 400; out-of-range page behavior isn't specified.
      // We'll assert either:
      // - 200 with currentPage 2, OR
      // - 200 with currentPage clamped, OR
      // - 400 if they consider out-of-range invalid.
      expect([200, 400]).to.include(res.status);

      if (res.status === 200) {
        assertPageInfoShape(res.body.pageInfo);
        expect(res.body.customers).to.be.an("array");
        expect(res.body.customers.length).to.be.lte(10);
        res.body.customers.forEach(assertCustomerShape);
      }
    });
  });

  it("filters by size and industry (example: size=Medium&industry=Technology) and matches returned fields", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { size: "Medium", industry: "Technology", limit: 10, page: 1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 400]).to.include(res.status);
      if (res.status === 400) return;

      expect(res.body.customers).to.be.an("array");
      res.body.customers.forEach((c) => {
        assertCustomerShape(c);
        // industry should match filter when provided (exact case per spec values)
        expect(c.industry).to.eq("Technology");
        // size should match filter
        expect(c.size).to.eq("Medium");
      });
    });
  });

  it("enforces dynamic size based on employees for each returned customer", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      res.body.customers.forEach((c) => {
        assertCustomerShape(c);
        const expected = expectedSizeFromEmployees(c.employees);
        expect(c.size).to.eq(expected);
      });
    });
  });

  it("returns 400 for negative page", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { page: -1 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("returns 400 for non-number page", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { page: "abc" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("returns 400 for negative limit", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { limit: -10 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("returns 400 for non-number limit", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { limit: "ten" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("returns 400 for unsupported size", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { size: "Gigantic" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("returns 400 for unsupported industry", () => {
    cy.request({
      method: "GET",
      url: ENDPOINT,
      qs: { industry: "Healthcare" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("accepts only supported size values (smoke) - doesn't 400", () => {
    // Keep it light: just ensure the API accepts the allowed enums.
    // If DB has no customers for some filter, it should still be a 200 (typical),
    // but spec doesn't explicitly define; we’ll just assert it’s not a 400.
    const checks = ALLOWED_SIZES.map((size) =>
      cy
        .request({
          method: "GET",
          url: ENDPOINT,
          qs: { size },
          failOnStatusCode: false,
        })
        .then((res) => {
          expect(res.status).to.not.eq(400);
        }),
    );

    // ensure Cypress waits all
    cy.wrap(Promise.all(checks));
  });

  it("accepts only supported industry values (smoke) - doesn't 400", () => {
    const checks = ALLOWED_INDUSTRIES.map((industry) =>
      cy
        .request({
          method: "GET",
          url: ENDPOINT,
          qs: { industry },
          failOnStatusCode: false,
        })
        .then((res) => {
          expect(res.status).to.not.eq(400);
        }),
    );

    cy.wrap(Promise.all(checks));
  });
});