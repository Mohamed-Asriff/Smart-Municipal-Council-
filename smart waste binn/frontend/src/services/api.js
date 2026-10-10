import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const fetchBins = async () => {
  try {
    const response = await api.get('/bins');
    return response.data;
  } catch (error) {
    console.error('Error fetching bins:', error);
    // Mock data for development when backend is down
    return [
      { id: 'BIN-001', name: 'Kalmunai Bus Stand Bin', zone: 'Town Center', latitude: 7.4130, longitude: 81.8200, latestFillPercentage: 45, distanceCm: 22.0, latestDistanceCm: 22.0, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-002', name: 'Main Street Market Bin', zone: 'Town Center', latitude: 7.4155, longitude: 81.8215, latestFillPercentage: 88, distanceCm: 4.8, latestDistanceCm: 4.8, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-003', name: 'Kalmunai Beach Road Bin', zone: 'Beach Side', latitude: 7.4170, longitude: 81.8310, latestFillPercentage: 65, distanceCm: 14.0, latestDistanceCm: 14.0, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-004', name: 'District Hospital Bin', zone: 'Hospital Area', latitude: 7.4195, longitude: 81.8185, latestFillPercentage: 32, distanceCm: 27.2, latestDistanceCm: 27.2, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-005', name: 'Municipal Council Office Bin', zone: 'Town Center', latitude: 7.4165, longitude: 81.8195, latestFillPercentage: 91, distanceCm: 3.6, latestDistanceCm: 3.6, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-006', name: 'Kalmunai Mosque Road Bin', zone: 'Mosque Area', latitude: 7.4145, longitude: 81.8230, latestFillPercentage: 57, distanceCm: 17.2, latestDistanceCm: 17.2, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-007', name: 'Central College Junction Bin', zone: 'School Zone', latitude: 7.4110, longitude: 81.8175, latestFillPercentage: 73, distanceCm: 10.8, latestDistanceCm: 10.8, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-008', name: 'Fish Market Bin', zone: 'Beach Side', latitude: 7.4200, longitude: 81.8295, latestFillPercentage: 15, distanceCm: 34.0, latestDistanceCm: 34.0, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-009', name: 'Kalmunai Railway Station Bin', zone: 'Station Area', latitude: 7.4085, longitude: 81.8160, latestFillPercentage: 82, distanceCm: 7.2, latestDistanceCm: 7.2, status: 'ACTIVE', lastUpdated: new Date().toISOString() },
      { id: 'BIN-010', name: 'Periyaneelavanai Junction Bin', zone: 'North Zone', latitude: 7.4250, longitude: 81.8210, latestFillPercentage: 44, distanceCm: 22.4, latestDistanceCm: 22.4, status: 'ACTIVE', lastUpdated: new Date().toISOString() }
    ];
  }
};

export const fetchBinById = async (id) => {
  const response = await api.get(`/bins/${id}`);
  return response.data;
};

export const fetchBinHistory = async (id, hours = 24) => {
  try {
    const response = await api.get(`/bins/${id}/history`, { params: { hours } });
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    // Mock history
    const history = [];
    let currentFill = Math.random() * 100;
    for(let i=hours; i>=0; i--) {
      history.push({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        fillPercentage: Math.max(0, Math.min(100, currentFill + (Math.random() * 20 - 10)))
      });
    }
    return history;
  }
};

export const fetchDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalBins: 10,
      activeBins: 10,
      criticalBins: 2,
      warningBins: 2,
      averageFillPercentage: 55.2,
      totalReadingsToday: 342
    };
  }
};

export const sendBinData = async (data) => {
  const response = await api.post('/bins/data', data);
  return response.data;
};

export const createBin = async (binData) => {
  const response = await api.post('/bins', binData);
  return response.data;
};

export const deleteBin = async (id) => {
  const response = await api.delete(`/bins/${id}`);
  return response.data;
};
