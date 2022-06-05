const updateProfileRules = {
  email: 'email',
  firstName: 'max:300|string',
  lastName: 'max:300|string',
  dateOfBirth: 'date',
  password: 'string',
  new_password: 'required_with:password|min:8|confirmed',
  new_password_confirmation: 'required_with:new_password',
}

export default updateProfileRules;
