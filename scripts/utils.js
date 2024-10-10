export const getVersion = async () => {
  const resp = await fetch('/fragments/release-note.plain.html');
  if (resp.ok) {
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstP = doc.querySelector('p');
    return `v${firstP.textContent.split(' ')[0]}`;
  }
  return '';
}

const getEnv = () => {
  const { host, search} = window.location;
  const params = new URLSearchParams(search);
  if (params.get('env')) {
    return params.get('env');
  }
  if (host.includes('localhost')) {
    return 'dev';
  } else if (host.includes('hlx.page')) {
    return 'page';
  }
  else if (host.includes('hlx.live')) {
    return 'live';
  }
  return 'prod';
};

export const getRiotAPIKey = async () => {
    const res = await fetch('/api-keys.json');
    const json = await res.json();
    let keyLookUpBy = 'riot-dev';
    if (getEnv() === 'prod') {
      keyLookUpBy = 'riot-prod';
    }
    let riotKey = '';
    json.data.forEach(d => {
      if (keyLookUpBy === d.key) {
        riotKey = d.value;
      }
    });

    return riotKey;
}

export const capitalize = ([firstLetter, ...restOfWord]) => firstLetter.toUpperCase() + restOfWord.join("");

export const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
}

export const roman2arabic = s => {
  if(!s) {
    return '';
  }
  const map = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000};
  return [...s].reduce((r,c,i,s) => map[s[i+1]] > map[c] ? r-map[c] : r+map[c], 0);
};

export function createTag(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}
