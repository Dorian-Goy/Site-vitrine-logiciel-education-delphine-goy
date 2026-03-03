(function () {
    const data = window.PROFILE_DATA || {};
    const root = document.getElementById('profile-root');

    if (!root) {
        return;
    }

    const name = data.name || 'Profil';
    const meta = data.meta || '';
    const avatarSrc = data.avatarSrc || '../assets/default-profile.svg';
    const avatarAlt = data.avatarAlt || 'Photo de profil';
    const description = data.description || 'Ajoutez ici la description.';
    const information = data.information || 'Ajoutez les informations de base (école, ville, matières, etc.).';
    const location = data.location || 'Non renseignée';
    const activity = data.activity || "Section activité à venir.";

    document.title = 'Profil | ' + name;

    root.innerHTML = `
        <a class="top-link" href="../">← Retour au site</a>

        <section class="card header">
            <div class="avatar-placeholder" aria-label="Photo de profil">
                <img class="avatar-img" src="${avatarSrc}" alt="${avatarAlt}" onerror="this.onerror=null;this.src='../assets/default-profile.svg';">
            </div>
            <div>
                <h1 class="name">${name}</h1>
                <p class="meta">${meta}</p>
            </div>
        </section>

        <section class="card">
            <h2 class="section-title">Description</h2>
            <p class="placeholder">${description}</p>
        </section>

        <section class="card">
            <h2 class="section-title">Informations</h2>
            <p class="placeholder">${information}</p>
        </section>

        <section class="card">
            <h2 class="section-title">Localisation</h2>
            <p class="placeholder">${location}</p>
        </section>

        <section class="card">
            <h2 class="section-title">Activité</h2>
            <p class="placeholder">${activity}</p>
        </section>
    `;

    if (window.initImageViewer) {
        window.initImageViewer();
    } else {
        const viewerScript = document.createElement('script');
        viewerScript.src = '../image-viewer.js';
        viewerScript.onload = function () {
            if (window.initImageViewer) {
                window.initImageViewer();
            }
        };
        document.body.appendChild(viewerScript);
    }
})();
