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
    hours: [
      {
        day: 1,
        openTime: '08:00',
        closeTime: '17:00'
      },
      {
        day: 2,
        openTime: '10:00',
        closeTime: '15:00'
      },
      {
        day: 3,
        openTime: '11:00',
        closeTime: '19:00'
      }
    ]
  }
};

export const stationComparisonObject = {
  id: expect.any(String),
  ownerId: expect.any(String),
  rate: 0,
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
    hours: expect.any(Array)
  },
  rateNumber: 0,
  rates: []
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
