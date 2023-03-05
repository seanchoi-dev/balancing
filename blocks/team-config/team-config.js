import { getRiotAPIKey, capitalize } from '/scripts/utils.js';

let API_KEY = '';

class Player {
    constructor(name, position, level) {
        this.name = name;
        this.position = position;
        this.level = level;
    }    
}

const defaultLevelMap = {
    I : 0,
    B : 1,
    BS : 2,
    S : 3,
    SG : 4,
    G : 5,
    GP : 6,
    P : 7,
    PD : 8,
    D : 9,
    DM : 10,
    M : 11,
    GM : 12,
    C : 13,
};

let state = {
    players: [],
    balancedBy: 'tier',
    numOfPlayers: 10,
    levelConfig: defaultLevelMap,
};

const getNewParticipant = (index, player) => {
    let levelEls = '';
    Object.keys(state.levelConfig).forEach(k => {
        const levelValue = state.levelConfig[k];
        levelEls += `
        <label for="mix_players_${index}_level_${k}" class="${player.level === levelValue ? 'active' : ''}">${k}</label>
        <input type="radio" id="mix_players_${index}_level_${k}" class="level-input level-input-${k} d-none" name="mix.players.${index}.level" required="required" value="${levelValue}" ${player.level === levelValue ? 'checked' : ''}>
        `
    });
    return `
<div id="mix_players__${index}" class="participant-div participant-div-form row mb-2">
    <div class="col-md-3 d-flex align-items-center">
        <div class="input-group">
            <input type="text" id="mix_players_${index}_name" name="mix.players.${index}.name" class="form-control input-participants" placeholder="Player ${index+1}" value="${player.name}" required>
        </div>
        <div class="tier-wrapper">
            <a class="btn btn-secondary px-1 ms-1 disabled" target="_blank" href="#"><small class="tier-text">Unranked</small></a>
        </div>
    </div>
    <div class="col-md-3 positions">
        <div id="mix_players_${index}_position" class="d-flex align-items-end justify-content-center">
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
    <div class="col-md-6">
        <div id="mix_players_${index}_level" class="level-participant d-flex gap-2">
            ${levelEls}
        </div>
    </div>
</div>`;
}
const levelConfig = () => {
    const levelConfigEl = document.querySelector('.level-config');
    Object.keys(state.levelConfig).forEach(k => {
        const configItem = document.createElement('div');
        configItem.classList.add('d-flex', 'flex-column', 'align-items-center');
        
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
    const p = player || new Player('', ['all'], 0);
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
        saveState();
        setTierByInputChange(i);
    }));
    div.querySelectorAll('.level-input').forEach(i => {
        i.addEventListener('change', e => {
            div.querySelectorAll('.level-input').forEach(ii => {
                ii.previousElementSibling.classList.remove('active');
                if (ii.checked) {
                    ii.previousElementSibling.classList.add('active');
                }
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

const saveState = () => {
    state.players = [];
    document.querySelectorAll('.participant-div').forEach(p => {
        const name = p.querySelector('.input-participants').value;
        const positions = [];
        p.querySelectorAll('.position-item:checked').forEach(i => positions.push(i.dataset.position));
        state.players.push(new Player(name, positions, parseInt(p.querySelector('.level-input:checked').value)));
    });
    window.localStorage.state = JSON.stringify(state);
}

const submitted = () => {
    let isValid = true;
    const errMsg = document.querySelector('.error-msg');
    document.querySelectorAll('.input-error').forEach(i => i.classList.remove('.input-error'));
    document.querySelectorAll('.participant-div').forEach(p => {
        const name = p.querySelector('input[type=text]');
        if(!name.value) {
            name.classList.add('input-error');
            errMsg.style.display = 'block';
            isValid = false;
            return false;   
        }
    });
    if (isValid) {
        window.open('./team-match-results.html', '_blank');
        // window.location = './team-match-results.html'
    };
    
    return false;
}

const getTierFromOpgg = async (name) => {
    const url = `https://www.op.gg/summoners/na/${name}`;
    const res = await fetch(url);
    const text = await res.text();
    const template = document.createElement('template');
    template.innerHTML = text;
    const tier = template.content.querySelector('.tier')?.textContent || false;
    return tier;
}

const setTierCache = (name, tier) => {
    let tiers = {}
    if(window.localStorage.tiers) {
        tiers = JSON.parse(window.localStorage.tiers);
    }
    const _time_now_ = Date.now();
    tiers[name.trim().toLowerCase()] = { tier: tier, recorded: _time_now_ };
    window.localStorage.tiers = JSON.stringify(tiers);
}

const getTierFromCache = (name) => {
    if (window.localStorage.tiers) {
        name = name.trim().toLowerCase();
        const tiers = JSON.parse(window.localStorage.tiers);
        if(Date.now() - tiers[name]?.recorded < 86400000) {
            return tiers[name].tier;
        }
    }
    return false;
}

const setTierByInputChange = async (inputEl) => {
    const name = inputEl.value;
    const playerEl = inputEl.closest('.participant-div');
    const btn = playerEl.querySelector('.tier-wrapper a'); 
    const tierEl = playerEl.querySelector('.tier-text');
    let tierStr = 'Unranked';
    if (!name) {
        tierEl.innerHTML = tierStr;
        btn.classList.add('disabled');
        return;
    }

    if (getTierFromCache(name)) {
        btn.href = `https://www.op.gg/summoners/na/${name}`;
        btn.classList.remove('disabled');
        tierEl.innerHTML = getTierFromCache(name);
        return;
    }

    const setOpgg = async () => {
        // tierStr = await getTierFromOpgg(name);
        // if (tierStr) {
            // btn.href = `https://www.op.gg/summoners/na/${name}`;
            // btn.classList.remove('disabled');
            // tierEl.innerHTML = 'OP.GG';
            // return;
        // }
    };

    try {
        const summAPI = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${API_KEY}`;
        const summRes = await fetch(summAPI);
        if(!summRes.ok) {
            tierEl.innerHTML = tierStr;
            btn.classList.add('disabled');
            return;
        };
        const summJson = await summRes.json();
        const summId = summJson.id
        const leagueAPI = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summId}?api_key=${API_KEY}`;
        const leagueRes = await fetch(leagueAPI);      
        const leagueJson = await leagueRes.json();
        leagueJson?.forEach(l => {
            if (l.queueType.toLowerCase().includes('solo')) {
                tierStr = `${l.tier.toLowerCase()} ${l.rank}`;
            }
        });
        btn.href = `https://www.op.gg/summoners/na/${name}`;
        btn.classList.remove('disabled');
        setTierCache(name, capitalize(tierStr));
    } catch(err) {
        console.error('Failed to load Riot API', err);
        tierEl.innerHTML = tierStr;
        btn.classList.add('disabled');
    }
    tierEl.innerHTML = capitalize(tierStr);
}

const clearAll = () => {
    document.getElementById('mix_players').innerHTML = '';
    document.querySelector('.level-config').innerHTML = '';
    document.getElementById('nb-participants').value = 10;
    state = {
        players: [],
        balancedBy: 'tier',
        numOfPlayers: 10,
        levelConfig: defaultLevelMap,
    };
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

const initTeam = () => {
    const { hash } = window.location;
    if (hash && hash.length > 10) {
        window.location.hash = '';
        const encodedState = hash.startsWith('#') ? hash.substring(1) : hash;
        state = parseEncodedState(encodedState);
    }
    else if (window.localStorage.state) {
        state = JSON.parse(window.localStorage.state);
        if (!state.levelConfig) {
            state.levelConfig = defaultLevelMap;
        }
    }
    const players = state.players;
    if (players.length) {
        players.forEach((p, i) => addPlayer(i, p));
    } else {
        for (let i=0; i<state.numOfPlayers; i++) {
            addPlayer(i);
        }
    }
    importBtnEvent();
    numParticipantsEvent();
    levelConfig();
    document.querySelector('.trash-icon').addEventListener('click', e => clearAll());
    document.querySelectorAll('.input-participants').forEach(i => setTierByInputChange(i));
    document.getElementById('shareLink').addEventListener('click', () => copyState());

    document.getElementById('bgmSelect').addEventListener('change', e => {
        const audio = document.querySelector('.audio-player audio');
        audio.querySelector('source').src = e.target.value;
        audio.load();
        audio.play();
    });
};


const teamConfigBody = `
<div class="container">
    <div class="title py-5 text-center text-white"><h1>League of Legend Team Balancing Tool</h1></div>
    <form id="mix_form" name="mix" autocomplete="on" onsubmit="return submitted()">
        <div class="bg-dark-grey-opacity">
            <div class="container">
                <div class="d-flex py-2 justify-content-between">
                    <div class="socials d-flex gap-2">
                        <div class="social-item">
                            <a target="_blank" href="https://discordapp.com/users/390692791241408514"><img class="social-icon" src="../lib/images/discord-icon.svg" alt="discord"></a>
                        </div>
                        <div class="social-item d-flex">
                            <a target="_blank" href="https://github.com/seanchoi-dev/seanchoi-dev.github.io"><img class="social-icon" src="../lib/images/github-icon.png" alt="discord"></a>
                        </div>
                    </div>
                    <div class="text-white d-flex align-items-center gap-2">
                        <h5 class="my-1 text-end">v0.93</h5>
                        <a class="link-light" href="#">Release note</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-grey-opacity">
            <div class="container pb-5 position-relative">
                <div class="general-config row align-items-center py-3 mb-3 border-bottom border-dark">
                    <div class="form-group col-6 d-flex gap-3 align-items-center">
                        <select class="head-select px-2" id="nb-participants" control-id="ControlID-3">
                            <option value="6">6</option>
                            <option value="8">8</option>
                            <option value="10" selected>10</option>
                        </select>
                        <label for="nb-participants" class="head-label ps-2">Participants</label>
                        <a class="import-icon toggle-it" data-bs-toggle="collapse" href="#import-participant" role="button" aria-expanded="false" aria-controls="import-participant">
                            <span><i class="fa fa-clipboard"></i></span>
                        </a>
                        <a class="trash-icon px-2 toggle-it" title="Clear all participants">
                            <span><i class="fa fa-trash"></i></span>
                        </a>
                        <div id="shareLink" class="share-link btn btn-success">Share</div>
                    </div>
                    <div class="level-config col-6 d-flex gap-2"></div>
                </div>
                <div id="import-participant" class="form-group collapse">
                    <label for="import-participant-list">Copy and paste a list of participants. One participant per line.</label>
                    <textarea id="import-participant-list" class="form-control textarea-import" rows="10" placeholder="218 님이 로비에 참가하셨습니다.
YooN2 님이 로비에 참가하셨습니다.
Mr Winner 님이 로비에 참가하셨습니다.
Mr PowerBall 님이 로비에 참가하셨습니다.
jiwonnim 님이 로비에 참가하셨습니다.
NongDamGom joined the lobby
KG SwitBread joined the lobby
Sero joined the lobby
Elo joined the lobby
Youngjin joined the lobby"></textarea>
                    <a id="import-p-button" class="btn btn-secondary mt-2 mb-4">Import Participants</a>
                </div>
                <div id="mix_players"></div>
                <div
                    class="padding-top ad-div">
                    <!-- leaderboard-bottom -->
                    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7854142479910574" data-ad-slot="1275355822" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
                <div class="error-msg text-danger" style="display: none;">Fill out player's <strong>Name</strong>.</div>                      
            </div>
        </div>
    </form>
    <div class="audio-player">
        <div class="px-3 pt-3"><small>
            <select name="bgm" id="bgmSelect" class="bgm-select">
                <option value="https://seanchoi-dev.github.io/lib/audios/2022 LCK 밴픽 브금  LCK Champ Select BGM.mp3">2022 LCK 밴픽 브금 LCK Champ Select BGM</option>
                <option value="https://seanchoi-dev.github.io/lib/audios/Take%20Over%20-%20Worlds%202020.mp3">Take Over - Worlds 2020.mp3</option>
            </select>
        </small></div>
        <audio controls loop>
            <source id = 'bgmSource' src='https://seanchoi-dev.github.io/lib/audios/2022 LCK 밴픽 브금  LCK Champ Select BGM.mp3'/>
            <embed src= 'https://seanchoi-dev.github.io/lib/audios/2022 LCK 밴픽 브금  LCK Champ Select BGM.mp3' loop='loop'/>
        </audio>
    </div>
</div>
`;

const importBtnEvent = () => {
    const importBtn = document.getElementById('import-p-button');
    importBtn.addEventListener('click', () => {
        const pList = document.getElementById('import-participant-list').value.split(/\n/);
        const pArray = [];
        let nameInputEl;
        pList.forEach((value) => {
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
        for (let i=0; i<pArray.length && pArray.length < state.numOfPlayers; i++){
            nameInputEl = document.getElementById(`mix_players_${i}_name`);
            nameInputEl.value = pArray[i];   
            setTierByInputChange(nameInputEl);
        }
        saveState();
        if (pArray.length > 0) {
            document.querySelector('a.import-icon').click();
        }
    });
}

export default async function fn (block) {
    API_KEY = await getRiotAPIKey();
    const configBody = document.createElement('div');
    configBody.innerHTML = teamConfigBody;
    block.prepend(configBody);
    initTeam();
    document.querySelector('audio').volume = 0.25;
}