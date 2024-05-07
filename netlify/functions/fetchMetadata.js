const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url;
  console.log("Fetching URL:", url); // Log to see what URL is being requested

  if (!url) {
    return {
      statusCode: 400,
      body: 'URL parameter is required.'
    };
  }

  try {
    const apiURL = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta`;
    console.log("API Request URL:", apiURL); // Log the full API request URL
    const response = await fetch(apiURL);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.data)
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch data', error: error.toString() })
    };
  }
};
