/*************************************************
 * CONSTANTS
 *************************************************/
const ASSURE_EPI_TARGET = 75;
const DEFAULT_SPECIFIC_YIELD = 1500;
const NBC_LPCD = 45;

const renewableModeSelect = document.getElementById("renewableMode");
const renewableValueInput = document.getElementById("renewableValue");

/*************************************************
 * RECYCLED WATER INPUT MODE (SINGLE FIELD)
 *************************************************/
const recycledModeSelect = document.getElementById("recycledMode");
const recycledValueInput = document.getElementById("recycledValue");
const recycledLabel = document.getElementById("recycledLabel");
const recycledError = document.getElementById("recycledError");

recycledModeSelect.addEventListener("change", () => {
  recycledValueInput.value = "";

  if (recycledModeSelect.value === "pct") {
    recycledValueInput.placeholder = "% e.g. 25";
  } else if (recycledModeSelect.value === "ltr") {
    recycledValueInput.placeholder = "Litres e.g. 30000";
  } else {
    recycledValueInput.placeholder = "e.g. 25";
  }
});




/*************************************************
 * BEE STAR RATING EQUATIONS (SAMPLE – WORKING)
 * Replace with official BEE equations later
 *************************************************/
const beeEquations = {
  "Composite": {
    "Large": {
      "5Star": { a: 0.75, c: 20 },
      "4Star": { a: 0.80, c: 30 },
      "3Star": { a: 0.85, c: 40 },
      "2Star": { a: 0.90, c: 50 },
      "1Star": { a: 0.95, c: 60 }
    },
    "Medium": {
      "5Star": { a: 0.9, c: 20 },
      "4Star": { a: 0.95, c: 30 },
      "3Star": { a: 1.0, c: 40 },
      "2Star": { a: 1.05, c: 50 },
      "1Star": { a: 1.1, c: 60 }
    },
    "Small": {
      "5Star": { a: 0.45, c: 20 },
      "4Star": { a: 0.5, c: 30 },
      "3Star": { a: 0.55, c: 40 },
      "2Star": { a: 0.6, c: 50 },
      "1Star": { a: 0.65, c: 60 }
    }
  },

  "Warm & Humid": {
    "Large": {
      "5Star": { a: 0.7, c: 25 },
      "4Star": { a: 0.75, c: 35 },
      "3Star": { a: 0.8, c: 45 },
      "2Star": { a: 0.85, c: 55 },
      "1Star": { a: 0.9, c: 65 }
    },
    "Medium": {
      "5Star": { a: 0.7, c: 25 },
      "4Star": { a: 0.75, c: 35 },
      "3Star": { a: 0.8, c: 45 },
      "2Star": { a: 0.85, c: 55 },
      "1Star": { a: 0.9, c: 65 }
    },
    "Small": {
      "5Star": { a: 0.5, c: 25 },
      "4Star": { a: 0.55, c: 35 },
      "3Star": { a: 0.6, c: 45 },
      "2Star": { a: 0.65, c: 55 },
      "1Star": { a: 0.7, c: 65 }
    }
  },

  "Hot & Dry": {
    "Large": {
      "5Star": { a: 0.9, c: 15 },
      "4Star": { a: 0.95, c: 25 },
      "3Star": { a: 1.0, c: 35 },
      "2Star": { a: 1.05, c: 45 },
      "1Star": { a: 1.1, c: 55 }
    },
    "Medium": {
      "5Star": { a: 1.05, c: 15 },
      "4Star": { a: 1.1, c: 25 },
      "3Star": { a: 1.15, c: 35 },
      "2Star": { a: 1.2, c: 45 },
      "1Star": { a: 1.25, c: 55 }
    },
    "Small": {
      "5Star": { a: 1.55, c: 15 },
      "4Star": { a: 0.6, c: 25 },
      "3Star": { a: 0.65, c: 35 },
      "2Star": { a: 0.7, c: 45 },
      "1Star": { a: 0.75, c: 55 }
    }
  },

  "Temperate": {
    "Large": {
      "5Star": { a: 0.9, c: 15 },
      "4Star": { a: 0.95, c: 25 },
      "3Star": { a: 1.0, c: 35 },
      "2Star": { a: 1.05, c: 45 },
      "1Star": { a: 1.1, c: 55 }
    },
    "Medium": {
      "5Star": { a: 1.05, c: 15 },
      "4Star": { a: 1.1, c: 25 },
      "3Star": { a: 1.15, c: 35 },
      "2Star": { a: 1.2, c: 45 },
      "1Star": { a: 1.25, c: 55 }
    },
    "Small": {
      "5Star": { a: 1.55, c: 15 },
      "4Star": { a: 0.6, c: 25 },
      "3Star": { a: 0.65, c: 35 },
      "2Star": { a: 0.7, c: 45 },
      "1Star": { a: 0.75, c: 55 }
    }
  }
};


