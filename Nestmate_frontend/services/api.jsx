import axios from 'axios';

const API_URL = 'http://localhost:8000/api';



export const getVehicleLogs = (page = 1, limit = 20) => {
  return axios.get(`${API_URL}/vehicles/logs?page=${page}&limit=${limit}`);
};

export const addAllowedVehicle = (vehicleData) => {
  return axios.post(`${API_URL}/vehicles/allowed`, vehicleData);
};

export const getAllowedVehicles = () => {
  return axios.get(`${API_URL}/vehicles/allowed`);
};