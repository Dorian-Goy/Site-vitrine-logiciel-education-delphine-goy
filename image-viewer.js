(function () {
    const DURATION = 380;
    const EDGE_PADDING = 24;

    let backdrop = null;
    let closeBtn = null;
    let activeClone = null;
    let activeSource = null;

    function ensureUi() {
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'iv-backdrop';
            document.body.appendChild(backdrop);
        }

        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'iv-close';
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Fermer l\'image');
            closeBtn.textContent = '×';
            document.body.appendChild(closeBtn);
        }

        backdrop.onclick = function (event) {
            if (event.target === backdrop) {
                closeViewer();
            }
        };

        closeBtn.onclick = closeViewer;
    }

    function computeTargetRect(widthRatio, heightRatio) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = viewportWidth - EDGE_PADDING * 2;
        const maxHeight = viewportHeight - EDGE_PADDING * 2;

        const naturalWidth = widthRatio || 1;
        const naturalHeight = heightRatio || 1;
        const ratio = naturalWidth / naturalHeight;

        let width = maxWidth;
        let height = width / ratio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }

        return {
            width,
            height,
            left: (viewportWidth - width) / 2,
            top: (viewportHeight - height) / 2
        };
    }

    function extractFirstUrl(backgroundValue) {
        if (!backgroundValue || backgroundValue === 'none') {
            return null;
        }

        const match = backgroundValue.match(/url\(["']?([^"')]+)["']?\)/i);
        return match ? match[1] : null;
    }

    function buildSourceInfo(sourceEl) {
        if (!sourceEl) {
            return null;
        }

        const rect = sourceEl.getBoundingClientRect();
        const computed = window.getComputedStyle(sourceEl);
        const borderRadius = computed.borderRadius || '10px';

        if (sourceEl.tagName && sourceEl.tagName.toLowerCase() === 'img') {
            return {
                element: sourceEl,
                rect,
                src: sourceEl.currentSrc || sourceEl.src,
                widthRatio: sourceEl.naturalWidth || sourceEl.width || rect.width || 1,
                heightRatio: sourceEl.naturalHeight || sourceEl.height || rect.height || 1,
                borderRadius,
                objectFit: computed.objectFit || 'cover'
            };
        }

        if (sourceEl.classList.contains('reviewer-avatar')) {
            const bgUrl = extractFirstUrl(computed.backgroundImage);
            if (!bgUrl) {
                return null;
            }

            return {
                element: sourceEl,
                rect,
                src: bgUrl,
                widthRatio: rect.width || 1,
                heightRatio: rect.height || 1,
                borderRadius,
                objectFit: 'cover'
            };
        }

        return null;
    }

    function openViewer(sourceEl) {
        if (!sourceEl || activeClone) {
            return;
        }

        ensureUi();

        const sourceInfo = buildSourceInfo(sourceEl);
        if (!sourceInfo || !sourceInfo.src) {
            return;
        }

        const sourceRect = sourceInfo.rect;
        const clone = document.createElement('img');
        clone.src = sourceInfo.src;
        clone.alt = 'Image agrandie';
        clone.classList.add('iv-clone');
        clone.style.objectFit = sourceInfo.objectFit;
        clone.style.top = sourceRect.top + 'px';
        clone.style.left = sourceRect.left + 'px';
        clone.style.width = sourceRect.width + 'px';
        clone.style.height = sourceRect.height + 'px';
        clone.style.borderRadius = sourceInfo.borderRadius;

        activeClone = clone;
        activeSource = sourceInfo.element;

        document.body.appendChild(clone);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
            backdrop.classList.add('iv-open');

            const target = computeTargetRect(sourceInfo.widthRatio, sourceInfo.heightRatio);
            clone.style.top = target.top + 'px';
            clone.style.left = target.left + 'px';
            clone.style.width = target.width + 'px';
            clone.style.height = target.height + 'px';
            clone.style.borderRadius = '12px';
            clone.style.transform = 'translateZ(0)';

            setTimeout(function () {
                closeBtn.classList.add('iv-visible');
            }, 100);
        });
    }

    function closeViewer() {
        if (!activeClone) {
            return;
        }

        closeBtn.classList.remove('iv-visible');
        backdrop.classList.remove('iv-open');

        const clone = activeClone;
        const source = activeSource;

        let targetRect = null;
        if (source && document.body.contains(source)) {
            targetRect = source.getBoundingClientRect();
        }

        requestAnimationFrame(function () {
            if (targetRect) {
                clone.style.top = targetRect.top + 'px';
                clone.style.left = targetRect.left + 'px';
                clone.style.width = targetRect.width + 'px';
                clone.style.height = targetRect.height + 'px';
                clone.style.borderRadius = window.getComputedStyle(source).borderRadius || '10px';
            } else {
                clone.style.opacity = '0';
                clone.style.transform = 'scale(0.97)';
            }
        });

        setTimeout(function () {
            if (clone.parentNode) {
                clone.parentNode.removeChild(clone);
            }
            activeClone = null;
            activeSource = null;
            document.body.style.overflow = '';
        }, DURATION);
    }

    function shouldHandleImage(targetEl) {
        if (!targetEl || targetEl.closest('.iv-clone') || targetEl.closest('.iv-close')) {
            return false;
        }

        if (targetEl.hasAttribute('data-no-viewer')) {
            return false;
        }

        return targetEl.classList.contains('avatar-img') ||
            targetEl.classList.contains('comment-photo') ||
            targetEl.classList.contains('reviewer-avatar');
    }

    function handleDocumentClick(event) {
        const candidate = event.target.closest('img, .reviewer-avatar');
        if (!shouldHandleImage(candidate)) {
            return;
        }

        event.preventDefault();
        openViewer(candidate);
    }

    function initImageViewer() {
        if (!document.body) {
            return;
        }

        if (!window.__imageViewerBound) {
            document.addEventListener('click', handleDocumentClick, true);
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeViewer();
                }
            });
            window.__imageViewerBound = true;
        }

        ensureUi();
    }

    window.initImageViewer = initImageViewer;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageViewer);
    } else {
        initImageViewer();
    }
})();
