export const owner = {
    email: 'ownerreservationservice@test.com',
    password: '123',
    firstName: 'UserService',
    lastName: 'Test',
    dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const user = {
    email: 'userreservationservice@test.com',
    password: '123',
    firstName: 'UserService',
    lastName: 'Test',
    dateOfBirth: '2022-03-02T18:11:29.003Z'
};

export const reservation = {
    from: "1970-01-01T08:15:00.003Z",
    to: "1970-01-01T09:15:00.003Z"
};

export const reservationComparisonObject = {
    id: expect.any(String),
    stationPropertiesId: expect.any(String),
    isBooked: expect.any(Boolean),
    driverId: expect.any(String),
    opensAt: expect.any(Date),
    closesAt: expect.any(Date)
};
