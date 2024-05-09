import React, { useEffect } from 'react';

const ClockWidget = () => {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = "https://cdn.logwork.com/widget/text.js";
    script.async = true;

    // Append script to the body
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <a href="https://logwork.com/current-time-in-new-york-united-states" 
         className="clock-widget-text" 
         data-timezone="America/New_York" 
         data-language="en" 
         data-textcolor="#949494" 
         data-background="#000000" 
         data-digitscolor="#ffffff">
        New York, United States, New York
      </a>
    </div>
  );
};

export default ClockWidget;
