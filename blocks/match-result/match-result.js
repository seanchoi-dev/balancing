import { getRiotAPIKey, getKeyByValue } from '/scripts/utils.js';

let API_KEY = '';

const positionOrder = {
	'top': 1,
	'jungle': 2,
	'mid': 3,
	'adc': 4,
	'support': 5,
	'all': 6,
}
let state = {};
const balanceTeamsByLevels = (players) => {
	// Shuffle the players array
	players = shuffle(players);
	// players.sort((a, b) => b.level - a.level);

	// Determine the number of players per team
	const numPlayersPerTeam = Math.floor(players.length / 2);

	// Initialize two empty teams
	const team1 = [];
	const team2 = [];

	// Initialize variables to keep track of the total skill of each team
	let totalSkill1 = 0;
	let totalSkill2 = 0;

	// Assign players to teams greedily, starting with the highest-skilled player
	for (let i = 0; i < players.length; i++) {
		const player = players[i];
		if (i % 2 === 0 && team1.length < numPlayersPerTeam) {
			team1.push(player);
			totalSkill1 += player.level;
		} else if (team2.length < numPlayersPerTeam) {
			team2.push(player);
			totalSkill2 += player.level;
		} else {
			team1.push(player);
			totalSkill1 += player.level;
		}
	}

	// If the total skill of the two teams is not equal, swap one player between teams
	const tolerance = 1; // You can adjust this tolerance value
	const MAX_TRIAL = 100000; // to prevent infinity loop
	let trial = 0;
	while (Math.abs(totalSkill1 - totalSkill2) > tolerance && trial < MAX_TRIAL) {
		let swapped = false;
		for (let i = 0; i < team1.length; i++) {
			for (let j = 0; j < team2.length; j++) {
				const newTotalSkill1 = totalSkill1 - team1[i].level + team2[j].level;
				const newTotalSkill2 = totalSkill2 - team2[j].level + team1[i].level;
				if (Math.abs(newTotalSkill1 - newTotalSkill2) < Math.abs(totalSkill1 - totalSkill2)) {
					const temp = team1[i];
					team1[i] = team2[j];
					team2[j] = temp;
					totalSkill1 = newTotalSkill1;
					totalSkill2 = newTotalSkill2;
					swapped = true;
					break;
				}
			}
			if (swapped) {
				break;
			}
		}
		trial++;
	}

	// Return an object with both teams
	return { team1, team2 };
}

