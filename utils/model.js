const axios = require('axios');

const { login_cookie } = process.env;

//

exports.getRequest = async (url, req) => {
  try {
    const response = await axios({
      method: 'GET',
      url,
      withCredentials: true,
      headers: {
        Cookie: `${login_cookie}=${req.cookies[login_cookie] || ''}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error?.response.data || error;
  }
};

//

exports.postRequest = async (url, body, req) => {
  try {
    const response = await axios({
      method: 'POST',
      url,
      withCredentials: true,
      data: body,
      headers: {
        Cookie: `${login_cookie}=${req.cookies[login_cookie] || ''}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error?.response.data || error;
  }
};

//

exports.patchRequest = async (url, body, req) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url,
      withCredentials: true,
      data: body,
      headers: {
        Cookie: `${login_cookie}=${req.cookies[login_cookie] || ''}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error?.response.data || error;
  }
};

//

exports.deleteRequest = async (url, req) => {
  try {
    const response = await axios({
      method: 'DELETE',
      url,
      withCredentials: true,
      data: body,
      headers: {
        Cookie: `${login_cookie}=${req.cookies[login_cookie] || ''}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error?.response.data || error;
  }
};
