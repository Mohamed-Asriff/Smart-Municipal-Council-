export const defaultCitizenProfile = {
  id: null,
  name: 'Citizen User',
  email: '',
  phone: '',
  nic: '',
  zone: '',
  address: '',
  assessmentNo: '',
  joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  status: 'Verified Citizen',
};