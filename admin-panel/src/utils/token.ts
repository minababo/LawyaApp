export const saveToken = (token: string) => {
    localStorage.setItem('adminToken', token);
  };
  
  export const getToken = () => {
    return localStorage.getItem('adminToken');
  };
  
  export const clearToken = () => {
    localStorage.removeItem('adminToken');
  };  