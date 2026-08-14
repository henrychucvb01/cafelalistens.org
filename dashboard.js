const SUPABASE_URL = "https://dgjeowpksgwzldnwnvvl.supabase.co";

const SUPABASE_KEY = "sb_publishable_O7IQlgPKBSi0cxVWZyIHkg_8xeWxrmH";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// GLOBAL DATA
// ==========================================

let allFeedback = [];

let selectedSchool = "All Schools";

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

async function loadDashboard() {
  const { data, error } = await db
    .from("meal_feedback")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("Dashboard error:", error);

    alert("Could not load dashboard data.");

    return;
  }

  allFeedback = data || [];

  buildSchoolButtons();

  updateDashboard();
}

// ==========================================
// BUILD SCHOOL BUTTONS
// ==========================================

function buildSchoolButtons() {
  const container = document.getElementById("schoolButtons");

  if (!container) {
    return;
  }

  const schools = [
    ...new Set(allFeedback.map((row) => row.school).filter(Boolean)),
  ].sort();

  container.innerHTML = "";

  // ALL SCHOOLS

  const allButton = document.createElement("button");

  allButton.type = "button";

  allButton.textContent = "All Schools";

  allButton.className = "school-button";

  allButton.dataset.school = "All Schools";

  allButton.addEventListener("click", () => {
    selectSchool("All Schools");
  });

  container.appendChild(allButton);

  // INDIVIDUAL SCHOOLS

  schools.forEach((school) => {
    const button = document.createElement("button");

    button.type = "button";

    button.textContent = school;

    button.className = "school-button";

    button.dataset.school = school;

    button.addEventListener("click", () => {
      selectSchool(school);
    });

    container.appendChild(button);
  });

  highlightSchoolButton();
}

// ==========================================
// SELECT SCHOOL
// ==========================================

function selectSchool(school) {
  selectedSchool = school;

  highlightSchoolButton();

  updateDashboard();
}

// ==========================================
// HIGHLIGHT SELECTED SCHOOL
// ==========================================

function highlightSchoolButton() {
  document.querySelectorAll(".school-button").forEach((button) => {
    button.classList.toggle(
      "active-school",
      button.dataset.school === selectedSchool
    );
  });
}

// ==========================================
// FILTER DATA
// ==========================================

