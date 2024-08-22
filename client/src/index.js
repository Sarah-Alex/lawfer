// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// //import App from './App';
// import Login from './Login';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import Home from './Home';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Login />
  
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
// function App() {
//   return (
//     // <Router>
//     //   <Routes>
//     //     <Route path="/" element={<Home/>} />
//     //     <Route path="/login" element={<Login />} />
//     //   </Routes>
//     // </Router>
//     <React.StrictMode>
//       <Login/>
//     </React.StrictMode>
    
//   );
// }

// export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Login';
//import Home from './Home';
import Send from './Send';
import Receive from './Recieve';
import ProtectedRoute from './ProtectedRoute';
import reportWebVitals from './reportWebVitals';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: <Home />,
  // },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/send',
        element: <Send />,
      },
      {
        path: '/receive',
        element: <Receive />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
