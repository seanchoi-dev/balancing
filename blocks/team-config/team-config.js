import { getRiotAPIKey, capitalize, getVersion, roman2arabic, getLibs } from '../../scripts/utils.js';

let API_KEY = '';

class Player {
    constructor(name, position, level, tierText, btnHref) {
        this.name = name;
        this.position = position;
        this.level = level;
        this.tierText = tierText;
        this.btnHref = btnHref;
        this.cached = false;
    }    
}

const defaultLevelMap = {
    B : 1,
    S : 3,
    SG : 4,
    G : 5,
    GP : 6,
    P : 7,
    PE: 8,
    E: 9,
    ED : 10,
    D : 11,
    DM : 12,
    M : 13,
    GM : 15,
    C : 17,
};

const defaultState = {
    players: [],
    balancedBy: 'tier',
    numOfPlayers: 10,
    levelConfig: defaultLevelMap,
    region: 'NA1',
}

let state = defaultState;

const setTierCache = (input, tier) => {
    let tiers = {}
    if(window.localStorage.tiers) {
        tiers = JSON.parse(window.localStorage.tiers);
    }
    const _time_now_ = Date.now();
    tiers[input.trim().toLowerCase()] = { tier: tier, recorded: _time_now_ };
    window.localStorage.tiers = JSON.stringify(tiers);
}

const getTierFromCache = (input) => {
    if (window.localStorage.tiers) {
        input = input.trim().toLowerCase();
        const tiers = JSON.parse(window.localStorage.tiers);
        if(Date.now() - tiers[input]?.recorded < 86400000) {
            return tiers[input].tier;
        }
    }
    return false;
}

const saveState = () => {
    state.players = [];
    document.querySelectorAll('.participant-div').forEach(p => {
        const name = p.querySelector('.input-participants').value;
        const tierText = p.querySelector('.tier-text').textContent;
        const btnHref = p.querySelector('.tier-wrapper .btn').href;
        const positions = [];
        setTierCache(name, tierText ?? 'Not Found');
        p.querySelectorAll('.position-item:checked').forEach(i => positions.push(i.dataset.position));
        state.players.push(new Player(name, positions, parseInt(p.querySelector('.level-input:checked').value), tierText, btnHref));
    });
    window.localStorage.state = JSON.stringify(state);
}

