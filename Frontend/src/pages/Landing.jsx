import React from 'react'
import { useEffect } from 'react';
import { useNavigate} from 'react-router-dom';

const Landing = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if(jwt)
        {    
         navigate('/dashboard')
        }
        else{
            navigate('/login')
        }
       }, [])

  return (
    <div>

    </div>
  )
}

export default Landing