import axios from 'axios';
export const http = axios.create({ baseURL:'/api', timeout:5000 });
export const mockResolve = async <T>(data:T, delay=120) => new Promise<T>(resolve=>setTimeout(()=>resolve(JSON.parse(JSON.stringify(data))), delay));
