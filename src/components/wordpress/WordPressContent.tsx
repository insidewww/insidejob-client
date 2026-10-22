import parse from 'html-react-parser';
import { useMemo, useState } from 'react';
import { imageFromElement } from '../../lib/wordpress';
import ImageGallery from './ImageGallery';

export default function WordPressContent({ html, gallery = false, inline = false, className = '' }: { html: string; gallery?: boolean; inline?: boolean; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const content = useMemo(() => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style').forEach(el => el.remove());
    doc.querySelectorAll<HTMLElement>('*').forEach(el => {
      for (const key of ['font', 'font-size', 'font-family', 'line-height']) el.style.removeProperty(key);
      Array.from(el.classList).filter(name => /^has-.*-font-size$/.test(name)).forEach(name => el.classList.remove(name));
    });
    const images = Array.from(doc.querySelectorAll('img')).map((img, i) => {
      const image = imageFromElement(img);
      img.classList.add('img-fluid', 'w-100'); img.loading = 'lazy';
      if (gallery) {
        if (img.parentElement?.tagName === 'A') img.parentElement.replaceWith(img);
        const button = doc.createElement('button');
        button.type = 'button'; button.className = 'btn p-0 border-0 rounded-0 d-block w-100';
        button.dataset.galleryIndex = String(i); button.setAttribute('aria-label', `Open image ${i + 1} in gallery`);
        img.replaceWith(button); button.append(img);
      }
      return image;
    });
    doc.querySelectorAll('iframe').forEach(iframe => {
      let host = ''; try { host = new URL(iframe.src).hostname; } catch { iframe.remove(); return; }
      if (!/^(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com)$/.test(host)) { iframe.remove(); return; }
      iframe.title ||= 'Embedded video'; iframe.loading = 'lazy'; iframe.allowFullscreen = true;
      const wrapper = doc.createElement('div'); wrapper.className = 'ratio ratio-16x9';
      iframe.replaceWith(wrapper); wrapper.append(iframe);
    });
    return { html: doc.body.innerHTML, images };
  }, [html, gallery]);
  if (inline) return <span className={`wp-content ${className}`}>{parse(content.html)}</span>;
  return <div className={`wp-content ${className}`} onClick={event => {
    if (!gallery || !(event.target instanceof HTMLElement)) return;
    const button = event.target.closest<HTMLButtonElement>('button[data-gallery-index]');
    if (button) setIndex(Number(button.dataset.galleryIndex));
  }}>
    {parse(content.html)}
    {gallery && <ImageGallery images={content.images} index={index} onChange={setIndex} onClose={() => setIndex(null)} />}
  </div>;
}
