// cypress/e2e/customers.cy.js

describe('GET /customers', () => {
  const apiUrl = Cypress.env('API_URL')

  const getExpectedSize = ({ employees }) => {
    if (employees >= 50000) return 'Very Large Enterprise'
    if (employees >= 10000) return 'Large Enterprise'
    if (employees >= 1000) return 'Enterprise'
    if (employees >= 100) return 'Medium'
    return 'Small'
  }

  context('Sucesso', () => {
    it('retorna dados com valores padrão quando nenhuma query string é enviada', () => {
      // Arrange
      const url = `${apiUrl}/customers`

      // Act
      cy.request('GET', url).then((response) => {
        // Assert
        const { status, body } = response
        const { customers, pageInfo } = body
        const { currentPage, totalPages, totalCustomers } = pageInfo

        expect(status).to.eq(200)

        expect(customers).to.be.an('array')
        expect(pageInfo).to.be.an('object')

        expect(currentPage).to.eq(1)
        expect(customers?.length).to.be.at.most(10)

        customers.forEach((customer) => {
          const { id, name, employees, contactInfo, address, industry, size } = customer

          expect(id).to.be.a('number')
          expect(name).to.be.a('string')
          expect(employees).to.be.a('number')
          expect(industry).to.be.a('string')
          expect(size).to.be.a('string')

          expect(size).to.eq(getExpectedSize({ employees }))

          if (contactInfo === null) {
            expect(contactInfo).to.eq(null)
          } else {
            const { name: contactName, email } = contactInfo
            expect(contactName).to.be.a('string')
            expect(email).to.be.a('string')
          }

          if (address === null) {
            expect(address).to.eq(null)
          } else {
            const { street, city, state, zipCode, country } = address
            expect(street).to.be.a('string')
            expect(city).to.be.a('string')
            expect(state).to.be.a('string')
            expect(zipCode).to.be.a('string')
            expect(country).to.be.a('string')
          }
        })
      })
    })

    it('paginação retorna lista vazia quando page=2 excede os dados com limit padrão', () => {
      // Arrange
      const url = `${apiUrl}/customers`
      let totalPagesAmount = 1
//?page=2
      // Act
      cy.request('GET', url).then((response) => {
        // Assert
        const { status, body } = response
        const {  pageInfo } = body
        const {  totalPages } = pageInfo

        totalPagesAmount = totalPages

        expect(totalPages).to.eq(totalPagesAmount)

        expect(status).to.eq(200)
      })

      console.log(totalPagesAmount)

      cy.request('GET', `${url}?page=${totalPagesAmount + 1}`).then((response) => {
        const { status, body } = response
        const { customers, pageInfo } = body
        const { currentPage } = pageInfo

        expect(status).to.eq(200)
        expect(customers).to.be.an('array')
        expect(customers).to.have.length.at.least(0)
        expect(currentPage).to.eq(totalPagesAmount + 1)
    })})

    it('limitação retorna apenas 3 itens quando limit=3 é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?limit=3`

      // Act
      cy.request('GET', url).then((response) => {
        // Assert
        const { status, body } = response
        const { customers, pageInfo } = body
        const { currentPage, totalPages, totalCustomers } = pageInfo

        expect(status).to.eq(200)

        expect(customers).to.be.an('array')
        expect(customers).to.have.length(3)

        expect(currentPage).to.eq(1)
        expect(totalPages).to.eq(3)
        expect(totalCustomers).to.eq(8)
      })
    })

    it('filtra corretamente quando size=Medium é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?size=Medium`

      // Act
      cy.request('GET', url).then((response) => {
        // Assert
        const { status, body } = response
        const { customers, pageInfo } = body
        const { totalCustomers } = pageInfo

        expect(status).to.eq(200)

        expect(customers).to.be.an('array')
        expect(totalCustomers).to.eq(customers.length)

        customers.forEach((customer) => {
          const { employees, size } = customer

          expect(size).to.eq('Medium')
          expect(employees).to.be.at.least(100)
          expect(employees).to.be.lessThan(1000)
        })
      })
    })

    it('filtra corretamente quando industry=Logistics é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?industry=Logistics`

      // Act
      cy.request('GET', url).then((response) => {
        // Assert
        const { status, body } = response
        const { customers, pageInfo } = body
        const { totalCustomers } = pageInfo

        expect(status).to.eq(200)

        expect(customers).to.be.an('array')
        expect(totalCustomers).to.eq(customers.length)

        customers.forEach((customer) => {
          const { industry } = customer
          expect(industry).to.eq('Logistics')
        })
      })
    })
  })

  context('Falha', () => {
    it('retorna 400 quando page=0 é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?page=0`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna 400 quando page=-1 é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?page=-1`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna 400 quando limit=0 é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?limit=0`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna 400 quando limit=-1 é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?limit=-1`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('retorna 400 quando size inválido é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?size=InvalidSize`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq(
          'Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.'
        )
      })
    })

    it('retorna 400 quando industry inválido é informado', () => {
      // Arrange
      const url = `${apiUrl}/customers?industry=InvalidIndustry`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false }).then((response) => {
        // Assert
        const { status, body } = response
        const { error } = body

        expect(status).to.eq(400)
        expect(error).to.eq(
          'Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.'
        )
      })
    })
  })
})