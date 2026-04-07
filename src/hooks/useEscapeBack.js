import { useEffect } from 'react';

const isEditableTarget = (target) => {
  if (!target) return false;

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return true;
  if (target.isContentEditable) return true;

  return Boolean(target.closest?.('[data-esc-ignore="true"]'));
};

const useEscapeBack = ({ enabled = true, onEscape, shouldHandle }) => {
  useEffect(() => {
    if (!enabled || typeof onEscape !== 'function') return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.repeat) return;
      if (isEditableTarget(event.target)) return;
      if (shouldHandle && !shouldHandle(event)) return;

      event.preventDefault();
      onEscape(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape, shouldHandle]);
};

export default useEscapeBack;
