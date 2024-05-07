// Using node-fetch to handle HTTP requests
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url; // URL is passed as a query parameter

  if (!url) {
    return {
      statusCode: 400,
      body: 'URL parameter is required.'
    };
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch data', error })
    };
  }
};
