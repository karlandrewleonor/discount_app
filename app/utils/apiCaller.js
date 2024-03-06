import fetch from 'isomorphic-fetch';
import { config } from '../../config/app'

export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test') ?
  process.env.BASE_URL || (`http://localhost:${process.env.PORT || config.port}/api`) :
  '/api';

export default function callApi(endpoint, method = 'get', body) {
  const token = localStorage.getItem('token');  
  //console.log(token)
  return fetch(`${API_URL}/${endpoint}`, {
    headers: { 'content-type': 'application/json', 'Authorization': token },
    method,
    body: JSON.stringify(body),
  })
  .then(response => response.json().then(json => ({ json, response })))
  .then(({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }
    return json;
  })
  .catch(error=>{    
    throw error
  });
}
