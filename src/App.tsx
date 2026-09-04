import { useState, useEffect, useCallback } from 'react';
import { GalleryCanvas } from './components/GalleryCanvas';
import { SMapWorksRoot } from './components/smapworks/SMapWorksRoot';

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  const isGallery = currentPath.startsWith('/gallery');

  // Toggle html/body class so CSS can unlock overflow on #root for SMapWorks surface
  useEffect(() => {
    if (isGallery) {
      document.documentElement.classList.remove('smapworks-mode');
      document.body.classList.remove('smapworks-mode');
    } else {
      document.documentElement.classList.add('smapworks-mode');
      document.body.classList.add('smapworks-mode');
    }
    return () => {
      document.documentElement.classList.remove('smapworks-mode');
      document.body.classList.remove('smapworks-mode');
    };
  }, [isGallery]);

  if (isGallery) {
    return <GalleryCanvas />;
  }

  return <SMapWorksRoot onNavigateToGallery={() => navigateTo('/gallery')} />;
}

export default App;