/*************************************************
 * CITY → CLIMATE MAP
 *******************

/*************************************************
 * CLIMATE + STATE + CITY DATA (SINGLE SOURCE)
 *************************************************/
let climateRawData = [];
let cityClimateMap = {};

fetch("Location_CZ_Latitude.json")
  .then(res => res.json())
  .then(data => {
    climateRawData = data;

    data.forEach(item => {
      cityClimateMap[item.City.trim().toLowerCase()] = {
        zone: item.Climate_Zone.trim(),
        state: item.State,
        lat: item.Lat,
        lon: item.Longitude
      };
    });

    console.log("✅ Climate JSON loaded");
  })
  .catch(err => console.error("❌ Climate JSON load error", err));



/*************************************************
 * SAFE INPUT READERS (CRITICAL)
 *************************************************/
function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const v = el.value;
  if (v === null || v === undefined || v.trim() === "") return NaN;
  return Number(v);
}

function readText(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/*************************************************
 * STATE → CITY DROPDOWN
 *************************************************/
let stateCityData = [];

const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

fetch("Location_CZ_Latitude.json")
  .then(res => res.json())
  .then(data => {
    climateRawData = data;

    // Populate States
    const states = [...new Set(data.map(d => d.State))].sort();
    states.forEach(state => {
      const opt = document.createElement("option");
      opt.value = state;
      opt.textContent = state;
      stateSelect.appendChild(opt);
    });
  });

stateSelect.addEventListener("change", () => {
  citySelect.innerHTML = `<option value="">Select City</option>`;
  citySelect.disabled = true;

  if (!stateSelect.value) return;

  climateRawData
    .filter(d => d.State === stateSelect.value)
    .forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.City;       // ✅ EXACT JSON NAME
      opt.textContent = d.City;
      citySelect.appendChild(opt);
    });

  citySelect.disabled = false;
});


/*************************************************
 * BUILDING SIZE
 *************************************************/
function getBuildingSize(areaSqm) {
  if (areaSqm <= 10000) return "Small";
  if (areaSqm <= 30000) return "Medium";
  return "Large";
}

/*************************************************
 * CORE CALCULATION (FINAL)
 *************************************************/
