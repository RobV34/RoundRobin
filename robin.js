// const DUMMY = -1;
// // Returns an array of round representations (array of player pairs).
// // http://en.wikipedia.org/wiki/Round-robin_tournament#Scheduling_algorithm
// module.exports = function (n, ps) {
//   const rs = []; // rs = round array
//   if (!ps) {
//     ps = [];
//     for (let k = 1; k <= n; k += 1) {
//       ps.push(k);
//     }
//   } else {
//     ps = ps.slice();
//   }

//   if (n % 2 === 1) {
//     ps.push(DUMMY); // so we can match algorithm for even numbers
//     n += 1;
//   }
//   for (let j = 0; j < n - 1; j += 1) {
//     rs[j] = []; // create inner match array for round j
//     for (let i = 0; i < n / 2; i += 1) {
//       const o = n - 1 - i;
//       if (ps[i] !== DUMMY && ps[o] !== DUMMY) {
//         // flip orders to ensure everyone gets roughly n/2 home matches
//         const isHome = i === 0 && j % 2 === 1;
//         // insert pair as a match - [ away, home ]
//         rs[j].push([isHome ? ps[o] : ps[i], isHome ? ps[i] : ps[o]]);
//       }
//     }
//     ps.splice(1, 0, ps.pop()); // permutate for next round
//   }
//   return rs;
// };

const DUMMY = -1;

module.exports = function (n, ps) {
  const teams = []; // Array to store teams
  const schedule = []; // Array to store the schedule

  // Shuffle players randomly
  if (!ps) {
    ps = [];
    for (let k = 1; k <= n; k += 1) {
      ps.push(`Player ${k}`);
    }
  } else {
    ps = ps.slice();
    ps = ps.sort(() => Math.random() - 0.5); // Shuffle array
  }

  // Form teams
  for (let i = 0; i < ps.length; i += 2) {
    const teamName = `Team ${teams.length + 1}`;
    const player1 = ps[i];
    const player2 = ps[i + 1] || DUMMY; // Handle odd number of players
    teams.push({
      name: teamName,
      players: [player1, player2 === DUMMY ? null : player2],
    });
  }

  // Generate the round-robin schedule
  const numTeams = teams.length;
  for (let j = 0; j < numTeams - 1; j += 1) {
    schedule[j] = []; // create inner match array for round j
    for (let i = 0; i < numTeams / 2; i += 1) {
      const o = numTeams - 1 - i;
      if (teams[i].players[0] !== DUMMY && teams[o].players[0] !== DUMMY) {
        schedule[j].push([teams[i].name, teams[o].name]);
      }
    }
    teams.splice(1, 0, teams.pop()); // permutate for next round
  }

  return { teams, schedule };
};

