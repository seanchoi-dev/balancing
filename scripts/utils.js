/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * The decision engine for where to get Milo's libs from.
 */

export const VERSION = 'Beta v0.932';

export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs) => {
      const { hostname } = window.location;
//       if (!hostname.includes('hlx.page')
//         && !hostname.includes('hlx.live')
//         && !hostname.includes('localhost')) {
//         libs = prodLibs;
//         return libs;
//       }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') return 'http://localhost:6456/libs';
      if (branch.indexOf('--') > -1) return `https://${branch}.hlx.page/libs`;
      return `https://${branch}--milo--adobecom.hlx.live/libs`;
    }, () => libs,
  ];
})();

const getEnv = () => {
  const { host } = window.location;
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