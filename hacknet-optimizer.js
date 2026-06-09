/** @param {NS} ns */
export async function main(ns) {
  let maxNodes = 5;
  while(true) {
    let currentNodes = ns.hacknet.numNodes();

    if(currentNodes < maxNodes) {
      buyNodes(ns, maxNodes)
    }

    await optimizeUpgrades(ns);
    maxNodes = increaseMaxNodes(ns, currentNodes, maxNodes);
    await ns.sleep(60000);
  }
}

// === Main Function
// --- Complete
function buyNodes(ns, maxNodes) {
  let buying = true;

  while(buying) {
    let currentNodes = ns.hacknet.numNodes();
    let currentMoney = ns.getServerMoneyAvailable("home");

    let nodeCost     = ns.hacknet.getPurchaseNodeCost();

    if(currentMoney >= nodeCost && currentNodes < maxNodes) {
      ns.hacknet.purchaseNode();
    } else {
      buying = false;
    }
  }
}

// --- Complete
async function optimizeUpgrades(ns) {
  let upgrading = true;

  while(upgrading) {
    let currentMoney = ns.getServerMoneyAvailable("home");
    let currentNodes = ns.hacknet.numNodes();

    let lowestCost      = Infinity;
    let currentCheapest = 0;
    let cheapestNode    = 0;
    let cheapestType    = "";
    let levelUpgradeAmount = 0;
    const upgradeByOne  = 1;

    let nodeStats = scanUpgradeOptions(ns);

    for(let i = 0; i < currentNodes; i++) {
      let thisLevelAmount;
      if(nodeStats[i].level + 5 <= 200) {
        thisLevelAmount = 5;
      } else if(nodeStats[i].level < 200) {
        thisLevelAmount = 200 - nodeStats[i].level;
      } else {
        thisLevelAmount = 0;
      }

      let levelCost = thisLevelAmount === 0 ? Infinity : ns.hacknet.getLevelUpgradeCost(i, thisLevelAmount);
      let ramCost   = ns.hacknet.getRamUpgradeCost(i, upgradeByOne);
      let coreCost  = ns.hacknet.getCoreUpgradeCost(i, upgradeByOne);

      if(levelCost < ramCost && levelCost < coreCost) {
        cheapestType    = "Level";
        currentCheapest = levelCost;
      } else if(ramCost < coreCost) {
        cheapestType    = "RAM";
        currentCheapest = ramCost;
      } else {
        cheapestType    = "Cores";
        currentCheapest = coreCost;
      }

      if(lowestCost > currentCheapest) {
        lowestCost         = currentCheapest;
        cheapestNode       = i;
        levelUpgradeAmount = thisLevelAmount; // locked in for the winning node
      }
    }

    if(currentMoney >= lowestCost) {
      if(cheapestType === "Level") {
        ns.hacknet.upgradeLevel(cheapestNode, levelUpgradeAmount);
      } else if(cheapestType === "RAM") {
        ns.hacknet.upgradeRam(cheapestNode, upgradeByOne);
      } else {
        ns.hacknet.upgradeCore(cheapestNode, upgradeByOne);
      }
    } else {
      upgrading = false;
    }

    await ns.sleep(100);
  }
}

function increaseMaxNodes(ns, currentNodes, maxNodes) {
    let nodeStats = scanUpgradeOptions(ns);
    let allMaxed = true;

    for(let i = 0; i < currentNodes; i++) {
      if(nodeStats[i].level != 200 || nodeStats[i].ram != 64 || nodeStats[i].cores != 16) {
        allMaxed = false;
      }
    }
    
    if(allMaxed) {
      return maxNodes + 5;
    } else {
      return maxNodes;
    }
}

// === Helper Function
// --- Complete
function scanUpgradeOptions(ns) {
  let currentNodes = ns.hacknet.numNodes();
  let nodeStats    = []

  for(let i = 0; i < currentNodes; i++) {
    let stats = ns.hacknet.getNodeStats(i);
    nodeStats.push(stats);
  }
  
  return nodeStats;
}