const getNewParticipant = (index, player) => {
    let levelEls = '';
    Object.keys(state.levelConfig).forEach(k => {
        const levelValue = state.levelConfig[k];
        levelEls += `
        <div class="col-auto px-0">
        <label for="mix_players_${index}_level_${k}" class="${player.level === levelValue ? 'active' : ''}">${k}</label>
        <input type="radio" id="mix_players_${index}_level_${k}" class="level-input level-input-${k} d-none" name="mix.players.${index}.level" required="required" value="${levelValue}" ${player.level === levelValue ? 'checked' : ''}>
        </div>`
    });
    return `
<div id="mix_players__${index}" class="participant-div ${player.cached ? 'cached' : ''} participant-div-form row mb-4 mb-xl-2">
    <div class="col-12 col-xl-3 d-flex align-items-center mb-2 mb-xl-0">
        <div class="input-group">
            <input type="text" id="mix_players_${index}_name" name="mix.players.${index}.name" class="form-control input-participants ${player.name ? '' : 'no-value'}" placeholder="Player ${index+1}" value="${player.name}" required>
        </div>
        <div class="tier-wrapper">
            <a class="btn btn-secondary px-1 ms-1 ${!player.tierText || player.tierText === 'Not Found' ? 'disabled' : ''}" target="_blank" href="${player.btnHref || '#'}"><small class="tier-text">${player.tierText || 'Not Found'}</small></a>
        </div>
    </div>
    <div class="col-12 col-xl-3 positions mb-2 mb-xl-0">
        <div id="mix_players_${index}_position" class="d-flex align-items-end justify-content-xl-center">
            <label for="position_all_${index}" id="label_position_all_${index}" class="mx-1 label-position label-position-all ${player.position.includes('all') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.all" type="checkbox" class="position-item d-none" data-index="${index}" data-position="all" id="position_all_${index}" ${player.position.includes('all') ? 'checked' : ''}>
            <label for="position_top_${index}" id="label_position_top_${index}" class="mx-1 label-position label-position-top ${player.position.includes('top') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.top" type="checkbox" class="position-item d-none" data-index="${index}" data-position="top" id="position_top_${index}" ${player.position.includes('top') ? 'checked' : ''}>
            <label for="position_jungle_${index}" id="label_position_jungle_${index}" class="mx-1 label-position label-position-jungle ${player.position.includes('jungle') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.jungle" type="checkbox" class="position-item d-none" data-index="${index}" data-position="jungle" id="position_jungle_${index}" ${player.position.includes('jungle') ? 'checked' : ''}>
            <label for="position_mid_${index}" id="label_position_mid_${index}" class="mx-1 label-position label-position-mid ${player.position.includes('mid') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.mid" type="checkbox" class="position-item d-none" data-index="${index}" data-position="mid" id="position_mid_${index}" ${player.position.includes('mid') ? 'checked' : ''}>
            <label for="position_adc_${index}" id="label_position_adc_${index}" class="mx-1 label-position label-position-adc ${player.position.includes('adc') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.adc" type="checkbox" class="position-item d-none" data-index="${index}" data-position="adc" id="position_adc_${index}" ${player.position.includes('adc') ? 'checked' : ''}>
            <label for="position_support_${index}" id="label_position_support_${index}" class="mx-1 label-position label-position-support ${player.position.includes('support') ? 'active' : ''}"></label>
            <input name="mix.players.${index}.position.support" type="checkbox" class="position-item d-none" data-index="${index}" data-position="support" id="position_support_${index}" ${player.position.includes('support') ? 'checked' : ''}>
        </div>
    </div>
    <div class="col-12 col-xl-6 mb-2 mb-xl-0">
        <div id="mix_players_${index}_level" class="level-participant row mx-0 gap-2">
            ${levelEls}
        </div>
    </div>
</div>`;
}
const levelConfig = () => {
    const levelConfigEl = document.querySelector('.level-config');
    Object.keys(state.levelConfig).forEach(k => {
        const configItem = document.createElement('div');
        configItem.classList.add('d-flex', 'flex-column', 'align-items-center', 'col-auto', 'px-0');
        configItem.dataset.tier = k;
        
        const inputId = `level_config_${k}`;
        
        const label = document.createElement('label');
        label.innerHTML = k;
        label.setAttribute('for', inputId);
        
        const input = document.createElement('input');
        input.id = inputId;
        input.classList.add('border-0');
        input.value = state.levelConfig[k];
        input.addEventListener('change', () => {
            state.levelConfig[k] = parseInt(input.value);
            document.querySelectorAll(`.level-input-${k}`).forEach(levelInput => levelInput.value = input.value);
            saveState();
        });

        configItem.append(label);
        configItem.append(input);
        levelConfigEl.append(configItem);
    });
};

const addPlayer = (index, player) => {
    const players = document.getElementById('mix_players');
    const div = document.createElement('div');
    const p = player || new Player('', ['all'], 1, 'Not Found', '#');
    div.innerHTML = getNewParticipant(index, p);
    players.append(div);
    div.querySelectorAll('.position-item').forEach(input => input.addEventListener('change', () => {
        const playerPositionEl = document.getElementById(`mix_players_${index}_position`);
        const label = document.getElementById(`label_position_${input.dataset.position}_${index}`);
        const labelAll = playerPositionEl.querySelector('label');
        const inputAll = playerPositionEl.querySelector('input');
        labelAll.classList.remove('active');
        inputAll.checked = false;
        if (input === inputAll) {
            playerPositionEl.querySelectorAll('label').forEach(l => l.classList.remove('active'));
            playerPositionEl.querySelectorAll('input').forEach(i => i.checked = false);
            inputAll.checked = true;
        }
        label.classList.toggle('active');
        saveState();
    }));
    div.querySelectorAll('.input-participants').forEach(i => i.addEventListener('change', () => {
        const playerEl = i.closest('.participant-div');
        playerEl.classList.remove('cached');
        saveState();
        i.classList.add('no-value');
        if (i.value) i.classList.remove('no-value');
        setTierByInputChange([i], i)}
        ));
    div.querySelectorAll('.level-input').forEach(i => {
        i.addEventListener('change', e => {
            div.querySelectorAll('.level-input').forEach(ii => {
                ii.previousElementSibling.classList.remove('active');
                if (ii.checked) ii.previousElementSibling.classList.add('active');
            });
            saveState();
        });
    });
};

const removePlayer = (index) => {
    const p = document.getElementById(`mix_players__${index}`);
    p.parentElement.remove();
    state.players.splice(index, 1);
}

const regionSelectEvent = () => {
    const regionSelect = document.getElementById('region');
    regionSelect.value = state.region || 'NA1';
    regionSelect.addEventListener('change', (e) => {
        state.region = regionSelect.value; 
        saveState();
    });
}

