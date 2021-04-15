import { Button } from 'antd';
import React from 'react';
import {useState, useEffect} from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import {GlobalContext} from './GlobalContext'

const LoadingPage: React.FC = () => {

  const {
    getImgArr,
    updateImgArr
  } = GlobalContext();
  
  

  return (
        <div>
            The output is: {getImgArr()}
        </div>
  );
};

export default LoadingPage;