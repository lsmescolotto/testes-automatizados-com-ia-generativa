// tests/customers.api.spec.js
import { test, expect } from '@playwright/test'

const getExpectedSize = ({ employees }) => {
  if (employees >= 50000) return 'Very Large Enterprise'
  if (employees >= 10000) return 'Large Enterprise'
  if (employees >= 1000) return 'Enterprise'
  if (employees >= 100) return 'Medium'
  return 'Small'
}

test.describe('GET /customers', () => {
  const apiUrl = "http://localhost:3001"

  test.describe('Sucesso', () => {
    test('retorna dados com valores padrão quando nenhuma query string é enviada', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      const { currentPage, totalPages, totalCustomers } = pageInfo

      expect(Array.isArray(customers)).toBe(true)
      expect(typeof pageInfo).toBe('object')

      expect(currentPage).toBe(1)

      expect(typeof totalCustomers).toBe('number')
      expect(totalCustomers).toBeGreaterThanOrEqual(0)

      expect(totalPages).toBe(Math.ceil(totalCustomers / 10))

      expect(customers.length).toBeLessThanOrEqual(10)
      expect(totalCustomers).toBeGreaterThanOrEqual(customers.length)

      customers.forEach((customer) => {
        const { id, name, employees, contactInfo, address, industry, size } = customer

        expect(typeof id).toBe('number')
        expect(typeof name).toBe('string')
        expect(typeof employees).toBe('number')
        expect(typeof industry).toBe('string')
        expect(typeof size).toBe('string')

        expect(size).toBe(getExpectedSize({ employees }))

        if (contactInfo === null) {
          expect(contactInfo).toBeNull()
        } else {
          const { name: contactName, email } = contactInfo
          expect(typeof contactName).toBe('string')
          expect(typeof email).toBe('string')
        }

        if (address === null) {
          expect(address).toBeNull()
        } else {
          const { street, city, state, zipCode, country } = address
          expect(typeof street).toBe('string')
          expect(typeof city).toBe('string')
          expect(typeof state).toBe('string')
          expect(typeof zipCode).toBe('string')
          expect(typeof country).toBe('string')
        }
      })
    })

    test('paginação reflete totalPages e totalCustomers ao solicitar page=2', async ({ request }) => {
      // Arrange
      const urlDefault = `${apiUrl}/customers`

      // Act
      const firstResponse = await request.get(urlDefault)
      const firstBody = await firstResponse.json()

      // Assert
      expect(firstResponse.status()).toBe(200)

      const { pageInfo: firstPageInfo } = firstBody
      const { totalPages, totalCustomers } = firstPageInfo

      // Arrange
      const urlPage2 = `${apiUrl}/customers?page=2`

      // Act
      const secondResponse = await request.get(urlPage2)
      const secondBody = await secondResponse.json()

      // Assert
      expect(secondResponse.status()).toBe(200)

      const { customers, pageInfo } = secondBody
      const { currentPage, totalPages: totalPages2, totalCustomers: totalCustomers2 } = pageInfo

      expect(currentPage).toBe(2)
      expect(totalPages2).toBe(totalPages)
      expect(totalCustomers2).toBe(totalCustomers)

      expect(Array.isArray(customers)).toBe(true)
      expect(customers.length).toBeLessThanOrEqual(10)
    })

    test('limitação respeita o valor quando limit=3 é informado', async ({ request }) => {
      // Arrange
      const limit = 3
      const url = `${apiUrl}/customers?limit=${limit}`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      const { currentPage, totalPages, totalCustomers } = pageInfo

      expect(Array.isArray(customers)).toBe(true)
      expect(customers.length).toBeLessThanOrEqual(limit)

      expect(currentPage).toBe(1)
      expect(totalPages).toBe(Math.ceil(totalCustomers / limit))
    })

    test('filtra corretamente quando size=Medium é informado', async ({ request }) => {
      // Arrange
      const limit = 100000
      const url = `${apiUrl}/customers?size=Medium&limit=${limit}`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      const { totalCustomers, totalPages } = pageInfo

      expect(Array.isArray(customers)).toBe(true)
      expect(totalCustomers).toBe(customers.length)
      expect(totalPages).toBe(Math.ceil(totalCustomers / limit))

      customers.forEach((customer) => {
        const { employees, size } = customer

        expect(size).toBe('Medium')
        expect(employees).toBeGreaterThanOrEqual(100)
        expect(employees).toBeLessThan(1000)
      })
    })

    test('filtra corretamente quando industry=Logistics é informado', async ({ request }) => {
      // Arrange
      const limit = 100000
      const url = `${apiUrl}/customers?industry=Logistics&limit=${limit}`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      const { totalCustomers, totalPages } = pageInfo

      expect(Array.isArray(customers)).toBe(true)
      expect(totalCustomers).toBe(customers.length)
      expect(totalPages).toBe(Math.ceil(totalCustomers / limit))

      customers.forEach((customer) => {
        const { industry } = customer
        expect(industry).toBe('Logistics')
      })
    })
  })

  test.describe('Falha', () => {
    test('retorna 400 quando page=0 é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?page=0`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna 400 quando page=-1 é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?page=-1`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna 400 quando limit=0 é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?limit=0`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna 400 quando limit=-1 é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?limit=-1`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('retorna 400 quando size inválido é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?size=InvalidSize`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe(
        'Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.'
      )
    })

    test('retorna 400 quando industry inválido é informado', async ({ request }) => {
      // Arrange
      const url = `${apiUrl}/customers?industry=InvalidIndustry`

      // Act
      const response = await request.get(url)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)

      const { error } = body
      expect(error).toBe(
        'Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.'
      )
    })
  })
})