const numParticipantsEvent = () => {
    const participantsSelect = document.getElementById('nb-participants');
    participantsSelect.value = state.numOfPlayers || 10;
    participantsSelect.addEventListener('change', (e) => {     
        const currentPlayers = document.querySelectorAll('.participant-div');
        if (currentPlayers.length < participantsSelect.value) {
            for (let i=currentPlayers.length; i<participantsSelect.value; i++) {
                addPlayer(i);
            }
        } else {
            for (let i=currentPlayers.length-1; i>=participantsSelect.value; i--) {
                removePlayer(i);
            }
        }
        state.numOfPlayers = participantsSelect.value;
        saveState();
    });
}

const getSimpleTierText = (tier, rank) => {
    if (tier.toLowerCase().includes('grand')) return 'GM';
    if (tier.toLowerCase().includes('chal')) return 'C';
    return `${tier[0]}${rank}`;
};

export const opggRegion = (stateRegion) => {
    const opggRegionMatch = {
        'NA1': 'na',
    }
    return opggRegionMatch[stateRegion] ?? stateRegion;
}

const updateTiersbyRiotAPI = async (accountAPIPromises, targetInput) => {
    const accountAPIPromisesRes = await Promise.all(accountAPIPromises);
    const accountAPIPromisesResJson = await Promise.all(accountAPIPromisesRes.map(r => r.json()));
    if (accountAPIPromisesResJson[0]?.status) {
        const playerEl = targetInput.closest('.participant-div');
        const btn = playerEl.querySelector('.tier-wrapper a');
        const tierEl = playerEl.querySelector('.tier-text');
        tierEl.innerHTML = 'Not Found';
        btn.href = '#';
        btn.classList.add('disabled');
        return;
    }
    const summonerAPIPromisesRes = await Promise.all(accountAPIPromisesResJson.map(j => fetch(`https://${state.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${j.puuid}?api_key=${API_KEY}`)));
    const summonerAPIPromisesResJson = await Promise.all(summonerAPIPromisesRes.map(r => r.json()));
    const leagueBySumAPIPromisesRes = await Promise.all(summonerAPIPromisesResJson.map(j => fetch(`https://${state.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${j.id}?api_key=${API_KEY}`)));
    const leagueBySumAPIPromisesResJson = await Promise.all(leagueBySumAPIPromisesRes.map(r => r.json()));
    const updateTier = (inputEl, index) => {
        const playerEl = inputEl.closest('.participant-div');
        const btn = playerEl.querySelector('.tier-wrapper a');
        const tierEl = playerEl.querySelector('.tier-text');
        let soloRank = 'UR';
        let flexRank = 'UR';
        leagueBySumAPIPromisesResJson[index]?.forEach(league => {
            if (league.queueType.includes('SOLO')) soloRank = getSimpleTierText(league.tier, league.rank);
            if (league.queueType.includes('FLEX')) flexRank = getSimpleTierText(league.tier, league.rank);
        });
        tierEl.innerHTML = `${soloRank} | ${flexRank}`;
        btn.href = `https://www.op.gg/summoners/${opggRegion(state.region)}/${accountAPIPromisesResJson[index].gameName}-${accountAPIPromisesResJson[index].tagLine}`;
        btn.classList.remove('disabled');
    }
    if (targetInput === 'all') {
        document.querySelectorAll('.input-participants:not(.no-value)').forEach((inputEl, index) => {
            updateTier(inputEl, index);
        });
    } else {
        updateTier(targetInput, 0);
    }
    saveState();
}

const setTierByInputChange = async (inputEls = [], targetInput = 'all') => {
    const accountAPIPromises = [];
    inputEls.forEach(inputEl => {
        const playerEl = inputEl.closest('.participant-div');
        if (playerEl.classList.contains('cached')) return;
        const inputValue = inputEl.value.split('#');
        const gameName = inputValue[0].trim();
        const tagLine = inputValue[1]?.trim();
        if (!tagLine) {
            const btn = playerEl.querySelector('.tier-wrapper a');
            const tierEl = playerEl.querySelector('.tier-text');
            btn.href = '#';
            btn.classList.add('disabled');
            tierEl.innerHTML = 'Not Found';
            return;
        }
        accountAPIPromises.push(fetch(`https://lolbalance-api.newnesid.workers.dev/api/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`));
    });
    if (accountAPIPromises.length) updateTiersbyRiotAPI(accountAPIPromises, targetInput);
};

const clearAll = () => {
    document.getElementById('mix_players').innerHTML = '';
    document.querySelector('.level-config').innerHTML = '';
    document.getElementById('nb-participants').value = 10;
    state = defaultState;
    saveState();
    window.localStorage.removeItem('tiers');
    initTeam();
};

