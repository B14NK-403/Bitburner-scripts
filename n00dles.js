/** @param {NS} ns */
export async function main(ns) {
  const hostName = ns.getHostname();
  const minSecurityLevel = ns.getServerMinSecurityLevel(hostName);
  const maxMoney = ns.getServerMaxMoney(hostName);

  while(true) {
    let currentSecurityLevel = ns.getServerSecurityLevel(hostName);
    let currentMoney = ns.getServerMoneyAvailable(hostName);

    ns.print(`Current Security Level: ${currentSecurityLevel.toFixed(3)} / ${minSecurityLevel.toFixed(3)}`);
    ns.print(`Current Money: ${currentMoney.toFixed(2)} / ${maxMoney.toFixed(2)}`);
    // Buffer = 0.050 since weaken reduces it by 0.050
    if(currentSecurityLevel > minSecurityLevel + 0.050) {
      await ns.weaken(hostName);
    } else if(currentMoney < maxMoney * 0.85) {
      await ns.grow(hostName);
    } else {
      await ns.hack(hostName);
    }
  }
}
