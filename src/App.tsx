import { AuthProvider } from './context/AuthContext';
import { SpatialCanvas } from './components/SpatialCanvas';
import { DevAccessBar } from './components/DevAccessBar';

function App() {
  return (
    <AuthProvider>
      <SpatialCanvas />
      {/* DevAccessBar is included for audit purposes, allows toggle of MockAuth roles */}
      <DevAccessBar />
    </AuthProvider>
  );
}

export default App;
