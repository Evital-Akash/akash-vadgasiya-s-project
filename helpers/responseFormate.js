const responseFormate = (statuscode, statusMessage, data = {}) => {
  return {
    status_code: statuscode,
    status_message: statusMessage,
    datetime: new Date().toISOString(),
    data,
  };
};

module.exports = responseFormate;