function calculateBuildingPerformance(inputs) {

  const {
    city,
    areaSqm,
    energyKWh,
    energyPeriod,
    coolingTR,
    contractDemandKVA,
    dgSize,
    renewableKwp,
    renewablePct,
    acAreaPercentage,
    lpcd
  } = inputs;


  /* ---------- ENERGY ---------- */
  const energyAnnualKWh =
    energyPeriod === "monthly" ? energyKWh * 12 : energyKWh;

  /* ---------- AREA ---------- */
  const areaSqft = areaSqm / 0.092903;

  /* ---------- CLIMATE ---------- */
 const climateZone =
  cityClimateMap[city.toLowerCase()]?.zone || "Unknown";


  /* ---------- BUILDING SIZE ---------- */
  const buildingSize = getBuildingSize(areaSqm);

  /* ---------- EPI ---------- */
  const epi = energyAnnualKWh / areaSqm;

  /* ---------- ASSURE EPI ---------- */
  const assureStatus =
    epi <= ASSURE_EPI_TARGET
      ? { text: "Within target", class: "metric-good" }
      : { text: "Above target", class: "metric-bad" };

  /* ---------- RENEWABLES (ABSOLUTE LOCK) ---------- */
  let renewableGenKWh = 0;
  let hasRenewables = false;

  if (!isNaN(renewablePct) && renewablePct > 0) {
    renewableGenKWh = energyAnnualKWh * (renewablePct / 100);
    hasRenewables = true;
  } else if (!isNaN(renewableKwp) && renewableKwp > 0) {
    renewableGenKWh = renewableKwp * DEFAULT_SPECIFIC_YIELD;
    hasRenewables = true;
  }

  /* ---------- NET ENERGY (PHYSICALLY CORRECT) ---------- */
  const EPS = Math.max(1, 0.005 * energyAnnualKWh);

  let netStatus = {
    text: "Net Negative — Demand exceeds generation",
    class: "badge-negative"
  };

  if (hasRenewables) {
    if (renewableGenKWh - energyAnnualKWh > EPS) {
      netStatus = {
        text: "Net Positive — Surplus renewable energy",
        class: "badge-positive"
      };
    } else if (Math.abs(renewableGenKWh - energyAnnualKWh) <= EPS) {
      netStatus = {
        text: "Net Zero — Balanced energy",
        class: "badge-neutral"
      };
    }
  }


  /* ================= BEE STAR RATING ================= */
let starRating = {
  text: "N/A (BEE rating not applicable)",
  class: "badge-warn"
};

if (!isNaN(acAreaPercentage) && acAreaPercentage > 0 && acAreaPercentage <= 100) {

  const zoneKey = climateZone.trim();
  const eqByZone = beeEquations[zoneKey];
  const eq = eqByZone ? eqByZone[buildingSize] : null;

  console.log("BEE DEBUG:", {
    zoneKey,
    buildingSize,
    acAreaPercentage,
    eq
  });

  if (eq) {
    const acPct = acAreaPercentage;

    const epi5 = (eq["5Star"].a * acPct) + eq["5Star"].c;
    const epi4 = (eq["4Star"].a * acPct) + eq["4Star"].c;
    const epi3 = (eq["3Star"].a * acPct) + eq["3Star"].c;
    const epi2 = (eq["2Star"].a * acPct) + eq["2Star"].c;
    const epi1 = (eq["1Star"].a * acPct) + eq["1Star"].c;

    if (epi <= epi5)
      starRating = { text: "★★★★★ (5 Star)", class: "badge-good" };
    else if (epi <= epi4)
      starRating = { text: "★★★★☆ (4 Star)", class: "badge-good" };
    else if (epi <= epi3)
      starRating = { text: "★★★☆☆ (3 Star)", class: "badge-warn" };
    else if (epi <= epi2)
      starRating = { text: "★★☆☆☆ (2 Star)", class: "badge-bad" };
    else if (epi <= epi1)
      starRating = { text: "★☆☆☆☆ (1 Star)", class: "badge-bad" };
    else
      starRating = { text: "No Star", class: "badge-bad" };
  }

  console.log("CLIMATE LOOKUP DEBUG:", {
  city,
  climateZone,
  source: cityClimateMap[city.toLowerCase()]
});

}

/* ================= HVAC SIZING KPI ================= */
let hvacSizing = {
  text: "—",
  class: "rating-fair"
};

if (!isNaN(coolingTR) && coolingTR > 0 && areaSqft > 0) {
  const sfPerTR = areaSqft / coolingTR;

  if (sfPerTR >= 700 && sfPerTR <= 800) {
    hvacSizing = {
      text: `${sfPerTR.toFixed(0)} sqft/TR — Efficient sizing`,
      class: "rating-excellent"
    };
  } else if (sfPerTR < 700) {
    hvacSizing = {
      text: `${sfPerTR.toFixed(0)} sqft/TR — Oversized (low sqft/TR)`,
      class: "rating-poor"
    };
  } else {
    hvacSizing = {
      text: `${sfPerTR.toFixed(0)} sqft/TR — Possibly undersized (high sqft/TR)`,
      class: "rating-fair"
    };
  }
}

console.log("HVAC DEBUG:", hvacSizing);


/* ================= CONTRACT / DG SIZING KPI ================= */
const PF = 0.9;

let demandSizing = {
  text: "—",
  class: "rating-fair"
};

if (areaSqft > 0) {

  const cdKW = (!isNaN(contractDemandKVA) ? contractDemandKVA : 0) * PF;
  const cdWsf = (cdKW * 1000) / areaSqft;

  const dgKW = (!isNaN(dgSize) ? dgSize : 0) * PF;
  const dgWsf = dgKW > 0 ? (dgKW * 1000) / areaSqft : null;

  const cdOk = cdWsf > 0 && cdWsf < 5;
  const dgOk = dgWsf === null ? true : dgWsf < 5;

  if (cdOk && dgOk) {
    demandSizing = {
      text:
        `Contract: ${cdWsf.toFixed(2)} W/sqft` +
        (dgWsf !== null ? `, DG: ${dgWsf.toFixed(2)} W/sqft` : "") +
        " — Efficient",
      class: "rating-excellent"
    };
  } else {
    demandSizing = {
      text:
        `Contract: ${cdWsf.toFixed(2)} W/sqft` +
        (dgWsf !== null ? `, DG: ${dgWsf.toFixed(2)} W/sqft` : "") +
        " — Above target",
      class: "rating-poor"
    };
  }
}

console.log("DEMAND DEBUG:", demandSizing);



  /* ---------- HVAC ---------- */
  // let hvacResult = { text: "—", class: "badge-warn" };

  // if (!isNaN(coolingTR) && coolingTR > 0) {
  //   const sqftPerTR = areaSqft / coolingTR;
  //   if (sqftPerTR >= 700 && sqftPerTR <= 800)
  //     hvacResult = { text: "Efficient sizing", class: "badge-good" };
  //   else if (sqftPerTR < 700)
  //     hvacResult = { text: "Oversized", class: "badge-bad" };
  //   else
  //     hvacResult = { text: "Undersized", class: "badge-warn" };
  // }

  /* ---------- WATER ---------- */
/* ================= WATER (NBC LPCD ONLY) ================= */
let waterStatus = {
  text: `Not provided — NBC ref: ${NBC_LPCD} lpcd`,
  class: "rating-fair"
};

if (!isNaN(lpcd)) {
  if (lpcd <= NBC_LPCD) {
    waterStatus = {
      text: `${lpcd.toFixed(1)} lpcd — Within NBC`,
      class: "rating-excellent"
    };
  } else {
    waterStatus = {
      text: `${lpcd.toFixed(1)} lpcd — Above NBC`,
      class: "rating-poor"
    };
  }
}

  /* ---------- DEBUG (KEEP FOR NOW) ---------- */
  console.log("DEBUG:", {
    areaSqm,
    energyAnnualKWh,
    renewableKwp,
    renewablePct,
    renewableGenKWh,
    hasRenewables,
    epi
  });

  return {
    city,
    climateZone,
    buildingSize,
    epi,
    assureStatus,
    netStatus,
    starRating,
    hvacSizing,
    demandSizing,
    // hvacResult,
    waterStatus
  };
}

