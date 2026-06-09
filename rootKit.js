/** @param {NS} ns */
export async function main(ns) {
  const servers = scanAll(ns, "home");

  for(const server of servers) {
    if(!ns.hasRootAccess(server)) {
      let portsRequired = ns.getServerNumPortsRequired(server);
      let portsOpened   = 0;

      // --- Crack Ports
      if(ns.fileExists("bruteSSH.exe", "home")) {
        ns.brutessh(server);
        portsOpened++;
      }

      if(ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(server);
        portsOpened++;
      }

      if(ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(server);
        portsOpened++;
      }

      if(ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(server);
        portsOpened++;
      }

      if(ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(server);
        portsOpened++;
      }

      if(portsOpened >= portsRequired) {
        ns.nuke(server);
      }
    }
  }
}

// --- Scan all neighbors (DFS - Depth First Search)
function scanAll(ns, server, visited = []){
  visited.push(server)
  const neighbors  = ns.scan(server);

  for(const neighbor of neighbors) {
    if(!visited.includes(neighbor)){
      scanAll(ns, neighbor, visited);
    }
  }
  return visited;
}
