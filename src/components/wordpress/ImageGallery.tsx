import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import type { ImageRefSchema } from '../../lib/content.types';

export default function ImageGallery({ images, index, onChange, onClose }: {
  images: ImageRefSchema[]; index: number | null; onChange: (index: number) => void; onClose: () => void;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [index]);
  useEffect(() => {
    if (index === null || images.length < 2) return;
    const key = (event: KeyboardEvent) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (step) { event.preventDefault(); onChange((index + step + images.length) % images.length); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [index, images.length, onChange]);
  const image = index === null ? null : images[index] || null;
  const source = image?.fullSrc || image?.src;
  const move = (step: number) => { if (index !== null) onChange((index + step + images.length) % images.length); };
  return <Modal show={image !== null} onHide={onClose} fullscreen restoreFocus aria-label="Project image gallery"
    contentClassName="bg-white text-dark border-0 rounded-0">
    <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-3 p-md-5 overflow-hidden">
      <button type="button" className="btn text-dark bg-transparent border-0 position-absolute top-0 end-0 m-2 z-3" onClick={onClose} aria-label="Close gallery"><i className="bi bi-x-lg" /></button>
      {image && <figure className="d-flex flex-column w-100 h-100 m-0 align-items-center justify-content-center" aria-live="polite">
        <div className="w-100 flex-grow-1 d-flex justify-content-center align-items-center overflow-hidden" style={{ minHeight: 0 }}>
          {failed ? <p role="status">This image could not be loaded.</p> : <img key={source} src={source} alt={image.alt || ''} className="w-100 h-100 object-fit-contain" onError={() => setFailed(true)} />}
        </div>
        {image.description && <figcaption className="text-center small pt-3 px-4 flex-shrink-0 overflow-auto" style={{ maxHeight: '25vh' }}>{image.description}</figcaption>}
      </figure>}
      {images.length > 1 && <>
        <button type="button" className="btn text-dark bg-transparent border-0 position-absolute top-50 start-0 translate-middle-y m-2" onClick={() => move(-1)} aria-label="Previous image"><i className="bi bi-chevron-left fs-3" /></button>
        <button type="button" className="btn text-dark bg-transparent border-0 position-absolute top-50 end-0 translate-middle-y m-2" onClick={() => move(1)} aria-label="Next image"><i className="bi bi-chevron-right fs-3" /></button>
      </>}
    </Modal.Body>
  </Modal>;
}
