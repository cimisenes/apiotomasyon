describe('Restful-Booker API Tests', () => {
  const baseUrl = 'https://restful-booker.herokuapp.com'
  let bookingId
  let token
  let createdBookingId

  before(() => {
    // Tüm testlerden önce auth token al
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth`,
      body: {
        username: 'admin',
        password: 'password123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      token = response.body.token
    })
  })

  it('1. Health Check - GET /ping', () => {
    cy.request('GET', `${baseUrl}/ping`).should((response) => {
      expect(response.status).to.eq(201)
    })
  })

  it('2. Get Booking IDs - GET /booking', () => {
    cy.request('GET', `${baseUrl}/booking`).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array').and.not.to.be.empty
      bookingId = response.body[0].bookingid
    })
  })

  it('3. Get Booking by ID - GET /booking/:id', () => {
    cy.request('GET', `${baseUrl}/booking/${bookingId}`).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('firstname').that.is.a('string')
      expect(response.body).to.have.property('lastname').that.is.a('string')
    })
  })

  it('4. Create Booking - POST /booking', () => {
    const bookingData = {
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: '2023-01-01',
        checkout: '2023-01-05'
      },
      additionalneeds: 'Breakfast'
    }

    cy.request('POST', `${baseUrl}/booking`, bookingData).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('bookingid').that.is.a('number')
      expect(response.body.booking).to.deep.include(bookingData)
      createdBookingId = response.body.bookingid
    })
  })

  it('5. Update Booking - PUT /booking/:id', () => {
    const updateData = {
      firstname: 'Jane',
      lastname: 'Smith',
      totalprice: 200,
      depositpaid: false,
      bookingdates: {
        checkin: '2023-02-01',
        checkout: '2023-02-10'
      },
      additionalneeds: 'Lunch'
    }

    cy.request({
      method: 'PUT',
      url: `${baseUrl}/booking/${createdBookingId}`,
      headers: {
        Cookie: `token=${token}`
      },
      body: updateData
    }).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.deep.include(updateData)
    })
  })

  it('6. Partial Update Booking - PATCH /booking/:id', () => {
    const partialUpdate = {
      firstname: 'Alice',
    }

    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/booking/${createdBookingId}`,
      headers: {
        Cookie: `token=${token}`
      },
      body: partialUpdate
    }).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('firstname', 'Alice')
    })
  })

  it('7. Delete Booking - DELETE /booking/:id', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/booking/${createdBookingId}`,
      headers: {
        Cookie: `token=${token}`
      }
    }).should((response) => {
      expect(response.status).to.eq(201)
    })

    // Silme işlemini doğrula
    cy.request({
      method: 'GET',
      url: `${baseUrl}/booking/${createdBookingId}`,
      failOnStatusCode: false
    }).should((response) => {
      expect(response.status).to.eq(404)
    })
  })
})