// --- This scripts needs to be ran once and you'll get the data off the servers you can attack and hides the once you cannot
/** @param {NS} ns */
export async function main(ns) {
  const servers = scanAll(ns, "home");

  ns.disableLog("ALL");
  ns.ui.openTail() 
  
  analyzeServers(ns, servers);

  const rankedServers = profitRatio(ns, servers);
  const ranked = mergeSort(rankedServers);
  
  // --- Top 10 ---
  for(let i = 0; i < 10; i++) {
    const s = ranked[i];
    ns.tprint(`${i+1}. ${s.server.padEnd(25)} | Profit: ${s.profitScore.toFixed(2).padEnd(20)} | Min Sec: ${s.minimumSecurity.toFixed(3).padEnd(10)} | Max Money: ${s.maxMoney}`);
  }

  // --- All but in Logs
  for(let j = 0; j < ranked; j++) {
    ns.print(JSON.stringify(ranked[j]));
  }
}

function scanAll(ns, server, visited = []) {
  visited.push(server);
  const neighbors = ns.scan(server);

  for(const neighbor of neighbors) {
    if(!visited.includes(neighbor)){
      scanAll(ns, neighbor, visited)
    }
  }
  return visited;
}

function analyzeServers(ns, servers) {
  const playerHackLevel = ns.getHackingLevel();
  for(const server of servers) {
    let minimumSecurity = ns.getServerMinSecurityLevel(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let weakenTime = ns.getWeakenTime(server);
    let hackingRequirement = ns.getServerRequiredHackingLevel(server)

    if(playerHackLevel >= hackingRequirement && ns.hasRootAccess(server)) {
      // Prints: Server Name | Max Money | Minimum Security
      ns.tprint(`[OPEN]: ${server.padEnd(25)} | Max Money: ${maxMoney.toFixed(2).padEnd(25)} | Minimum Security: ${minimumSecurity.toFixed(3).padEnd(5)}`)
    } else if(!ns.hasRootAccess(server)) {
      // Prints: ERROR no root access
      ns.tprint(`\u001b[31m[ERROR - No Root Access]: ${server}\u001b[31m`)
    } else {
      // Prints: Server Name | Hacking Level Required
      ns.tprint(`\u001b[31m[LOCKED]: ${server.padEnd(25)} | Hacking Level Required: ${String(hackingRequirement).padEnd(5)}\u001b[0m`);
    } 
  }
}

// --- Ranking Algorithm
function profitRatio(ns, servers) {
  let serverStats = [];
  const playerHackLevel = ns.getHackingLevel();

  for(const server of servers) {
    let hackingRequirement = ns.getServerRequiredHackingLevel(server);
    let minimumSecurity    = ns.getServerMinSecurityLevel(server);
    let maxMoney           = ns.getServerMaxMoney(server);
    let profitScore        = maxMoney / minimumSecurity;

    if(playerHackLevel >= hackingRequirement && ns.hasRootAccess(server)) {
      serverStats.push({server, profitScore, minimumSecurity, maxMoney});
    }
  }
  return serverStats;
}

function mergeSort(arr) {
  if(arr.length <= 1){
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  let merged = [];

  let i = 0;
  let j = 0;

  while(i < left.length && j < right.length) {
    if(left[i].profitScore >= right[j].profitScore) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }

  while(i < left.length) {
    merged.push(left[i]);
    i++;
  }

  while(j < right.length) {
    merged.push(right[j]);
    j++;
  }

  return merged;
}
