import React from 'react';
import '../styles/Preloader.css'; // Import the CSS file for styles

import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const Preloader = () => {
  return (
    <div className="preloader">
      <div className='coffemug'>
    <DotLottieReact
src="https://lottie.host/a7229df5-e716-40f8-8295-6cda65243cf1/0BDBYmOiMO.lottie"
loop
autoplay/>
</div>
</div>
  );
};

export default Preloader;
