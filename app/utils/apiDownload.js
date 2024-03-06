import fetch from 'isomorphic-fetch';
import { config } from '../../config/app'

export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test') ?
  process.env.BASE_URL || (`http://localhost:${process.env.PORT || config.port}/api`) :
  '/api';

export default function callApiDownlod(endpoint, method = 'get', body) {
  const token = localStorage.getItem('token');    
  return fetch(`${API_URL}/${endpoint}`, {
    headers: { 'content-type': 'application/json', 'Authorization': token },
    method,
    body: JSON.stringify(body),
  })
  .then(function(response){
    
  	return response.blob()
  })
  .catch(error=>{    
    throw error
  });
}
