import { Navigate } from 'react-router-dom';

import { useAuth } from '../AuthContext';

export default function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  console.log("is: ", isLoggedIn, children)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
