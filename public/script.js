// document.getElementById('schedule-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const players = document.getElementById('players').value;
//   try {
//     const response = await fetch('/schedule', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ players })
//     });

//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }

//     const schedule = await response.json();
//     displaySchedule(schedule);
//   } catch (error) {
//     console.error('There was a problem with the fetch operation:', error);
//   }
// });

// function displaySchedule(schedule) {
//   const output = document.getElementById('schedule-output');
//   output.innerHTML = '';
//   schedule.forEach((round, index) => {
//     const roundDiv = document.createElement('div');
//     roundDiv.classList.add('round');
//     roundDiv.innerHTML = `<h2>Round ${index + 1}</h2>`;
//     round.forEach(match => {
//       const matchDiv = document.createElement('div');
//       matchDiv.innerHTML = `${match[0]} vs ${match[1]}`;
//       roundDiv.appendChild(matchDiv);
//     });
//     output.appendChild(roundDiv);
//   });
// }

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
      matchDiv.innerHTML = `${match[0]} vs ${match[1]}`;
      roundDiv.appendChild(matchDiv);
    });
    output.appendChild(roundDiv);
  });
}





  