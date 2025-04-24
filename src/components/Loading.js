import React, { useEffect, useState } from 'react';


const Loading = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Trigger fade-in after mount
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 2500); // Short delay to allow CSS transition

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`loading-screen ${visible ? '' : 'fade-out'}`}>
      
    </div>
  );
};

export default Loading;