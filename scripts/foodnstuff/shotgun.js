/** @param {NS} ns */
export async function main(ns) {
  const hostName          = ns.getHostname();

  const minSecurityLevel  = ns.getServerMinSecurityLevel(hostName);
  const maxMoney          = ns.getServerMaxMoney(hostName);

  const securityThreshold = minSecurityLevel + 1;
  const moneyThreshold    = maxMoney * 0.85;

  const maxRAM            = ns.getServerMaxRam(hostName);
  const weakenRAM         = ns.getScriptRam("weaken.js", hostName);
  const growRAM           = ns.getScriptRam("grow.js", hostName);
  const hackRAM           = ns.getScriptRam("hack.js", hostName);

  const shotgunShells = 5;

  // --- Time in milliseconds
  const weakenTime = ns.getWeakenTime(hostName);
  const growTime   = ns.getGrowTime(hostName);
  const hackTime   = ns.getHackTime(hostName);
  // --- Returns the highest time (milliseconds)
  const batchTime  = Math.max(weakenTime, growTime, hackTime);

  ns.print(`Weaken time: ${weakenTime} ms`);
  ns.print(`Grow time: ${growTime} ms`);
  ns.print(`Hack time: ${hackTime} ms`);
  
  const growDelayTime = batchTime - growTime;
  const hackDelayTime = batchTime - hackTime;

  async function killAllWorkers() {
    const runningScripts = ns.ps(hostName);

    // --- Array
    for(const rS of runningScripts) {
      if (rS.filename == "weaken.js" || rS.filename == "grow.js" || rS.filename == "hack.js") {
        ns.kill(rS.pid);
      }
    }
  }

  async function weakenToThreshold() {
    while(ns.getServerSecurityLevel(hostName) > securityThreshold) {
      let usedRAM = ns.getServerUsedRam(hostName);
      let freeRAM = maxRAM - usedRAM;
      let weakenThread = Math.floor(freeRAM / weakenRAM);

      if(weakenThread < 1) {
        weakenThread = 1;
    }

    ns.exec("weaken.js", hostName, weakenThread, hostName, 0);
    await ns.sleep(weakenTime + 100); // + 100 ms
    }
    killAllWorkers(); 
  }

  async function growToThreshold() {
    while(ns.getServerMoneyAvailable(hostName) < moneyThreshold) {
      let usedRAM = ns.getServerUsedRam(hostName);
      let freeRAM = maxRAM - usedRAM;
      let growThread = Math.floor(freeRAM / growRAM);

      if(growThread < 1) {
        growThread = 1;      
    }

    ns.exec("grow.js", hostName, growThread, hostName, 0)
    await ns.sleep(growTime + 100); // + 100 ms

    if(ns.getServerSecurityLevel(hostName) > securityThreshold + 2) {
        await weakenToThreshold();  
    }
    }
    killAllWorkers(); 
  }

  while(true) {
    await killAllWorkers(); 
    // --- Reduces Security and Grows Money (Also increases Security)
    // --- Order: Weaken -> Grow -> Weaken -> Shotgun
    await weakenToThreshold();
    await growToThreshold();
    await weakenToThreshold();

    const RAMPerSet = (2 * weakenRAM) + (1 * growRAM) + (1 * hackRAM);
    let usedRAM = ns.getServerUsedRam(hostName);
    let freeRAM = maxRAM - usedRAM;
    let maxSet = Math.floor(freeRAM / RAMPerSet);
    let weakenThread, growThread, hackThread;

    if(maxSet >= 1) {
      weakenThread = maxSet * 2;
      growThread   = maxSet * 1;
      hackThread   = maxSet * 1;
    } else {
      weakenThread = 1;
      growThread   = 1;
      hackThread   = 1;      
    }

    if (weakenRAM > freeRAM) weakenThread = 0;
    if (growRAM   > freeRAM) growThread   = 0;
    if (hackRAM   > freeRAM) hackThread   = 0;
    
    for(let i = 0; i < shotgunShells; i++) {
      // --- Note: ns.exec(Script, Target, Thread, arg0, arg1)
      ns.exec("weaken.js", hostName, weakenThread, hostName, 0);
      ns.exec("grow.js"  , hostName, growThread, hostName, growDelayTime);
      ns.exec("hack.js"  , hostName, hackThread, hostName, hackDelayTime);
    
      await ns.sleep(batchTime);
    }
  }
}
