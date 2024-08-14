// Variables to store results and submitted count
let results = {};
let playoffResults = {};
let submittedCount = 0;

// Last year's winners (example: change the value as needed)
const lastYearWinners = "rob, tara";

document.getElementById('schedule-form').addEventListener('submit', handleScheduleFormSubmit);

// New Game Button Event Listener
document.getElementById('start-new-game').addEventListener('click', startNewGame);

async function handleScheduleFormSubmit(event) {
  event.preventDefault();
  await generateSchedule();
}

async function generateSchedule() {
  const lastYearWinnersInput = document.getElementById('last-year-winners').value.trim();
  const playersInput = document.getElementById('players').value.trim();

  // Combine last year's winners and the new player names
  const players = lastYearWinnersInput ? `${lastYearWinnersInput}, ${playersInput}` : playersInput;

  try {
    const response = await fetch('/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ players }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { teams, schedule } = await response.json();
    displayTeams(teams);
    displaySchedule(schedule);

    // Persist teams, schedule, and initialize submitted count in localStorage
    persistData('teams', teams);
    persistData('schedule', schedule);
    persistData('submittedCount', submittedCount);

  } catch (error) {
    console.error('Failed to generate schedule:', error);
  }
}

function displayTeams(teams) {
  const output = document.getElementById('schedule-output');
  output.innerHTML = '<h2>Teams</h2>';

  teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team');
    teamDiv.innerHTML = `<strong>${team.name}:</strong> ${team.players.filter(p => p).join(' and ')}`;
    output.appendChild(teamDiv);
  });
}

function displaySchedule(schedule) {
  const output = document.getElementById('schedule-output');

  schedule.forEach((round, index) => {
    const roundDiv = document.createElement('div');
    roundDiv.classList.add('round');
    roundDiv.innerHTML = `<h2>Round ${index + 1}</h2>`;

    round.forEach(match => {
      const matchDiv = document.createElement('div');
      matchDiv.innerHTML = `
        ${match[0]} vs ${match[1]} <br> 
        Score: 
        <input type="number" class="score" id="${match[0]}-score-${index}" placeholder="${match[0]} Score"> - 
        <input type="number" class="score" id="${match[1]}-score-${index}" placeholder="${match[1]} Score"> 
        <button id="submit-${match[0]}-${match[1]}" onclick="handleResultSubmit('${match[0]}', '${match[1]}', ${index})">Submit</button>`;
      roundDiv.appendChild(matchDiv);
    });

    output.appendChild(roundDiv);
  });

  output.innerHTML += '<div id="playoff-button-container"></div>';
}

function persistData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function loadResultsFromLocalStorage() {
  results = loadData('roundRobinResults') || {};
  playoffResults = loadData('playoffResults') || {};
  submittedCount = loadData('submittedCount') || 0;

  const teams = loadData('teams');
  const schedule = loadData('schedule');

  if (teams && schedule) {
    displayTeams(teams);
    displaySchedule(schedule);
    restoreSubmittedScores(schedule);
  }
}

function restoreSubmittedScores(schedule) {
  schedule.forEach((round, index) => {
    round.forEach(match => {
      const matchKey = `${match[0]}-${match[1]}-${index}`;
      const savedScores = loadData(matchKey);
      if (savedScores) {
        document.getElementById(`${match[0]}-score-${index}`).value = savedScores.team1Score;
        document.getElementById(`${match[1]}-score-${index}`).value = savedScores.team2Score;
        disableSubmitButton(match[0], match[1]);
      }
    });
  });
}

function handleResultSubmit(team1, team2, roundIndex) {
  const team1Score = document.getElementById(`${team1}-score-${roundIndex}`).value;
  const team2Score = document.getElementById(`${team2}-score-${roundIndex}`).value;

  if (team1Score !== "" && team2Score !== "") {
    updateResults(team1, team2, parseInt(team1Score), parseInt(team2Score));

    // Persist the scores for this match
    const matchKey = `${team1}-${team2}-${roundIndex}`;
    persistData(matchKey, { team1Score, team2Score });

    disableSubmitButton(team1, team2);

    // Increment submitted count and persist it
    submittedCount++;
    persistData('submittedCount', submittedCount);

    // Check if playoffs should be generated
    checkForPlayoffs();

    console.log(`Result recorded: ${team1} ${team1Score} - ${team2} ${team2Score}`);
  } else {
    console.error("Please enter valid scores for both teams.");
  }
}

function updateResults(team1, team2, team1Score, team2Score) {
  if (!results[team1]) results[team1] = { wins: 0, losses: 0, points: 0, headToHead: {} };
  if (!results[team2]) results[team2] = { wins: 0, losses: 0, points: 0, headToHead: {} };

  if (team1Score > team2Score) {
    results[team1].wins += 1;
    results[team2].losses += 1;
    results[team1].headToHead[team2] = 1;
    results[team2].headToHead[team1] = -1;
  } else {
    results[team2].wins += 1;
    results[team1].losses += 1;
    results[team2].headToHead[team1] = 1;
    results[team1].headToHead[team2] = -1;
  }

  results[team1].points += team1Score;
  results[team2].points += team2Score;
}