const utf8ToB64 = (str) => window.btoa(unescape(encodeURIComponent(str)));
const b64ToUtf8 = (str) => decodeURIComponent(escape(window.atob(str)));
const parseEncodedState = (encodedState) => {
    try {
      return JSON.parse(b64ToUtf8(decodeURIComponent(encodedState)));
    } catch (e) {
      console.error(e);
    }
    return null;
}
const getUrl = (state) => {
    const url = window.location.href.split('#')[0];
    return `${url}#${utf8ToB64(JSON.stringify(state))}`;
};

const copyState = async () => {
    try {
        const blob = new Blob([getUrl(state)], { type: 'text/plain' });
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
        alert('Share URL is copied to clipboard.');
    } catch (err) {
        console.error(err.name, err.message);
    }
    return false;
}

const importBtnEvent = () => {
    const importBtn = document.getElementById('import-p-button');
    importBtn.addEventListener('click', () => {
        const pList = document.getElementById('import-participant-list').value.split(/\n/);
        const pArray = [];
        let nameInputEl;
        pList.forEach(value => {
            if (!value) return;
            if (value.includes('joined the') || value.includes('님이 로비에 참가')) {
                if (value.includes('joined the')) {
                    pArray.push(value.split(' joined the')[0]);
                } else {
                    pArray.push(value.split(' 님이 로비에 참가')[0]);
                }
            } else if (value.includes('left the') || value.includes('님이 로비를 떠났')) { //Remove if player left lobby
                for (let j=0; j < pArray.length; j++){
                    if(pArray[j] == value.split(' 님이 로비를 떠났')[0] || pArray[j] == value.split(' left the')[0]) {
                        pArray.splice(j, 1);
                    }
                }
            }
        });
        const nameInputEls = []
        for (let i = 0; i < pArray.length && i < state.numOfPlayers; i++) {
            nameInputEl = document.getElementById(`mix_players_${i}_name`);
            nameInputEl.value = pArray[i];
            nameInputEl.classList.remove('no-value');
            nameInputEls.push(nameInputEl);
        }
        setTierByInputChange(nameInputEls);
        saveState();
        if (pArray.length > 0) {
            document.querySelector('a.import-icon').click();
        }
    });
};

const initTeam = () => {
    const { hash } = window.location;
    if (hash && hash.length > 20) {
        window.location.hash = '';
        const encodedState = hash.startsWith('#') ? hash.substring(1) : hash;
        state = parseEncodedState(encodedState);
    }
    else if (window.localStorage.state) {
        state = JSON.parse(window.localStorage.state);
        if (!state.levelConfig) {
            state.levelConfig = defaultLevelMap;
        }
        else if(!state.levelConfig.E) {
            state.levelConfig = defaultLevelMap;
        }
    }
    const players = state.players;
    if (players.length) {
        players.forEach((p, i) => {
            p.tierText = getTierFromCache(p.name);
            p.cached = true;
            if (!p.tierText || p.tierText === 'Not Found') p.cached = false;
            addPlayer(i, p)
        });
    } else {
        for (let i=0; i<state.numOfPlayers; i++) {
            addPlayer(i);
        }
    }
    importBtnEvent();
    regionSelectEvent();
    numParticipantsEvent();
    levelConfig();
    document.querySelector('.trash-icon').addEventListener('click', e => clearAll());
    setTierByInputChange(document.querySelectorAll('.input-participants'));
    // document.getElementById('shareLink').addEventListener('click', () => copyState());

    document.getElementById('bgmSelect')?.addEventListener('change', e => {
        const audio = document.querySelector('.audio-player audio');
        audio.querySelector('source').src = e.target.value;
        audio.load();
        audio.play();
    });
};

export default async function init (block) {
    const teamConfigBody = block.querySelector('code');
    const { loadScript, loadStyle, decorateAutoBlock } = await import(`${getLibs()}/utils/utils.js`);
    loadStyle('/deps/bootstrap.min.css');
    loadStyle('/deps/font-awesome.min.css');
    API_KEY = await getRiotAPIKey();
    const configBody = document.createElement('div');
    configBody.innerHTML = teamConfigBody?.textContent;
    configBody.querySelector('#version').textContent = await getVersion();
    block.prepend(configBody);
    initTeam();
    // document.querySelector('audio').volume = 0.25;
    decorateAutoBlock(document.getElementById('releasenote'));
    loadScript('/deps/bootstrap.bundle.min.js');    
}
