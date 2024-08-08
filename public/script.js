

document.getElementById('schedule-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const players = document.getElementById('players').value;
  try {
    const response = await fetch('/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ players })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { teams, schedule } = await response.json();
    displayTeams(teams);
    displaySchedule(schedule);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
});

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
    roundDiv.innerHTML += `<h2>Round ${index + 1}</h2>`;
    round.forEach(match => {
      const matchDiv = document.createElement('div');
      matchDiv.innerHTML = `${match[0]} vs ${match[1]} <br> Score: 
        <input type="number" class="score" id="${match[0]}-score-${index}" placeholder="${match[0]} Score"> - 
        <input type="number" class="score" id="${match[1]}-score-${index}" placeholder="${match[1]} Score"> 
        <button id="submit-${match[0]}-${match[1]}" onclick="recordResult('${match[0]}', '${match[1]}', ${index})">Submit</button>`;
      roundDiv.appendChild(matchDiv);
    });
    output.appendChild(roundDiv);
  });
  // Add a container for the playoff button
  output.innerHTML += '<div id="playoff-button-container"></div>';
}

const results = {}; // To store the results
let submittedCount = 0;

function recordResult(team1, team2, roundIndex) {
  const team1Score = document.getElementById(`${team1}-score-${roundIndex}`).value;
  const team2Score = document.getElementById(`${team2}-score-${roundIndex}`).value;

  if (team1Score !== "" && team2Score !== "") {
    if (!results[team1]) results[team1] = { wins: 0, losses: 0, points: 0 };
    if (!results[team2]) results[team2] = { wins: 0, losses: 0, points: 0 };

    if (parseInt(team1Score) > parseInt(team2Score)) {
      results[team1].wins += 1;
      results[team2].losses += 1;
    } else {
      results[team2].wins += 1;
      results[team1].losses += 1;
    }

    results[team1].points += parseInt(team1Score);
    results[team2].points += parseInt(team2Score);

    // Indicate submission and disable the button
    document.getElementById(`submit-${team1}-${team2}`).textContent = 'Submitted';
    document.getElementById(`submit-${team1}-${team2}`).disabled = true;
    submittedCount += 1;

    alert(`Result recorded: ${team1} ${team1Score} - ${team2} ${team2Score}`);
    checkForPlayoffs();
  } else {
    alert("Please enter valid scores for both teams.");
  }
}

function calculateStandings() {
  const standings = Object.keys(results).map(team => ({
    team,
    wins: results[team].wins,
    losses: results[team].losses,
    points: results[team].points,
  }));

  standings.sort((a, b) => b.wins - a.wins || b.points - a.points);

  return standings;
}

function generatePlayoffs() {
  const standings = calculateStandings();
  const playoffTeams = standings.slice(0, 6);
  const output = document.getElementById('playoff-output');
  output.innerHTML = '<h2>Playoff Schedule</h2>';

  if (playoffTeams.length > 2) {
    output.innerHTML += '<h3>First Round</h3>';
    for (let i = 2; i < playoffTeams.length; i += 2) {
      if (playoffTeams[i + 1]) {
        output.innerHTML += `<div>${playoffTeams[i].team} vs ${playoffTeams[i + 1].team}</div>`;
      }
    }

    output.innerHTML += '<h3>Semifinals</h3>';
    output.innerHTML += `<div>${playoffTeams[0].team} (Bye)</div>`;
    output.innerHTML += `<div>${playoffTeams[1].team} (Bye)</div>`;

    output.innerHTML += '<h3>Finals</h3>';
    output.innerHTML += `<div>Winner of Semifinals</div>`;
  }
}

// Check if all results are submitted and display the playoff button
function checkForPlayoffs() {
  const totalGames = document.querySelectorAll('.score').length / 2;
  if (submittedCount === totalGames) {
    const playoffButtonContainer = document.getElementById('playoff-button-container');
    playoffButtonContainer.innerHTML = '<button onclick="generatePlayoffs()">Generate Playoff Schedule</button>';
  }
}



