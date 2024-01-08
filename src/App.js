import logo from './logo.svg';
import './App.css';
import Users from './Pages/Users/Users';
import NavbarComponent from './Components/NavbarComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <NavbarComponent/>
      <ToastContainer />
        <Users/>
    </div>
  );
}

export default App;