/*************************************************
 * ASSESS BUTTON (FINAL – VALIDATED)
 *************************************************/
document.getElementById("assessBtn").addEventListener("click", () => {

  /* ========= RENEWABLE VALIDATION ========= */
  const renewableMode = readText("renewableMode");
  const renewableValue = readNumber("renewableValue");

  const renewableLabel = document.getElementById("renewableLabel");
  const renewableError = document.getElementById("renewableError");
  const renewableValueInput = document.getElementById("renewableValue");

  // Reset error state
  renewableLabel.classList.remove("label-error");
  renewableValueInput.classList.remove("input-error");
  renewableError.classList.add("hidden");

  // Enforce one renewable input
  if (!renewableMode || isNaN(renewableValue)) {
    renewableLabel.classList.add("label-error");
    renewableValueInput.classList.add("input-error");
    renewableError.classList.remove("hidden");
    return;
  }

    // ----- Recycled water validation -----
  recycledLabel.classList.remove("label-error");
  recycledValueInput.classList.remove("input-error");
  recycledError.classList.add("hidden");

  const recycledMode = readText("recycledMode");
  const recycledValue = readNumber("recycledValue");

  let recycledPct = NaN;
  let recycledLtr = NaN;

  if (recycledMode && !isNaN(recycledValue)) {
    if (recycledMode === "pct") recycledPct = recycledValue;
    if (recycledMode === "ltr") recycledLtr = recycledValue;
  } else if (recycledMode || !isNaN(recycledValue)) {
    recycledLabel.classList.add("label-error");
    recycledValueInput.classList.add("input-error");
    recycledError.classList.remove("hidden");
    return;
  }


  /* ========= COLLECT INPUTS ========= */
  const inputs = {
    city: readText("city"),
    areaSqm: readNumber("area"),
    energyKWh: readNumber("energy"),
    energyPeriod: readText("energyPeriod"),
    coolingTR: readNumber("acCapacity"),
    contractDemandKVA: readNumber("contractDemand"),
    dgSize: readNumber("dgSize"),

    // 🔒 ONLY ONE renewable path allowed
    renewableKwp: renewableMode === "kwp" ? renewableValue : NaN,
    renewablePct: renewableMode === "pct" ? renewableValue : NaN,

    acAreaPercentage: readNumber("acArea"),
    lpcd: readNumber("lpcd")
  };

  /* ========= BASIC REQUIRED CHECK ========= */
  if (
    !inputs.city ||
    isNaN(inputs.areaSqm) ||
    isNaN(inputs.energyKWh)
  ) {
    alert("Please select City and enter valid Area & Energy values");
    return;
  }

  /* ========= RUN CALCULATION ========= */
  const results = calculateBuildingPerformance(inputs);
  renderResults(results);
});



