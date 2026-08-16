const formatMonthYear = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const createButtonMarkup = (item) => {
    if (!item.button_url || !item.button_text) {
        return '';
    }

    const buttonMarkup = item.button_color
        ? `<button class="small-round no-margin border"><i>link_2</i><span>${item.button_text}</span></button>`
        : `<button class="border round">${item.button_text}</button>`;

    return `
        <nav>
            <a href="${item.button_url}" target="_blank">
                ${buttonMarkup}
            </a>
        </nav>`;
};

const createLargeArticleMarkup = (item) => {
    const imageMarkup = `<img class="responsive" src="${item.image || ''}" alt="">`;
    const contentMarkup = `
        <div class="padding">
            <div class="grey-text">${formatMonthYear(item.date_published)}</div>
            <h5 class="bold no-margin">${item.title}</h5>
            <p>${item.summary}</p>
            ${createButtonMarkup(item)}
        </div>`;

    return item.left
        ? `
            <div class="grid no-space l">
                <div class="s12 m8">
                    ${contentMarkup}
                </div>
                <div class="s12 m4">
                    ${imageMarkup}
                </div>
            </div>
            <div class="s m">
                ${imageMarkup}
                ${contentMarkup}
            </div>`
        : `
            <div class="grid no-space l">
                <div class="s12 m4">
                    ${imageMarkup}
                </div>
                <div class="s12 m8">
                    ${contentMarkup}
                </div>
            </div>
            <div class="s m">
                ${imageMarkup}
                ${contentMarkup}
            </div>`;
};

const createSmallItemMarkup = (item) => `
    ${item.image ? `<img class="round" src="${item.image}" style="align-self: start;background-color: white;" alt="">` : ''}
    <div class="max wrap">
        <div class="grey-text">${formatMonthYear(item.date_published)}</div>
        <h6 class="small no-padding no-margin small-title">${item.title}</h6>
        <div class="small-summary">${item.summary}</div>
    </div>`;

document.addEventListener('DOMContentLoaded', async () => {
    const mainPage = document.querySelector('.experience');
    if (!mainPage) {
        return;
    }

    const feedUrl = `${window.location.protocol}//${window.location.host}/feed/feed.json`;

    try {
        const res = await fetch(feedUrl);
        const feed = await res.json();

        const container = document.createElement('div');
        const smallList = document.createElement('ul');
        smallList.classList.add('list', 'border', 'medium-padding');

        const sortedItems = [...feed.items].sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

        for (const item of sortedItems) {
            if (item.type === 'large') {
                const article = document.createElement('article');
                article.className = 'no-padding';
                article.innerHTML = createLargeArticleMarkup(item);
                container.appendChild(article);
                continue;
            }

            if (item.type === 'small') {
                const li = document.createElement('li');
                li.onclick = () => window.open(item.button_url, '_blank');
                li.innerHTML = createSmallItemMarkup(item);
                smallList.appendChild(li);
            }
        }

        mainPage.appendChild(container);
        if (smallList.children.length > 0) {
            mainPage.appendChild(smallList);
        }
    } catch (err) {
        console.error('Failed to load experience feed:', err);
    }
});