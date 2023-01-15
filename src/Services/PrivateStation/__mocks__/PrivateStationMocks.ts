export const user = {
  email: 'privatestationservice@test.com',
  password: '123',
  firstName: 'PrivateStationService',
  lastName: 'Test',
  dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const station = {
  coordinates: {
    lat: 34.56,
    long: 67.87,
    address: '34 rue de la Paix',
    city: 'Paris',
    country: 'France',
    countryCode: '123'
  },
  properties: {
    maxPower: 23,
    price: 2,
    isGreenEnergy: false,
    plugTypes: [1],
    nbChargingPoints: 1,
    slots: [
      {
        opensAt: '2022-03-02T10:00:00.003Z',
        closesAt: '2022-03-02T12:00:00.003Z'
      },
      {
        opensAt: '2022-03-02T17:00:00.003Z',
        closesAt: '2022-03-02T19:00:00.003Z'
      },
      {
        opensAt: '2022-03-02T22:00:00.003Z',
        closesAt: '2022-03-02T00:00:00.003Z'
      }
    ]
  }
};

export const stationComparisonObject = {
  id: expect.any(String),
  ownerId: expect.any(String),
  rate: expect.any(Number),
  coordinates: {
    ...station.coordinates,
    lat: expect.any(Object),
    long: expect.any(Object),
    id: expect.any(String),
    stationId: expect.any(String)
  },
  properties: {
    ...station.properties,
    maxPower: expect.any(Object),
    id: expect.any(String),
    stationId: expect.any(String),
    isPublic: false,
    plugTypes: ['TYPE2'],
    slots: expect.any(Array)
  },
  rateNumber: expect.any(Number),
  rates: expect.any(Array),
};

export const stationNumeroDos = {
  ...station,
  coordinates: {
    lat: 34.56,
    long: 67.87,
    address: 'Rue de la patate',
    city: 'Paris',
    country: 'France',
    countryCode: '123'
  }
};