/*************************************************
 * RENDER RESULTS (MATCHES HTML EXACTLY)
 *************************************************/
function renderResults(r) {

  /* ================= SUMMARY ================= */
  document.getElementById("outCity").textContent =
    r.city || "—";

  document.getElementById("outClimate").textContent =
    r.climateZone || "—";

  document.getElementById("outEpiValue").textContent =
    typeof r.epi === "number"
      ? `${r.epi.toFixed(2)} kWh/sqm/year`
      : "—";

  const assureEl = document.getElementById("outAssureEpi");
  if (typeof r.epi === "number") {
    assureEl.textContent =
      r.epi <= ASSURE_EPI_TARGET
        ? `${r.epi.toFixed(2)} — ✅ Within target`
        : `${r.epi.toFixed(2)} — ❌ Above target`;

    assureEl.className =
      r.epi <= ASSURE_EPI_TARGET
        ? "metric-value metric-good"
        : "metric-value metric-bad";
  } else {
    assureEl.textContent = "—";
    assureEl.className = "metric-value";
  }

  document.getElementById("outStarRating").innerHTML =
    `<span class="badge ${r.starRating.class}">
      ${r.starRating.text}
    </span>`;

  document.getElementById("outNetEnergy").innerHTML =
    `<span class="${r.netStatus.class}">
      ${r.netStatus.text}
    </span>`;


/* ================= HVAC & ELECTRICAL ================= */
  document.getElementById("outHvac").innerHTML = `
    <div class="kpi-row">
      <div class="kpi-left">
        <span class="kpi-icon">❄️</span>
        <div>
          <div class="kpi-title">
            HVAC sizing
            <span class="kpi-ref">(Assure KPI: 700–800 sqft/TR)</span>
          </div>
        </div>
      </div>

      <div class="kpi-right ${r.hvacSizing.class}">
        ${r.hvacSizing.text}
      </div>
    </div>
  `;

document.getElementById("outDemand").innerHTML = `
  <div class="kpi-row">
    <div class="kpi-left">
      <span class="kpi-icon">⚡</span>
      <div>
        <div class="kpi-title">
          Contract Demand / DG set sizing
          <span class="kpi-ref">(Assure KPI: &lt; 5 W/sqft)</span>
        </div>
      </div>
    </div>

    <div class="kpi-right ${r.demandSizing.class}">
      ${r.demandSizing.text}
    </div>
  </div>
`;

/* ================= WATER ================= */
document.getElementById("outWater").innerHTML = `
  <div class="kpi-row">
    <div class="kpi-left">
      <span class="kpi-icon">💧</span>
      <div>
        <div class="kpi-title">
          Water Efficiency
          <span class="kpi-ref">(NBC 45 lpcd)</span>
        </div>
      </div>
    </div>

    <div class="kpi-right ${r.waterStatus.class}">
      ${r.waterStatus.text}
    </div>
  </div>
`;




  /* ================= SHOW RESULTS ================= */
  document.getElementById("results").classList.remove("hidden");
}