function getCurrentData() {
  if (selectedSchool === "All Schools") {
    return allFeedback;
  }

  return allFeedback.filter((row) => row.school === selectedSchool);
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {
  const data = getCurrentData();

  const selectedName = document.getElementById("selectedSchoolName");

  if (selectedName) {
    selectedName.textContent = selectedSchool;
  }

  updateStats(data);

  showIssues(data, "food_reason", "foodIssues");

  showIssues(data, "service_reason", "serviceIssues");

  showComments(data);

  buildTrendChart(data);
}

// ==========================================
// STATS
// ==========================================

function updateStats(data) {
  const total = data.length;

  document.getElementById("totalResponses").textContent = total;

  // OVERALL RATING

  const ratings = data.filter((row) => row.rating !== null);

  if (ratings.length > 0) {
    const totalRating = ratings.reduce(
      (sum, row) => sum + Number(row.rating),
      0
    );

    const average = totalRating / ratings.length;

    document.getElementById("averageRating").textContent = average.toFixed(1);
  } else {
    document.getElementById("averageRating").textContent = "—";
  }

  // FOOD APPROVAL

  const foodRatings = data.filter((row) => row.taste_good !== null);

  const foodGood = foodRatings.filter((row) => row.taste_good === true).length;

  const foodPercent = foodRatings.length
    ? Math.round((foodGood / foodRatings.length) * 100)
    : 0;

  document.getElementById("foodApproval").textContent = foodPercent + "%";

  // SERVICE APPROVAL

  const serviceRatings = data.filter((row) => row.friendly_service !== null);

  const serviceGood = serviceRatings.filter(
    (row) => row.friendly_service === true
  ).length;

  const servicePercent = serviceRatings.length
    ? Math.round((serviceGood / serviceRatings.length) * 100)
    : 0;

  document.getElementById("serviceApproval").textContent = servicePercent + "%";
}

// ==========================================
// ISSUE COUNTS
// ==========================================

function showIssues(data, field, elementId) {
  const issues = {};

  data.forEach((row) => {
    const reason = row[field];

    if (reason) {
      issues[reason] = (issues[reason] || 0) + 1;
    }
  });

  const sortedIssues = Object.entries(issues).sort((a, b) => b[1] - a[1]);

  const container = document.getElementById(elementId);

  if (sortedIssues.length === 0) {
    container.innerHTML = "<p>No negative feedback yet. 🎉</p>";

    return;
  }

  const totalIssues = sortedIssues.reduce((sum, item) => sum + item[1], 0);

  container.innerHTML = sortedIssues
    .map(([reason, count]) => {
      const percent = Math.round((count / totalIssues) * 100);

      return `
            <div class="issue-row">
              <div>
                <span>
                  ${escapeHtml(reason)}
                </span>

                <small>
                  ${percent}% of negative responses
                </small>
              </div>

              <strong>
                ${count}
              </strong>
            </div>
          `;
    })
    .join("");
}

// ==========================================
// COMMENTS
// ==========================================

function showComments(data) {
  const comments = [...data]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((row) => row.comment && row.comment.trim() !== "")
    .slice(0, 10);

  const container = document.getElementById("recentComments");

  if (!comments.length) {
    container.innerHTML = "<p>No comments yet.</p>";

    return;
  }

  container.innerHTML = comments
    .map((row) => {
      const date = new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
            <div class="comment-card">

              <strong>
                ${escapeHtml(row.school || "Unknown School")}
              </strong>

              <span>
                ⭐ ${row.rating || "—"}
              </span>

              <p>
                ${escapeHtml(row.comment)}
              </p>

              <small>
                ${date}
              </small>

            </div>
          `;
    })
    .join("");
}

// ==========================================
// BUILD DAILY TREND
// ==========================================

function buildTrendChart(data) {
  const container = document.getElementById("trendChart");

  if (!container) {
    return;
  }

  if (!data.length) {
    container.innerHTML = "<p>No trend data yet.</p>";

    return;
  }

  const byDate = {};

  data.forEach((row) => {
    const date = new Date(row.created_at);

    const key = date.toISOString().split("T")[0];

    if (!byDate[key]) {
      byDate[key] = {
        date: date,
        foodTotal: 0,
        foodGood: 0,
        serviceTotal: 0,
        serviceGood: 0,
      };
    }

    if (row.taste_good !== null) {
      byDate[key].foodTotal++;

      if (row.taste_good === true) {
        byDate[key].foodGood++;
      }
    }

    if (row.friendly_service !== null) {
      byDate[key].serviceTotal++;

      if (row.friendly_service === true) {
        byDate[key].serviceGood++;
      }
    }
  });

  const trend = Object.values(byDate)
    .sort((a, b) => a.date - b.date)
    .map((day) => {
      return {
        label: day.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),

        food: day.foodTotal
          ? Math.round((day.foodGood / day.foodTotal) * 100)
          : null,

        service: day.serviceTotal
          ? Math.round((day.serviceGood / day.serviceTotal) * 100)
          : null,
      };
    });

  drawTrendChart(trend, container);
}

// ==========================================
// DRAW TREND CHART
// ==========================================

function drawTrendChart(trend, container) {
  const width = 700;
  const height = 320;

  const left = 55;
  const right = 20;
  const top = 20;
  const bottom = 50;

  const graphWidth = width - left - right;

  const graphHeight = height - top - bottom;

  const x = (index) => {
    if (trend.length === 1) {
      return left + graphWidth / 2;
    }

    return left + (index / (trend.length - 1)) * graphWidth;
  };

  const y = (value) => {
    return top + ((100 - value) / 100) * graphHeight;
  };

  let grid = "";

  [0, 25, 50, 75, 100].forEach((value) => {
    const yy = y(value);

    grid += `
          <line
            x1="${left}"
            y1="${yy}"
            x2="${width - right}"
            y2="${yy}"
            class="chart-grid-line"
          ></line>

          <text
            x="${left - 10}"
            y="${yy + 4}"
            text-anchor="end"
            class="chart-axis-label"
          >
            ${value}%
          </text>
        `;
  });

  let foodLine = "";
  let serviceLine = "";

  if (trend.length > 1) {
    const foodPoints = trend
      .map((day, index) =>
        day.food !== null ? `${x(index)},${y(day.food)}` : null
      )
      .filter(Boolean)
      .join(" ");

    const servicePoints = trend
      .map((day, index) =>
        day.service !== null ? `${x(index)},${y(day.service)}` : null
      )
      .filter(Boolean)
      .join(" ");

    foodLine = `
      <polyline
        points="${foodPoints}"
        class="food-line"
      ></polyline>
    `;

    serviceLine = `
      <polyline
        points="${servicePoints}"
        class="service-line"
      ></polyline>
    `;
  }

  let dots = "";

  trend.forEach((day, index) => {
    const xx = x(index);

    if (day.food !== null) {
      dots += `
          <circle
            cx="${xx}"
            cy="${y(day.food)}"
            r="7"
            class="food-point"
          >
            <title>
              ${day.label} - Food Approval: ${day.food}%
            </title>
          </circle>
        `;
    }

    if (day.service !== null) {
      dots += `
          <circle
            cx="${xx}"
            cy="${y(day.service)}"
            r="7"
            class="service-point"
          >
            <title>
              ${day.label} - Service Approval: ${day.service}%
            </title>
          </circle>
        `;
    }
  });

  let labels = "";

  trend.forEach((day, index) => {
    labels += `
        <text
          x="${x(index)}"
          y="${height - 15}"
          text-anchor="middle"
          class="chart-date-label"
        >
          ${day.label}
        </text>
      `;
  });

  container.innerHTML = `
    <svg
      class="approval-chart"
      viewBox="0 0 ${width} ${height}"
    >

      ${grid}

      ${foodLine}

      ${serviceLine}

      ${dots}

      ${labels}

    </svg>
  `;
}

// ==========================================
// SAFE HTML
// ==========================================

function escapeHtml(text) {
  if (!text) {
    return "";
  }

  const div = document.createElement("div");

  div.textContent = String(text);

  return div.innerHTML;
}

// ==========================================
// START
// ==========================================

loadDashboard();
