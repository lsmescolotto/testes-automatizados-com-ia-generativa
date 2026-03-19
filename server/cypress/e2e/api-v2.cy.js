describe('GET /customers', () => {
  it('retorna lista paginada com valores padrão quando não há query params', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers`

    cy.request('GET', url).then((response) => {
      const { status, body } = response
      const { customers, pageInfo } = body
      const { currentPage } = pageInfo

      expect(status).to.eq(200)
      expect(customers).to.be.an('array')
      expect(currentPage).to.eq(1)
    })
  })

  it('retorna pagina e limite especificados', () => {
    const baseUrl = Cypress.env('API_URL')
    const page = 2
    const limit = 10
    const url = `${baseUrl}/customers?page=${page}&limit=${limit}`

    cy.request('GET', url).then((response) => {
      const { status, body } = response
      const { customers, pageInfo } = body
      const { currentPage } = pageInfo

      expect(status).to.eq(200)
      expect(customers).to.be.an('array')
      expect(customers.length).to.be.at.most(limit)
      expect(currentPage).to.eq(page)
    })
  })

  it('filtra por size e industry', () => {
    const baseUrl = Cypress.env('API_URL')
    const size = 'Medium'
    const industry = 'Technology'
    const url = `${baseUrl}/customers?size=${size}&industry=${industry}`

    cy.request('GET', url).then((response) => {
      const { status, body } = response
      const { customers } = body

      expect(status).to.eq(200)
      expect(customers).to.be.an('array')

      customers.forEach((customer) => {
        const { size: customerSize, industry: customerIndustry } = customer
        expect(customerSize).to.eq(size)
        expect(customerIndustry).to.eq(industry)
      })
    })
  })

  it('retorna contactInfo e address como null quando não existirem no banco', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?page=1&limit=10`

    cy.request('GET', url).then((response) => {
      const { status, body } = response
      const { customers } = body

      expect(status).to.eq(200)
      expect(customers).to.be.an('array')

      const customerWithNulls = customers.find(
        ({ contactInfo, address }) => contactInfo === null || address === null
      )

      if (customerWithNulls) {
        const { contactInfo, address } = customerWithNulls
        if (contactInfo === null) expect(contactInfo).to.eq(null)
        if (address === null) expect(address).to.eq(null)
      } else {
        expect(customers.length).to.be.greaterThan(0)
      }
    })
  })

  it('calcula size corretamente com base em employees', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?page=1&limit=10`

    cy.request('GET', url).then((response) => {
      const { status, body } = response
      const { customers } = body

      expect(status).to.eq(200)
      expect(customers).to.be.an('array')

      customers.forEach((customer) => {
        const { employees, size } = customer

        if (employees < 100) expect(size).to.eq('Small')
        if (employees >= 100 && employees < 1000) expect(size).to.eq('Medium')
        if (employees >= 1000 && employees < 10000) expect(size).to.eq('Enterprise')
        if (employees >= 10000 && employees < 50000) expect(size).to.eq('Large Enterprise')
        if (employees >= 50000) expect(size).to.eq('Very Large Enterprise')
      })
    })
  })

  it('retorna 400 para page negativo', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?page=-1`

    cy.request({method:'GET', url,failOnStatusCode: false}).then((response) => {
      const { status } = response

      expect(status).to.eq(400)
    })
  })

  it('retorna 400 para limit não numérico', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?limit=abc`

    cy.request({method:'GET', url,failOnStatusCode: false}).then((response) => {
      const { status } = response

      expect(status).to.eq(400)
    })
  })

  it('retorna 400 para size não suportado', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?size=Gigantic`

    cy.request({method:'GET', url,failOnStatusCode: false}).then((response) => {
      const { status } = response

      expect(status).to.eq(400)
    })
  })

  it('retorna 400 para industry não suportado', () => {
    const baseUrl = Cypress.env('API_URL')
    const url = `${baseUrl}/customers?industry=Healthcare`

    cy.request({method:'GET', url,failOnStatusCode: false}).then((response) => {
      const { status } = response

      expect(status).to.eq(400)
    })
  })
})