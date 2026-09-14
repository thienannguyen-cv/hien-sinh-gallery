import { useState, useEffect, useCallback } from 'react';
import { GalleryCanvas } from './components/GalleryCanvas';
import { SMapWorksRoot } from './components/smapworks/SMapWorksRoot';
import { LocalArtistReview } from '@local-artist-review';
import { MaterialsPage } from './components/gallery/MaterialsPage';

declare const __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__: boolean;

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
  const isLocalArtistReview = currentPath === '/operator/three-brushstrokes/review' || currentPath === '/operator/acquisition/rehearsal';

  useEffect(() => {
    document.title = isGallery ? 'Hiện Sinh — SMAPWORKS' : 'SMAPWORKS';
  }, [isGallery]);

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

  if (isLocalArtistReview && import.meta.env.DEV && __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__) {
    return <LocalArtistReview />;
  }
  if (currentPath === '/gallery/materials') return <MaterialsPage />;
  if (isGallery) {
    return <GalleryCanvas />;
  }

  return <SMapWorksRoot onNavigateToGallery={() => navigateTo('/gallery')} />;
}

export default App;