function disableSubmitButton(team1, team2) {
  const buttonId = `submit-${team1}-${team2}`;
  document.getElementById(buttonId).textContent = 'Submitted';
  document.getElementById(buttonId).disabled = true;
}

function calculateStandings() {
  return Object.keys(results).map(team => ({
    team,
    wins: results[team].wins,
    losses: results[team].losses,
    points: results[team].points,
    headToHead: results[team].headToHead,
  })).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.headToHead[b.team] !== undefined) return a.headToHead[b.team];
    if (b.headToHead[a.team] !== undefined) return -b.headToHead[a.team];
    return b.points - a.points;
  });
}

function generatePlayoffs() {
  const standings = calculateStandings();
  const topTeams = standings.slice(0, 4);
  const output = document.getElementById('playoff-output');
  output.innerHTML = '<h2>Playoff Schedule</h2>';

  if (topTeams.length === 4) {
    output.innerHTML += '<h3>Semifinals</h3>';

    topTeams.forEach((team, index) => {
      if (index < 2) {
        const matchId = `semifinal-${topTeams[index].team}-vs-${topTeams[3 - index].team}`;
        output.innerHTML += `
          <div>
            ${topTeams[index].team} vs ${topTeams[3 - index].team} <br>
            Score: <input type="number" id="${matchId}-team1" placeholder="${topTeams[index].team} Score"> - 
            <input type="number" id="${matchId}-team2" placeholder="${topTeams[3 - index].team} Score">
            <button id="submit-${matchId}" onclick="recordPlayoffResult('${topTeams[index].team}', '${topTeams[3 - index].team}', '${matchId}')">Submit</button>
          </div>`;
      }
    });

    output.innerHTML += '<h3>Finals</h3>';
    const finalId = `final-winnerOfSemifinals1-vs-winnerOfSemifinals2`;
    output.innerHTML += `
      <div>
        Winner of Semifinals <br>
        Score: <input type="number" id="${finalId}-team1" placeholder="Semifinal Winner 1 Score"> - 
        <input type="number" id="${finalId}-team2" placeholder="Semifinal Winner 2 Score">
        <button id="declare-${finalId}" onclick="declareFinalWinner('${finalId}')">Declare Winner</button>
      </div>`;
  }
}

function recordPlayoffResult(team1, team2, matchId) {
  const team1Score = document.getElementById(`${matchId}-team1`).value;
  const team2Score = document.getElementById(`${matchId}-team2`).value;

  if (team1Score !== "" && team2Score !== "") {
    updatePlayoffResults(team1, team2, parseInt(team1Score), parseInt(team2Score));
    disableSubmitButton(matchId);
    persistData('playoffResults', playoffResults);
    console.log(`Playoff result recorded: ${team1} ${team1Score} - ${team2} ${team2Score}`);
  } else {
    console.error("Please enter valid scores for both teams.");
  }
}

function updatePlayoffResults(team1, team2, team1Score, team2Score) {
  if (!playoffResults[team1]) playoffResults[team1] = { wins: 0, losses: 0, points: 0 };
  if (!playoffResults[team2]) playoffResults[team2] = { wins: 0, losses: 0, points: 0 };

  if (team1Score > team2Score) {
    playoffResults[team1].wins += 1;
    playoffResults[team2].losses += 1;
    playoffResults[team1].points += team1Score;
    playoffResults[team2].points += team2Score;
  } else {
    playoffResults[team2].wins += 1;
    playoffResults[team1].losses += 1;
    playoffResults[team2].points += team2Score;
    playoffResults[team1].points += team1Score;
  }
}

function declareFinalWinner(finalId) {
  const team1Score = document.getElementById(`${finalId}-team1`).value;
  const team2Score = document.getElementById(`${finalId}-team2}`).value;

  if (team1Score !== "" && team2Score !== "") {
    const winner = team1Score > team2Score ? "Winner of Semifinals 1" : "Winner of Semifinals 2";
    document.getElementById('winnerDisplay').innerText = `Tournament Winner: ${winner}`;
    document.getElementById(`declare-${finalId}`).textContent = 'Winner Declared';
    document.getElementById(`declare-${finalId}`).disabled = true;
    persistData('tournamentWinner', winner);
  } else {
    console.error("Please enter valid scores for both teams.");
  }
}

function checkForPlayoffs() {
  const totalGames = document.querySelectorAll('.score').length / 2;
  if (submittedCount === totalGames) {
    document.getElementById('playoff-button-container').innerHTML = '<button onclick="generatePlayoffs()">Generate Playoff Schedule</button>';
  }
}

// Function to start a new game
function startNewGame() {
  // Clear local storage
  localStorage.clear();

  // Reset the results objects and submitted count
  results = {};
  playoffResults = {};
  submittedCount = 0;

  // Clear the UI components
  document.getElementById('schedule-output').innerHTML = '';
  document.getElementById('playoff-output').innerHTML = '';
  document.getElementById('players').value = '';

  // Optionally, reload the page
  location.reload();
}

// Load the previous game state, if any, when the page loads
window.onload = loadResultsFromLocalStorage;









