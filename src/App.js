import "./styles.css";

import React, { useEffect } from "react";

import WithModel from "./temp";


export default function App() {
  
useEffect(()=>{
  window.document.addEventListener("zoom", e => {
    // suppress browsers default zoom-behavior:
    e.preventDefault();
    console.log("zooming")
  
    // execution of my own custom zooming-behavior:
    if (e.deltaY > 0) {
        this._zoom(1);
    } else {
        this._zoom(-1);
    }
  });
},[window])


  return <WithModel />;
}
