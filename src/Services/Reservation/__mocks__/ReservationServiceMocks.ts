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

export const alreadyReservedObject = {
    from: "1970-01-01T09:20:00.003Z",
    to: "1970-01-01T09:00:00.003Z"
};

export const reservationComparisonObject = {
    id: expect.any(String),
    from: expect.any(Date),
    to: expect.any(Date),
    slotId: expect.any(String),
    userId: expect.any(String),
};

export const reservationShowComparisonObject = {
    id: expect.any(String),
    from: expect.any(Date),
    to: expect.any(Date),
    slot: expect.any(Object),
    slotId: expect.any(String),
    userId: expect.any(String),
};

export const reservationDeletedComparisonObject = {
    id: expect.any(String),
    slotId: expect.any(String),
    userId: expect.any(String),
    from: expect.any(Date),
    to: expect.any(Date)
};