import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import SignUp from '../../components/SignUp/SignUp';
import Login from '../../components/SignIn/SignIn';
import Home from '../Home/home';
import ForgotPassword from '../Forget_Password/forget_password';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />
      },
      {
        path: 'signup',
        element: <SignUp />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword/>
      }
    ]
  }
]);

export default router;