const shuffle = (array) => {
	// Fisher-Yates shuffle algorithm
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const totalLevels = (team) => {
	let sum = 0;
	team.forEach(p => sum += p.level);
	return sum;
}

const getOpggbyName = (name) => {
	if (window.localStorage.tiers) {
        name = name.trim().toLowerCase();
        const tiers = JSON.parse(window.localStorage.tiers);
        if (tiers[name]) {
			return `https://www.op.gg/summoners/na/${name}`;
		}
    }
    return false;
}

const generatePlayer = (player) => {
	let positionsHTML = '';
	player.position.forEach(p => positionsHTML += `<div class="icon label-position-${p} me-1"></div>`);
	return `
    <div class="player mt-3 p-2 d-flex justify-content-between bg-white">
        <div class="name py-1">${player.name}</div>
        <div class="position-level d-flex">
            <div class="position d-flex me-2">
                ${positionsHTML}
            </div>
            <div class="level bg-warning p-1 d-flex justify-content-between">
              <div>${getKeyByValue(state.levelConfig, player.level)}</div>
              <div><small>(${player.level})</small></div>
            </div>
            <div class="ps-2 pe-1 opgg-link">${getOpggbyName(player.name) ? `<a target="_blank" href="${getOpggbyName(player.name)}"><img src="../lib/images/opgg.png" draggable="false"></a>`: '<img class="opacity-0" src="../lib/images/opgg.png" draggable="false">'}</div>
        </div>
    </div>`;
};

const generateTeam = (team) => {
	let coveredPostions = new Set();
	let coveredPostionsHTML = '';
	let playersHTML = '';
	let allCounts = 0;
	let positionCounts = 0;
	team.forEach(p => {
		playersHTML += generatePlayer(p)
		p.position.forEach(position => {
			coveredPostions.add(position);
			if (position === 'all') {
				allCounts++;
			}
		});
	});
	coveredPostions = [...(coveredPostions)].sort((a, b) => {
		return positionOrder[a] - positionOrder[b];
	});
	coveredPostions.forEach(position => {
		coveredPostionsHTML += `<div class="icon label-position-${position} me-1"></div>`
		positionCounts++;
	});

	// For extra All positions
	for (let i = 0; i < allCounts - 1 && positionCounts < 5; i++) {
		coveredPostionsHTML += `<div class="icon label-position-all me-1"></div>`;
		positionCounts++;
	}

	// op.gg multiple
	const players = document.createElement('div');
	players.innerHTML = playersHTML;
	let summoners = '';
	players.querySelectorAll('.opgg-link a').forEach(a => {
		summoners += a.href.replace('https://www.op.gg/summoners/na/', ',');
	});

	return `<div class="team col-5">
    ${playersHTML}
    <div class="mt-1 d-flex justify-content-between">
        <div class="covered-positions d-flex mt-2 ${positionCounts < 5 ? 'warning border border-3 border-danger' : ''}">
            ${coveredPostionsHTML}
        </div>
        <div class="total me-1 text-white">${totalLevels(team)}</div>
    </div>
    <div class="opgg-all mt-3"><a target="_blank" href="https://www.op.gg/multisearch/na?summoners=${summoners.slice(1)}"><img src="../lib/images/opgg.png"></a></div>
</div>`;
}
const vs = () => {
	return `<div class="vs col-2 text-white d-flex align-items-center justify-content-center"><img src="../lib/images/vs.png"></div>`;
}

const copyState = async (teams) => {
	console.log(teams);
	if (!Object.keys(teams).length) return;
	try {
		let teamIndex = 0;
		let teamsInfo = '';
		Object.keys(teams).forEach(t => {
			teamsInfo += `(Team ${++teamIndex})\n`;
			teams[t].forEach(p => {
				teamsInfo += `${p.name}\n`;
			});
			teamsInfo += `${document.querySelectorAll('#result_row .team .opgg-all a')[teamIndex -1].href}\n\n`;
		});
		const blob = new Blob([teamsInfo], { type: 'text/plain' });
		const data = [new ClipboardItem({ [blob.type]: blob })];
		await navigator.clipboard.write(data);
		alert('Teams\' informations are copied to clipboard.');
	} catch (err) {
		console.error(err.name, err.message);
	}
	return false;
}

const resultBody = `
<div class="container-fluid">
    <div class="title nm-as-row py-5 text-center text-white">
        <h1>Get ready for next battle!</h1>
    </div>
    <div id="result_row" class="result bg-dark-grey-opacity p-3 row justify-content-between"></div>
</div>
<div class="container-fluid rebalance-btn-container p-4 d-flex flex-column align-items-center justify-content-center">
    <button class="py-2 px-5 btn btn-primary" onclick="window.location.hash = ''; window.location.hash = '#result';">Rebalance<br><small>(Re-Roll)</small></button>
	<button id="shareLink" class="share-link btn btn-success mt-2">Copy to share</button>
</div>
`;

export default async function fn(block) {
	API_KEY = await getRiotAPIKey();
	block.innerHTML = resultBody;
	const { hash } = window.location;
	let decodedTeams = {};
	if (hash && hash.length > 10) {
		// window.location.hash = '';
		const encodedTeams = hash.startsWith('#') ? hash.substring(1) : hash;
		decodedTeams = parseEncodedTeams(encodedTeams);
		state.levelConfig = decodedTeams.levelConfig;
	} else {
		state = JSON.parse(window.localStorage.state);
	}

	const teams = decodedTeams.team1 ? decodedTeams : balanceTeamsByLevels(state.players);

	// console.log(teams, totalLevels(teams.team1), totalLevels(teams.team2));
	const result = block.querySelector('#result_row');
	result.innerHTML = generateTeam(teams.team1) + vs() + generateTeam(teams.team2);
	block.querySelector('#shareLink').addEventListener('click', () => copyState(teams));
};
