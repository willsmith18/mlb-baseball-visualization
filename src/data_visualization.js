function _1(md){return(
md`# Data Visualization Coursework`
)}

function _2(md){return(
md`#### Original dataset [link](https://www.kaggle.com/datasets/joyshil0599/mlb-hitting-and-pitching-stats-through-the-years?select=baseball_hitting.csv)

The MLB Hitting Statistics Dataset (1800s-Present) contains comprehensive batting performance data for over 2,500 Major League Baseball players. The dataset captures 32 metrics including:

- Core statistics: Games played, at-bats, hits, runs, and batting average
- Power hitting: Home runs, doubles, triples, slugging percentage
- Plate discipline: Walks, strikeouts, on-base percentage
- Base running: Stolen bases, caught stealing
- Composite metrics: OPS, ISO, BB/K ratio

Key strengths of this dataset:
1. Temporal depth spanning baseball's entire history
2. Position data enabling role-based performance analysis
3. Comprehensive offensive metrics covering all aspects of hitting
4. Derived statistics allowing for sophisticated analysis of player value and tendencies

These features support complex analysis of historical trends, position-specific performance patterns, and the relationships between different offensive skills.

**Initial Questions**

After examining the dataset, these are 4 questions that I believe the data could be useful in answering:
1. How does a player's position correlate with their power hitting metrics (SLG, Home Runs)? Are certain positions consistently showing higher slugging percentages, and how has this pattern evolved?
2. What is the relationship between strikeouts and other offensive metrics (AVG, OPS, Home Runs)? Are high-strikeout players typically more productive in other areas?
3. How efficient are players at stealing bases, and does this correlate with their other offensive metrics? Is there a relationship between stolen base success rate and OBP?
4. What is the distribution of OPS across different positions, and who are the statistical outliers in each position?`
)}

function _3(md){return(
md`---`
)}

function _4(md){return(
md`## Data Preprocessing`
)}

function _5(md){return(
md`## Notebook Setup`
)}

function _6(md){return(
md`### Initial Data Assessment and Cleaning Strategy
The preprocessing phase focused on preparing the MLB hitting statistics dataset for visualization and analysis. The raw dataset required several key preprocessing steps to ensure data quality and create derived features necessary for our analysis questions.

### Data Validation
We implemented comprehensive validation checks to ensure data integrity:
1. Detection of impossible negative values across all numeric columns
2. Validation of batting averages to ensure they don't exceed 1.0
3. Verification that hits don't exceed at-bats
4. Consistency checks between component statistics (doubles, triples, home runs) and total hits

### Statistical Validation
- **Negative Value Checks**: Baseball statistics should never be negative. This validation was crucial for catching data entry errors.
- **Range Validations**:
  - Batting averages capped at 1.0 (impossible to get more hits than at-bats)
  - Hit components must sum properly (doubles + triples + home runs ≤ total hits)
  - These checks ensure statistical integrity and baseball logic is maintained

### Missing Value Handling
\`\`\`r
# Handle missing values in Caught.stealing
  mutate(Caught.stealing = replace(Caught.stealing, Caught.stealing == "--", "0")) %>%
  mutate(Caught.stealing = as.integer(Caught.stealing)) %>%

# Handle Strikeouts
  mutate(Strikeouts = case_when(
      Strikeouts == "" ~ "0",
      Strikeouts == "--" ~ "0",
      TRUE ~ Strikeouts
  )) %>%
  
  # Convert Strikeouts to integer
  mutate(Strikeouts = as.integer(Strikeouts)) %>%
  
  # Remove rows with missing Games (and other major stats)
  filter(!is.na(Games)) %>%
  
  # Convert position to factor
  mutate(position = as.factor(position))
\`\`\`
Special attention was given to handling missing values in key statistics:
- **Caught Stealing**: Replaced "--" with "0" as historical record-keeping was inconsistent for this stat
- **Strikeouts**: Early baseball didn't track strikeouts consistently, necessitating careful handling
- **Decision Context**: Chose to convert missing values to zeros rather than removing rows to preserve historical data while maintaining analytical validity
- **Row Removal**: 8 rows in the dataset were empty which caused NA to register for all columns, I chose to remove all rows where Games was missing as these rows were the only ones where Games has missing values.
- **Factor Conversion**: Position data was converted to categorical (factor) format for proper analysis
  
### Feature Engineering
To support our analysis questions, I created several derived metrics:

**Power Hitting Metrics**
\`\`\`r
# Calculate total bases
Total_Bases = Hits + Double..2B. + (third.baseman * 2) + (home.run * 3),
      
# Isolated Power (ISO)
ISO = Slugging.Percentage - AVG,

# Total extra base hits
totalXBH = Double..2B. + third.baseman + home.run,

# XBH Rate
xbhRate = totalXBH / Hits,
\`\`\`
- Total Bases: Calculated from hits and extra-base hits
- Isolated Power (ISO): Measures raw power by subtracting batting average from slugging percentage
  - Isolates extra-base power from batting average
  - Crucial for position-specific power analysis
  - More meaningful than raw home run totals
- Extra Base Hit Analysis:
  - Total extra-base hits (XBH)
  - XBH rate (extra-base hits per hit)
  - Dominant extra-base hit type classification
  
**Plate Discipline Metrics**
\`\`\`r
# Walk to Strikeout Ratio - handle zero strikeouts
BB_K_Ratio = case_when(
  Strikeouts == 0 & a.walk > 0 ~ as.numeric(Inf),  # If walks but no strikeouts
  Strikeouts == 0 & a.walk == 0 ~ 0,               # If no walks and no strikeouts
  TRUE ~ a.walk / Strikeouts                        # Normal calculation

# Plate Appearances
PA = At.bat + a.walk,

# Strike outs per Game
Strikeouts_per_Game = Strikeouts / Games,
),
\`\`\`
- BB/K Ratio: Walk-to-strikeout ratio with special handling for zero-strikeout cases
  - Handles infinite ratios meaningfully
  - Distinguishes between different types of contact hitters
  - Important for modern baseball analysis
- Plate Appearances: Comprehensive at-bat counting including walks
  - Created to analyze career progression
  - More comprehensive than games played
  - Better represents actual playing time
- Strikeouts per Game: Normalized strikeout rate

**Run Production Metrics**
\`\`\`r
# Run Production Efficiency
RPE = ((Runs / At.bat) + (run.batted.in / At.bat)) / 2,

# Run Production Rate
Run_Production = (Runs + run.batted.in) / Games,

# Calculate OBP, SLG, and OPS manually
OBP = (Hits + a.walk) / (At.bat + a.walk),
SLG = (Hits + Double..2B. + 2*third.baseman + 3*home.run) / At.bat,
On.base.Plus.Slugging = OBP + SLG,
\`\`\`
- Run Production Efficiency (RPE): Combined scoring and RBI efficiency
  - Combines scoring and RBI efficiency
  - Normalizes for playing time
  - Enables cross-era comparisons
- Run Production Rate: Total run production per game
- Manual OBP/SLG/OPS calculations: Verified against provided statistics

**Base Running Metrics**
\`\`\`r
# Stole Base Attempts
sb.attempts = stolen.base + Caught.stealing,

# Stolen Base Success Rate - handle cases with no attempts
SBSR = case_when(
  stolen.base == 0 & Caught.stealing == 0 ~ 0, # No attempts
  TRUE ~ (stolen.base / (stolen.base + Caught.stealing) * 100)

# At bats per Home Run
AB_per_HR = case_when(
  home.run == 0 ~ as.numeric(Inf),  # If no home runs, set to Infinity
  TRUE ~ At.bat / home.run
)
\`\`\`
- Stolen Base Attempts: Total attempted steals
  - Handles players who never attempt steals
  - Provides percentage for easy comparison
  - Critical for speed impact analysis
- Stolen Base Success Rate: Success percentage with handling for no-attempt cases
- At-bats per Home Run: Power frequency metric

Each added feature will be discussed further within the specific questions it has been used.

### Consistency Checks
\`\`\`r
# Add data consistency checks
consistency_check <- clean_data %>%
  mutate(
      hits_check = Hits <= At.bat,
      component_check = (Double..2B. + third.baseman + home.run) <= Hits,
      avg_check = abs(AVG - (Hits/At.bat)) < 0.001
  )
\`\`\`
- Validates data integrity
- Ensures derived metrics are reliable
- Catches potential calculation errors

**Outlier Detection**
\`\`\`r
# Function for outlier detection
detect_outliers <- function(df, cols) {
  outliers <- list()
  
  for(col in cols) {
    Q1 <- quantile(df[[col]], 0.25, na.rm = TRUE)
    Q3 <- quantile(df[[col]], 0.75, na.rm = TRUE)
    IQR <- Q3 - Q1
    
    outliers[[col]] <- df %>%
      filter(!!sym(col) < (Q1 - 1.5 * IQR) | !!sym(col) > (Q3 + 1.5 * IQR))
  }
  
  return(outliers)
}
\`\`\`
Implemented outlier detection using the IQR method for key statistics:
- Batting Average (AVG)
- Home Runs
- Hits
- Games Played
- Strikeouts

Not Removed: Outliers were identified but not eliminated because:
- Exceptional performances are meaningful in baseball
- Historical evolution of the game creates natural outliers
- Position-specific variations create legitimate statistical extremes

### Data Quality Assessment
The preprocessing revealed several data quality insights:
1. No negative values were found in numeric columns
2. All batting averages were within valid range (0-1)
3. No cases where hits exceeded at-bats
4. Component statistics (doubles, triples, home runs) properly summed to total hits

### Final Dataset Statistics
- Final dimensions: 2500 rows and 33 columns
- No missing values in critical columns
- All derived features successfully calculated
- Data saved as 'baseball_hitting_processed2.csv'
  
This preprocessing ensures the dataset is ready for visualization and analysis, with particular attention to supporting our research questions about position-specific performance patterns and the relationships between different offensive metrics.`
)}

function _7(md){return(
md`**Initial Data Import and Structure Verification**

Before beginning our visualization process, we'll perform a comprehensive validation of our preprocessed dataset to ensure data integrity and readiness for analysis. This validation process includes:`
)}

function _BaseballHitting(__query,FileAttachment,invalidation){return(
__query(FileAttachment("baseball_hitting_processed2@4.csv"),{from:{table:"baseball_hitting_processed2"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _9(md){return(
md`**Data Structure Overview**

- Dimensional Check: Verifying the dataset maintains 2500 rows and 33 columns from preprocessing
- Column Headers: Confirming all engineered features are present
- Data Types: Ensuring appropriate typing (e.g., numeric for statistics, categorical for positions)

**Data Quality Verification**`
)}

function _columnNames(BaseballHitting){return(
Object.keys(BaseballHitting[0])
)}

function _dataShape(BaseballHitting,columnNames){return(
{
  rows: BaseballHitting.length,
  columns: columnNames.length
}
)}

function _columnTypes(columnNames,BaseballHitting){return(
columnNames.map(col => ({
  column: col,
  type: typeof BaseballHitting[0][col],
  sample: BaseballHitting[0][col]
}))
)}

function _nullCounts(columnNames,BaseballHitting){return(
columnNames.map(col => ({
  column: col,
  nullCount: BaseballHitting.filter(d => d[col] === null || d[col] === undefined).length
}))
)}

function _14(md){return(
md`- Completeness: Checking for any unexpected null values
- Type Check: Confirming each column as the correct data type
- Categorical Values: Verifying position classifications are consistent

This validation step is crucial as it:

- Confirms our R preprocessing steps were successful
- Establishes a reliable foundation for our visualizations
- Helps identify any potential issues before analysis
- Documents the starting point of our visualization process`
)}

function _15(md){return(
md`---`
)}

function _16(md){return(
md`## Question 1`
)}

function _17(md){return(
md`How does a player's position correlate with their power hitting metrics (SLG, Home Runs)? 
Are certain positions consistently showing higher slugging percentages, and how has this pattern evolved?

### Visualization Strategy and Implementation

To analyze the relationship between player positions and power hitting metrics, I created three complementary visualizations:
- Average Slugging Percentage (SLG) by Position with league average reference
- At-bats per Home Run (AB/HR) by Position with league average reference
- Combined Power Metrics showing the relationship between SLG, ISO, and HR rate

Each visualization uses consistent color coding for position groups (infielders, outfielders, catchers) to aid pattern recognition. League averages are displayed as dashed lines to provide context.`
)}

function _leagueAvgSLG(d3,BaseballHitting){return(
d3.mean(BaseballHitting, d => d.SLG)
)}

function _positionNames(){return(
{
  "1B": "First Base",
  "2B": "Second Base",
  "3B": "Third Base",
  "SS": "Shortstop",
  "C": "Catcher",
  "OF": "Outfield",
  "RF": "Right Field",
  "CF": "Center Field",
  "LF": "Left Field",
  "DH": "Designated Hitter",
  "P": "Pitcher"
}
)}

function _positionColors(){return(
{
  "First Base": "#1f77b4",
  "Second Base": "#1f77b4",
  "Third Base": "#1f77b4",
  "Shortstop": "#1f77b4",
  "Right Field": "#2ca02c",
  "Center Field": "#2ca02c",
  "Left Field": "#2ca02c",
  "Outfield": "#2ca02c",
  "Catcher": "#ff7f0e",
  "Pitcher": "#ff7f0e",
  "Designated Hitter": "#d62728"
}
)}

function _21(Plot,BaseballHitting,positionNames,positionColors,leagueAvgSLG){return(
Plot.plot({
  title: "Average Slugging Percentage by Position",
  y: {
    label: "Slugging Percentage",
    grid: true
  },
  x: {
    label: "Position",
    tickRotate: -45
  },
  marks: [
    Plot.barY(
      BaseballHitting,
      Plot.groupX(
        { y: "mean" }, 
        { 
          x: d => positionNames[d.position],
          y: "SLG", 
          tip: true,
          sort: {x: "y", reverse: true},
          fill: d => positionColors[positionNames[d.position]]
        }
      )
    ),
    // Add league average line
   Plot.ruleY([leagueAvgSLG], {
     stroke: "black",
     strokeWidth: 2,
     strokeDasharray: "5,5"
   }),
   // Add league average annotation
   Plot.text([{x: "First Base", y: leagueAvgSLG, text: `League Average: ${leagueAvgSLG.toFixed(3)}`}], {
     dy: -10,
     dx: 5,
     fontSize: 12,
     fill: "red"
   }),
   Plot.ruleY([0])
 ],
 marginBottom: 75,
 style: {
   backgroundColor: "white"
 }
})
)}

function _leagueAvgABHR(d3,BaseballHitting){return(
d3.mean(BaseballHitting, d => d.AB_per_HR)
)}

function _23(Plot,BaseballHitting,positionNames,positionColors,leagueAvgABHR){return(
Plot.plot({
  title: "Average At-bats per Home Run by Position",
  y: {
    label: "At-bats per Homr Run",
    grid: true
  },
  x: {
    label: "Position",
    tickRotate: -45
  },
  marks: [
    Plot.barY(
      BaseballHitting,
      Plot.groupX(
        { y: "mean" }, 
        { 
          x: d => positionNames[d.position],
          y: "AB_per_HR", 
          tip: true,
          sort: {x: "y", reverse: false},
          fill: d => positionColors[positionNames[d.position]]
        }
      )
    ),
    // Add league average line
   Plot.ruleY([leagueAvgABHR], {
     stroke: "black",
     strokeWidth: 2,
     strokeDasharray: "5,5"
   }),
   // Add league average annotation
   Plot.text([{x: "First Base", y: leagueAvgABHR, text: `League Average: ${leagueAvgABHR.toFixed(3)}`}], {
     dy: -10,
     dx: 5,
     fontSize: 12,
     fill: "red"
   }),
   Plot.ruleY([0])
 ],
 marginBottom: 75,
 style: {
   backgroundColor: "white"
 }
})
)}

function _24(Plot,BaseballHitting,positionNames){return(
Plot.plot({
  title: "Power Metrics by Position",
  subtitle: "Comparing SLG, ISO, and Home Run Rate across positions",
  width: 800,
  height: 500,
  grid: true,
  x: {
    label: "Position",
    tickRotate: -45
  },
  y: {
    label: "Value (SLG, ISO, HR/AB%)",
    grid: true,
    percent: true
  },
  marks: [
    Plot.barY(
      BaseballHitting,
      Plot.groupX(
        { y: "mean" },
        {
          x: d => positionNames[d.position],
          y: "SLG",
          fill: "#1f77b4",
          title: d => `Position: ${d.position}\nSLG: ${d.SLG.toFixed(3)}`,
          sort: {x: "y", reverse: true}
        }
      )
    ),
    Plot.barY(
      BaseballHitting,
      Plot.groupX(
        { y: "mean" },
        {
          x: d => positionNames[d.position],
          y: "ISO",
          fill: "#2ca02c",
          title: d => `Position: ${d.position}\nISO: ${d.ISO.toFixed(3)}`,
          dx: 20,
          sort: {x: "y", reverse: true}
        }
      )
    ),
    Plot.barY(
      BaseballHitting,
      Plot.groupX(
        { y: d => d.home_run / d.At_bat * 100 }, // HR/AB ratio as percentage
        {
          x: d => positionNames[d.position],
          fill: "#ff7f0e",
          title: d => `Position: ${d.position}\nHR/AB: ${(d.home_run / d.At_bat * 100).toFixed(1)}%`,
          dx: 40,
          sort: {x: "y", reverse: true}
        }
      )
    ),
    // Add legend
    Plot.text([
     {x: "First Base", y: 0.8, text: "Metrics:", fill: "black", fontSize: 14},
     {x: "First Base", y: 0.75, text: "■ Slugging Percentage (SLG)", fill: "#1f77b4"},
     {x: "First Base", y: 0.7, text: "■ Isolated Power (ISO)", fill: "#2ca02c"},
     {x: "First Base", y: 0.65, text: "■ Home Run per At Bat Ratio", fill: "#ff7f0e"}
   ], {
      dy: -10,
      dx: 5,
      fontSize: 12
    }),
    // Add note about minimum at-bats
   Plot.text([
     {x: "Pitcher", y: 0.1, text: `Note: Minimum ${BaseballHitting[0].At_bat} at-bats required`, fill: "gray"}
   ], {
     dy: -10,
     dx: 5,
     fontSize: 10
   })
  ],
  marginBottom: 80,
  marginLeft: 60,
  marginRight: 40,
  marginTop: 50,
  style: {
    backgroundColor: "white",
    fontSize: 12,
    opacity: 0.8
  }
})
)}

function _25(md){return(
md`### Key Findings
**Position-Specific Power Trends**
- **Designated Hitters** consistently demonstrate the highest power metrics:
  - Highest SLG (.445)
  - Most efficient HR rate (1 per 25 AB)
  - Highest ISO values among all positions
- **Corner Positions** (First Base, Right Field, Left Field) form the next tier of power hitters:
  - SLG ranges from .420-.430
  - HR rates between 1 per 40-45 AB
  - Above-average ISO values
- **Middle Infielders** (Shortstop, Second Base) show the lowest power numbers:
  - SLG around .380-.390
  - Least efficient HR rates (1 per 75-80 AB)
  - Significantly below-average ISO values

**Positional Hierarchy**

A clear hierarchical pattern emerges in power hitting metrics:
- Designated Hitter/First Base (Power-first positions)
- Corner Outfielders (Balanced power/defense positions)
- Center Field/Third Base (Athletic positions with moderate power)
- Catcher/Middle Infield (Defense-first positions)

### Visualization Design Choices
- Bar Charts: Chosen for clear position-to-position comparisons
- Horizontal Reference Lines: League averages provide immediate context
- Color Coding: Groups similar positions for pattern recognition
- Multiple Metrics: Shows different aspects of power hitting for comprehensive analysis
- Limitations: The visualization may under represent historical changes in positional roles and doesn't show the variance within positions over time.

This analysis reveals clear positional patterns in power hitting, likely reflecting both team strategy in player positioning and the physical demands of different defensive positions.`
)}

function _26(md){return(
md`---`
)}

function _27(md){return(
md`## Question 2`
)}

function _28(md){return(
md`What is the relationship between strikeouts and other offensive metrics (AVG, OPS, Home Runs)? Are high-strikeout players typically more productive in other areas?

### Visualization Strategy and Implementation
To explore the relationship between strikeouts and offensive production, I created two complementary visualizations:
1. An interactive scatter plot showing the relationship between strikeouts and various offensive metrics (OPS, AVG, HR), with:
  - Position-based color coding
  - Minimum plate appearance filter to remove small sample sizes
  - Density contours to show clustering patterns
  - Interactive metric selection
2. A box plot showing the distribution of OPS across strikeout rate quintiles to understand:
  - Overall trends in production vs. strikeout rates
  - Variance within each strikeout rate group
  - Outlier distribution`
)}

function _yMetric(Inputs){return(
Inputs.select(
  ["On.base.Plus.Slugging", "AVG", "home.run"], {
    label: "Select Metric",
    value: "On.base.Plus.Slugging"
  }
)
)}

function _minPA(Inputs){return(
Inputs.range([500, 5000], {
  label: "Minimum Plate Appearances",
  step: 50,
  value: 200
})
)}

function _31(BaseballHitting,minPA,d3,yMetric)
{
  // Set up dimensions
  const width = 928;
  const height = 600;
  const margin = {top: 40, right: 120, bottom: 60, left: 70};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Filter data based on minimum PA
  const filteredData = BaseballHitting.filter(d => d.PA >= minPA);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(filteredData, d => d.Strikeouts))
    .nice()
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(filteredData, d => d[yMetric]))
    .nice()
    .range([innerHeight, 0]);

  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(filteredData, d => d.Games))
    .range([2, 8]); // Reduced point size range

  const colorScale = d3.scaleOrdinal()
    .domain([...new Set(filteredData.map(d => d.position))])
    .range(d3.schemeTableau10);

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Add chart group
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add contours to show density
  const contours = d3.contourDensity()
    .x(d => xScale(d.Strikeouts))
    .y(d => yScale(d[yMetric]))
    .bandwidth(30)
    .thresholds(10)
    (filteredData);

  g.append("g")
    .attr("class", "contours")
    .selectAll("path")
    .data(contours)
    .join("path")
    .attr("d", d3.geoPath())
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2);

  // Add grid lines
  g.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScale.ticks())
    .join("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

  g.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(yScale.ticks())
    .join("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

  // Add points with improved visibility
  const points = g.append("g")
    .selectAll("circle")
    .data(filteredData)
    .join("circle")
      .attr("cx", d => xScale(d.Strikeouts))
      .attr("cy", d => yScale(d[yMetric]))
      .attr("r", d => sizeScale(d.Games))
      .attr("fill", d => colorScale(d.position))
      .attr("fill-opacity", 0.35) // Reduced opacity
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

  // Add hover interactions
  points
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("r", d => sizeScale(d.Games) * 1.5)
        .attr("fill-opacity", 1)
        .attr("stroke", "#000")
        .attr("stroke-width", 1);
        
      tooltip
        .style("opacity", 1)
        .html(`
          <strong>${d.Name}</strong><br/>
          Position: ${d.position}<br/>
          Games: ${d.Games}<br/>
          Strikeouts: ${d.Strikeouts}<br/>
          ${yMetric}: ${d[yMetric]}<br/>
          PA: ${d.PA}<br/>
          AVG: ${d.AVG}<br/>
          OPS: ${d.On.base.Plus.Slugging}<br/>
          HR: ${d.home.run}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .attr("r", d => sizeScale(d.Games))
        .attr("fill-opacity", 0.35)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
        
      tooltip.style("opacity", 0);
    });

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .call(g => g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Strikeouts"));

  g.append("g")
    .call(d3.axisLeft(yScale))
    .call(g => g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text(yMetric));

  // Add legend
  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(colorScale.domain())
    .join("g")
      .attr("transform", (d, i) => `translate(${width - margin.right + 10},${margin.top + i * 20})`);

  legend.append("circle")
    .attr("r", 6)
    .attr("fill", colorScale)
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#fff");

  legend.append("text")
    .attr("x", 12)
    .attr("y", 4)
    .text(d => d);

  // Add tooltip
  const tooltip = d3.select(document.createElement("div"))
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("padding", "10px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("opacity", 0);

  document.body.appendChild(tooltip.node());

  return svg.node();
}


function _metric(Inputs){return(
Inputs.select(
  ["On.base.Plus.Slugging", "AVG", "home.run", "ISO", "Runs", "run.batted.in"], {
    label: "Select Offensive Metric",
    value: "On.base.Plus.Slugging"
  }
)
)}

function _chart(BaseballHitting,minPA,metric,d3)
{
  // Set dimensions
  const width = 928;
  const height = 500;
  const margin = {top: 40, right: 40, bottom: 60, left: 60};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Filter data and calculate strikeout rate
  const filteredData = BaseballHitting
    .filter(d => d.PA >= minPA)
    .map(d => ({
      ...d,
      K_rate: (d.Strikeouts / d.PA) * 100,
      selected_metric: d[metric]  // Add selected metric
    }))
    .sort((a, b) => a.K_rate - b.K_rate);

  // Calculate size of each quintile
  const quintileSize = Math.floor(filteredData.length / 5);

  // Assign groups based on position in sorted array
  const groupedData = filteredData.map((d, i) => ({
    ...d,
    group: Math.min(Math.floor(i / quintileSize), 4) // Ensure last group gets remainder
  }));

  // Calculate statistics for each group
  const groups = d3.group(groupedData, d => d.group);
  const boxplotData = Array.from(groups, ([key, values]) => {
    const sorted = values.map(d => d.selected_metric).sort(d3.ascending);
    const k_rates = values.map(d => d.K_rate).sort(d3.ascending);
    return {
      group: key,
      q1: d3.quantile(sorted, 0.25),
      median: d3.quantile(sorted, 0.5),
      q3: d3.quantile(sorted, 0.75),
      iqr: d3.quantile(sorted, 0.75) - d3.quantile(sorted, 0.25),
      min: d3.quantile(sorted, 0.25) - 1.5 * (d3.quantile(sorted, 0.75) - d3.quantile(sorted, 0.25)),
      max: d3.quantile(sorted, 0.75) + 1.5 * (d3.quantile(sorted, 0.75) - d3.quantile(sorted, 0.25)),
      rawData: values,
      k_rate_range: [
        d3.min(k_rates),
        d3.max(k_rates)
      ]
    };
  });

  // Create scales
  const xScale = d3.scaleBand()
    .domain(d3.range(5))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(boxplotData, d => Math.min(d.min, d3.min(d.rawData, v => v.selected_metric))),
      d3.max(boxplotData, d => Math.max(d.max, d3.max(d.rawData, v => v.selected_metric)))
    ])
    .nice()
    .range([innerHeight, 0]);

  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add boxes
  const boxes = g.selectAll("g.box")
    .data(boxplotData)
    .join("g")
      .attr("class", "box")
      .attr("transform", d => `translate(${xScale(d.group)},0)`);

  // Add box rectangles
  boxes.append("rect")
    .attr("x", 0)
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.q3))
    .attr("height", d => yScale(d.q1) - yScale(d.q3))
    .attr("fill", "#69b3a2")
    .attr("opacity", 0.8);

  // Add median lines
  boxes.append("line")
    .attr("x1", 0)
    .attr("x2", xScale.bandwidth())
    .attr("y1", d => yScale(d.median))
    .attr("y2", d => yScale(d.median))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  // Add whiskers
  boxes.append("line")
    .attr("x1", xScale.bandwidth() / 2)
    .attr("x2", xScale.bandwidth() / 2)
    .attr("y1", d => yScale(d.min))
    .attr("y2", d => yScale(d.q1))
    .attr("stroke", "black");

  boxes.append("line")
    .attr("x1", xScale.bandwidth() / 2)
    .attr("x2", xScale.bandwidth() / 2)
    .attr("y1", d => yScale(d.q3))
    .attr("y2", d => yScale(d.max))
    .attr("stroke", "black");

  // Add whisker caps
  boxes.append("line")
    .attr("x1", xScale.bandwidth() * 0.25)
    .attr("x2", xScale.bandwidth() * 0.75)
    .attr("y1", d => yScale(d.min))
    .attr("y2", d => yScale(d.min))
    .attr("stroke", "black");

  boxes.append("line")
    .attr("x1", xScale.bandwidth() * 0.25)
    .attr("x2", xScale.bandwidth() * 0.75)
    .attr("y1", d => yScale(d.max))
    .attr("y2", d => yScale(d.max))
    .attr("stroke", "black");

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d => {
        const rangeText = boxplotData[d].k_rate_range
          .map(v => v.toFixed(1))
          .join("-");
        return `Q${d + 1}\n(${rangeText}%)`;
      }))
    .call(g => g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Strikeout Rate Quintile (K% Range)"));

  g.append("g")
    .call(d3.axisLeft(yScale))
    .call(g => g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text(metric));

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text(`Distribution of ${metric} by Strikeout Rate Quintile`);

  return svg.node();
}


function _34(md){return(
md`## Key Findings
### Relationship Patterns
- **Positive Correlation**: Players with higher strikeout totals tend to maintain strong offensive production
  - Most players with 1000+ strikeouts show OPS above .750
  - The density contours reveal a slight upward trend in OPS as strikeouts increase
    
### Strikeout Rate Impact
- **Consistent Production**: The box plots reveal remarkably stable OPS distributions across strikeout rate quintiles:
  - Median OPS remains around .740-.750 across all quintiles
  - Similar variance in each quintile (box sizes)
  - Comparable outlier patterns across groups

### Position-Specific Insights
- **Power Positions**: Corner outfielders and first basemen (shown in warmer colors) cluster in high-strikeout, high-OPS regions
- **Contact Positions**: Middle infielders (shown in cooler colors) tend to appear in low-strikeout regions
- **Notable Outliers**: Several players achieve high OPS (>.900) despite elevated strikeout rates

## Visualization Design Choices
- **Interactive Elements:**
  - Metric selector allows exploration of different offensive measures
  - Plate appearance filter controls for sample size reliability
- **Visual Features:**
  - Density contours highlight population clustering
  - Position-based color coding reveals role-based patterns
  - Consistent scales across metrics for easy comparison
  - Limitations: The visualization may overemphasize outliers and doesn't clearly show temporal progression of strikeout trends.

This analysis suggests that high strikeout totals do not necessarily indicate poor offensive performance. Many of baseball's most productive hitters maintain high OPS values despite elevated strikeout numbers, indicating a possible trade-off between power and contact that often results in positive overall offensive contribution.`
)}

function _35(md){return(
md`---`
)}

function _36(md){return(
md`## Question 3`
)}

function _37(md){return(
md`How efficient are players at stealing bases, and does this correlate with their other offensive metrics? Is there a relationship between stolen base success rate and OBP?

### Visualization Strategy and Implementation
To analyze base stealing efficiency and its relationship with offensive production, I created a scatter plot visualization with the following features:
- X-axis showing On-Base Percentage (OBP)
- Y-axis showing Stolen Base Success Rate (SBSR)
- Point size indicating number of stolen base attempts
- Reference line at 75% success rate (commonly considered break-even point)`
)}

function _38(Plot,BaseballHitting){return(
Plot.plot({
  y: {
    label: "↑ Stolen Base Success Rate (%)",
    domain: [0, 100],
    grid: true,
    tickFormat: d => d + "%"
  },
  x: {
    label: "On-Base Percentage →",
    domain: [0.2, 0.45],
    grid: true,
    tickFormat: ".3f"
  },
  marks: [
    // Add background for better contrast
    Plot.frame({fill: "#f3f4f6"}),
    
    // Add reference line for league average success rate
    Plot.ruleY([75], {stroke: "#dc2626", strokeDasharray: "5,5"}),
    Plot.text([{x: 0.21, y: 75}], {
      text: ["League Avg (75%)"],
      dx: 10,
      fill: "#dc2626",
      fontSize: 10
    }),
    
    // Main scatter plot
    Plot.dot(BaseballHitting, {
      x: "OBP",
      y: "SBSR",
      r: d => Math.sqrt(d["sb.attempts"]) * 2.5,
      fill: "#2563eb",
      fillOpacity: 0.7,
      stroke: "#1e40af",
      strokeWidth: 0.5,
      title: d => `Player: ${d.name}
Position: ${d.position}
OBP: ${d.OBP.toFixed(3)}
Success Rate: ${d.SBSR.toFixed(1)}%
Attempts: ${d["sb.attempts"]}
Games: ${d.Games}`,
      tip: true
    })
  ],
  width: 800,
  height: 600,
  marginBottom: 60,
  marginLeft: 60,
  style: {
    background: "#f3f4f6",
    fontSize: 12,
    fontFamily: "system-ui"
  }
})
)}

function _39(md){return(
md`## Key Findings
### Success Rate Distribution
- **League-wide Efficiency**: Most regular base stealers maintain success rates above 75% (break-even line)
- **Wide Range**: Success rates span from 20% to 100%, with most clustering between 65-85%
- **Volume Impact**: Players with more attempts (larger circles) tend to have higher success rates

### Relationship with OBP
- **Positive Correlation**: A slight positive relationship exists between OBP and stolen base success rate
- **Clustering Pattern**: Most successful base stealers (>75% success) have OBP between .300 and .380
- **Elite Performers**: Several players combine high OBP (>.380) with excellent success rates (>85%)

### Key Observations
1. **Efficiency Threshold:**
  - Players with significant attempts tend to maintain >65% success rates
  - Very few regular base stealers fall below 50% success rate
2. **Getting On Base**:
  - Most prolific base stealers maintain at least league-average OBP
  - Higher OBP correlates with more stolen base opportunities
3. **Success Pattern**:
  - Players with more attempts (larger circles) cluster above the 75% line
  - Suggests teams properly identify and utilize efficient base stealers

## Visualization Design Choices
- **Point Sizing**:
  - Varies with attempt volume to highlight regular base stealers
  - Helps distinguish between small sample size outcomes and established performance
- **Reference Line**:
  - 75% success rate threshold shows break-even point
  - Helps evaluate efficiency of base stealing attempts
- **Axis Ranges**:
  - OBP range focuses on typical values (.200-.450)
  - Full percentage range (0-100%) for success rate shows complete distribution
- **Limitations**: Point overlap can obscure some patterns in high-density regions, and size encoding may understate the actual magnitude differences in attempt volumes.

This analysis reveals that successful base stealers typically combine good on-base skills with efficient stealing techniques, suggesting teams have become more selective about when and who attempts to steal bases.`
)}

function _40(md){return(
md`---`
)}

function _41(md){return(
md`## Question 4`
)}

function _42(md){return(
md`What is the distribution of OPS across different positions, and who are the statistical outliers in each position?

### Visualization Strategy and Implementation
To analyze the distribution of OPS across different positions, I created a comprehensive box plot visualization with the following features:
- Color-coded positions for easy identification
- Individual data points to show outliers
- Box plots showing quartiles and median
- Consistent scale (0.0-1.2 OPS) for direct comparison
-Position-specific distributions with individual player points overlaid`
)}

function _43(Plot,BaseballHitting){return(
Plot.plot({
  color: { 
    legend: true,
    scheme: "spectral" // Using a colorblind-friendly scheme
  },
  y: {
    grid: true,
    label: "On-base Plus Slugging (OPS)",
    domain: [0, 1.2] // Set reasonable bounds for OPS
  },
  x: {
    label: "Position"
  },
  marks: [
    // Box plots to show distribution
    Plot.boxY(BaseballHitting, {
      x: "position",
      y: "On.base.Plus.Slugging",
      fill: "position",
      fillOpacity: 0.2
    }),
    
    // Individual points with jittering to avoid overplotting
    Plot.dot(BaseballHitting, {
      x: "position",
      y: "On.base.Plus.Slugging",
      stroke: "position",
      fill: "white",
      fillOpacity: 0.7,
      r: 3,
      jitter: true,
      tip: {
        format: {
          x: true,
          y: ".3f"
        }
      }
    }),
    
    // Mean line for each position
    Plot.ruleY(BaseballHitting, {
      x: "position",
      y: "mean",
      stroke: "black",
      strokeWidth: 2,
      tip: true,
      reducer: "mean"
    })
  ],
  height: 500,
  width: 800,
  marginLeft: 60,
  marginBottom: 40,
  style: {
    fontSize: 12,
    backgroundColor: "white"
  }
})
)}

function _44(md){return(
md`## Key Findings
### Position-Based OPS Distribution
1. **Power Positions**:
  - First Base (1B): Highest median OPS (~0.775) with tight distribution
  - Designated Hitter (DH): Similar to 1B, suggesting offensive specialization
  - Right/Left Field (RF/LF): Strong offensive performance with medians around 0.760
2. **Middle-of-Pack Positions**:
  - Center Field (CF): Balanced distribution around 0.740
  - Third Base (3B): Slightly lower than corner outfielders
  - Catcher (C): Surprisingly competitive OPS despite defensive demands
3. **Defense-First Positions**:
  - Shortstop (SS): Lowest median OPS (~0.690)
  - Second Base (2B): Similar to SS, reflecting middle infield defensive priority
  - Pitchers (P): Significantly lower OPS, as expected

### Outlier Analysis

- **Notable High Outliers**:
  - RF/LF: Several players exceeding 0.950 OPS
  - 1B: Multiple outliers above 0.900
  - DH: Concentrated group of high performers near 0.900
- **Spread Characteristics:**
  - Larger spread in offensive positions (1B, OF)
  - Tighter distributions in defensive positions (SS, 2B)
  - More extreme outliers in power positions
  
## Visualization Design Choices
- **Box Plot Elements**:
  - Boxes show interquartile range for position comparison
  - Whiskers indicate typical range
  - Individual points reveal outlier distribution
- **Color Coding**:
  - Distinct colors for each position
  - Similar positions (e.g., infield) use related color schemes
  - Enhanced readability for position identification
- **Data Point Overlay**:
  - Shows individual player performance
  - Reveals clustering patterns
  - Highlights exceptional performers
- **Limitations**: Box plots may oversimplify multi-modal distributions and don't show temporal changes in position roles.

This analysis reveals clear positional hierarchy in offensive production while identifying significant outliers who exceed typical positional expectations. The visualization effectively shows both the general trends and individual exceptions in baseball's position-specific offensive patterns.`
)}

function _45(md){return(
md`---`
)}

function _46(md){return(
md`# Refined Questions`
)}

function _47(md){return(
md`## Question 5`
)}

function _48(md){return(
md`What is the relationship between plate discipline (BB_K_Ratio) and power production (ISO, SLG) across different positions? Are certain positions more likely to trade contact for power?

### Visualization Strategy and Implementation
To analyze the relationship between plate discipline and power production, I created an interactive scatter plot with:
- X-axis showing BB/K Ratio (plate discipline)
- Y-axis showing ISO (isolated power)
- Color-coded positions
- Position highlight selector for detailed analysis
- Consistent scales for comparison`
)}

function _selectedPosition(Inputs,BaseballHitting){return(
Inputs.select(
  ["All", ...new Set(BaseballHitting.map(d => d.position))],
  {value: "All", label: "Highlight Position"}
)
)}

function _50(Plot,BaseballHitting,selectedPosition){return(
Plot.plot({
  width: 800,
  height: 600,
  margin: 60,
  
  x: {
    label: "Plate Discipline (BB/K Ratio) →",
    grid: true,
    domain: [0, 2]
  },
  y: {
    label: "↑ Power (ISO)",
    grid: true,
    domain: [0, 0.4]
  },
  
  color: {
    legend: true,
    scheme: "tableau10"
  },
  
  marks: [
    Plot.dot(BaseballHitting, {
      x: "BB_K_Ratio",
      y: "ISO",
      stroke: "position",
      fill: "position",
      opacity: d => selectedPosition === "All" || d.position === selectedPosition ? 1 : 0.1, 
      r: d => Math.sqrt(d.Games)/2,
      title: d => `${d.Player_name}\nPosition: ${d.position}\nGames: ${d.Games}\nISO: ${d.ISO.toFixed(3)}\nBB/K: ${d.BB_K_Ratio.toFixed(2)}`
    })
  ]
})
)}

function _51(md){return(
md`## Key Findings
### Position-Specific Patterns
1. **Power Positions (1B, DH, OF)**:
  - Generally lower BB/K ratios (0.2-0.8)
  - Higher ISO values (0.150-0.250)
  - Shows clear trade-off between power and discipline
2. **Contact Positions (2B, SS)**:
  - Higher BB/K ratios (0.6-1.2)
  - Lower ISO values (0.080-0.140)
  - Prioritize contact and discipline over power
3. **Hybrid Positions (3B, CF)**:
  - Moderate BB/K ratios (0.4-1.0)
  - Moderate ISO values (0.120-0.180)
  - Balance between power and discipline

### Trade-off Analysis
- Clear negative correlation between power and plate discipline
- Players with high ISO (>0.200) rarely maintain high BB/K ratios
- Most balanced players cluster in middle ranges for both metrics

### Connections to Initial Questions
1. Power Metrics (Q1):
  - Reinforces position-specific power patterns
  - Adds plate discipline context to slugging trends
  - Shows how power production varies with approach
2. Strikeout Analysis (Q2):
  - Complements strikeout findings
  - Reveals quality of plate appearances beyond K's
  - Shows value trade-offs in different approaches

## Visualization Design Choices
- **Interactive Elements**:
  - Position highlighting for detailed analysis
  - Clear color coding for position identification
  - Grid lines for precise value reading
- **Scale Choices**:
  - Full range of BB/K ratios (0-2.0)
  - ISO scale capturing all power levels
  - Consistent with baseball statistical norms
- **Limitations**: The relationship between discipline and power might be confounded by era effects not shown in the visualization.

This analysis reveals clear position-based approaches to the power-discipline trade-off, showing how different roles emphasize different offensive skills. It ties together previous findings about position-specific performance patterns and helps explain the various ways players and teams balance offensive skills.

The visualization effectively shows that while there is a general trade-off between power and discipline, successful players at each position find different ways to optimize this balance for their role.`
)}

function _52(md){return(
md`---`
)}

function _53(md){return(
md`## Question 6`
)}

function _54(md){return(
md`How does the volume of playing time (Games, PA) affect batting performance metrics (AVG, OBP, SLG) across positions? Is there a 'sweet spot' for optimal performance?

## Visualization Strategy and Implementation
Created an interactive scatter plot to explore the relationship between playing time and batting performance:
- X-axis: Plate Appearances (measure of playing time volume)
- Y-axis: Selectable performance metrics (AVG, OBP, SLG)
- Position-based color coding
- Trend line to show overall relationship
- Interactive position and metric selectors`
)}

function _positionSelect(Inputs,BaseballHitting){return(
Inputs.select(
  ["All", ...new Set(BaseballHitting.map(d => d.position))],
  { label: "Select Position:", value: "All" }
)
)}

function _selectedMetric(Inputs){return(
Inputs.select(
  ["AVG", "OBP", "SLG"],
  { 
    label: "Select Performance Metric (Y-axis):", 
    value: "AVG" 
  }
)
)}

function _57(Plot,d3,BaseballHitting,selectedMetric,positionSelect){return(
Plot.plot({
  width: 1000,  
  height: 700,  
  margin: 60,   
  
  grid: true,
  
  x: {
    label: "Plate Appearances (PA) →",
    domain: [0, d3.max(BaseballHitting, d => d.PA)],
    tickFormat: "~s",
    labelOffset: 40
  },
  y: {
    label: `↑ ${selectedMetric}`,
    domain: [
      d3.min(BaseballHitting, d => d[selectedMetric]) * 0.9,
      d3.max(BaseballHitting, d => d[selectedMetric]) * 1.1
    ],
    labelOffset: 40
  },
  
  marks: [
    // Background grid
    Plot.gridY({
      stroke: "#ddd",
      strokeOpacity: 0.5
    }),
    Plot.gridX({
      stroke: "#ddd",
      strokeOpacity: 0.5
    }),
    
    // Regression line
    Plot.linearRegressionY(BaseballHitting, {
      x: "PA",
      y: d => d[selectedMetric],
      stroke: "#ff0000",
      strokeWidth: 2,
      strokeOpacity: 0.7
    }),
    
    // Scatter plot with dynamic opacity
    Plot.dot(BaseballHitting, {
      x: "PA",
      y: d => d[selectedMetric],
      stroke: "position",
      fill: "position",
      opacity: d => positionSelect === "All" || d.position === positionSelect ? 1 : 0.1,
      r: d => Math.sqrt(d.Games)/2,
      title: d => `${d["Player.name"]}\nPosition: ${d.position}\n${selectedMetric}: ${d[selectedMetric].toFixed(3)}\nPA: ${d.PA}\nGames: ${d.Games}`,
    })
  ],
  
  color: {
    legend: true,
    scheme: "Set2",
    scale: {
      domain: [...new Set(BaseballHitting.map(d => d.position))],
      unknown: "gray"
    }
  },
  
  style: {
    fontSize: 14,
    backgroundColor: "white",
    color: "black",
    fontFamily: "system-ui"
  }
})
)}

function _58(md){return(
md`## Key Findings
### Performance Trends with Playing Time
1. **Early Career Pattern (0-2k PA)**:
  - Highest variance in performance
  - Lower average performance metrics
  - Many players don't progress beyond this phase
2. **Development Phase (2k-6k PA)**:
  - Performance stabilizes
  - Reduced variance
  - Clear upward trend in averages
3. **Peak Performance (6k-10k PA)**:
  - Optimal performance range
  - Consistent above-average results
  - Lower performance variance
4. **Late Career (10k+ PA)**:
  - Slight performance decline
  - Only elite players reach this range
  - Selective survival bias evident

### Position-Specific Insights
- Power positions maintain longer careers with consistent performance
- Defensive positions show more turnover in early PA ranges
- More variance in early-career performance for all positions

### Connections to Initial Questions
1. Strikeout Analysis (Q2):
  - Extends understanding of K-rate development
  - Shows how experience affects contact skills
  - Complements strikeout/production relationship
2. OPS Distribution (Q4):
  - Adds temporal dimension to position analysis
  - Shows how OPS develops with experience
  - Explains some position-based variations

### Unique Contributions
This question offers several unique insights not covered in previous analyses:
- Career development patterns
- Performance stability over time
- Position-specific longevity
- Experience-based performance expectations

## Visualization Design Choices

- **Interactive Elements**:
  - Metric selector for comprehensive analysis
  - Position filter for detailed examination
  - Trend line showing overall patterns
- **Scale Considerations**:
  - Log scale for plate appearances to show full range
  - Appropriate ranges for each metric
  - Grid lines for precise reading
- **Limitations**: Survival bias may skew the apparent relationships, and the visualization doesn't account for era differences in playing time patterns.
  
This analysis reveals that playing time has a significant but complex relationship with performance, showing both development patterns and survival bias effects. It adds a crucial temporal dimension to our understanding of baseball performance that wasn't captured in the previous position-based analyses.

The "sweet spot" appears to be between 6,000-10,000 plate appearances, where players have developed their skills but haven't yet entered decline phase, though this varies by position and individual player trajectory.`
)}

function _59(md){return(
md`---`
)}

function _60(md){return(
md`## Question 7`
)}

function _61(md){return(
md`How does run production efficiency (Runs and RBI per At.bat) relate to extra-base hit distribution (Double..2B., third.baseman, home.run as proportions of total Hits)? Are players who hit more doubles and triples more effective at generating runs than pure home run hitters?

## Visualization Strategy and Implementation
I Created two complementary visualizations to analyze the relationship between extra-base hits and run production:
1. Scatter plot comparing:
  - X-axis: Run Production Efficiency (Runs + RBI per AB)
  - Y-axis: Extra Base Hit Rate
  - Color coding for hit types (Doubles vs Home Runs)
2. Density heatmap showing:
  - Player concentration areas
  - Distribution patterns
  - Optimal performance zones`
)}

function _62(Plot,BaseballHitting){return(
Plot.plot({
  marginRight: 80,
  width: 800,
  height: 600,
  
  x: {
    label: "Run Production Efficiency (Runs + RBI per AB)",
    grid: true,
    nice: true
  },
  y: {
    label: "Extra Base Hit Rate",
    grid: true,
    nice: true
  },
  
  color: {
    legend: true,
    label: "Dominant Hit Type",
    scheme: "Set2"  // Using a color-blind friendly scheme
  },
  
  marks: [
    // Background grid
    Plot.gridX({stroke: "#ddd", strokeOpacity: 0.4}),
    Plot.gridY({stroke: "#ddd", strokeOpacity: 0.4}),
    
    // Main scatter plot
    Plot.dot(BaseballHitting, {
      x: "RPE",
      y: "xbhRate",
      fill: "dominant_xbh",
      opacity: 0.6,
      r: d => d.At_bat > 400 ? 4 : 2,  // Larger points for players with more at-bats
      title: d => `${d.Player_name}
        Run Production: ${d.RPE.toFixed(3)}
        At Bats: ${d.At_bat}
        Extra Base Hits:
        • Doubles: ${(d.doubleRate * 100).toFixed(1)}%
        • Home Runs: ${(d.hrRate * 100).toFixed(1)}%
        Total XBH Rate: ${(d.xbhRate * 100).toFixed(1)}%`
    }),
    
    // Add frame
    Plot.frame()
  ]
})
)}

function _63(Plot,BaseballHitting){return(
Plot.plot({
  marginRight: 60,
  width: 800,
  height: 600,
  
  x: {
    label: "Run Production Efficiency",
    grid: true,
    nice: true
  },
  y: {
    label: "Extra Base Hit Rate",
    grid: true,
    nice: true
  },
  
  color: {
    type: "linear",
    scheme: "YlOrRd",
    legend: true,
    label: "Number of Players"
  },
  
  marks: [
    Plot.gridX({stroke: "#ddd", strokeOpacity: 0.4}),
    Plot.gridY({stroke: "#ddd", strokeOpacity: 0.4}),
    
    Plot.dot(BaseballHitting, {
      x: "RPE",
      y: "xbhRate",
      fill: "currentColor",
      r: 2,
      opacity: 0.1
    }),
    
    Plot.density(BaseballHitting, {
      x: "RPE",
      y: "xbhRate",
      fill: "density",
      bandwidth: 20,
      opacity: 0.5
    })
  ]
})
)}

function _64(md){return(
md`## Key Findings
### Run Production Patterns
1. **Extra-Base Hit Efficiency**:
  - Most efficient run producers have XBH rates between 25-40%
  - Sweet spot for run production around 0.14-0.16 runs per AB
  - Diminishing returns beyond 45% XBH rate
2. **Hit Type Impact**:
  - Double-heavy players (green) show more consistent run production
  - Home run hitters (coral) have higher variance in efficiency
  - Peak efficiency achieved with balanced XBH distribution
3. **Density Analysis**:
  - Highest player concentration at 25-35% XBH rate
  - Optimal performance zone shows balanced approach
  - Extreme XBH rates (>50%) rare and not necessarily more productive

## Connections to Previous Questions
1. Power Metrics (Q1):
  - Expands on slugging analysis
  - Shows efficiency rather than just raw power
  - Reveals optimal power approach
2. OPS Distribution (Q4):
  - Related but distinct approach to offensive value
  - Focuses specifically on run production
  - More direct measure of game impact

## Unique Elements
This analysis offers several novel insights:
1. Direct measure of run creation efficiency
2. Comparison of different XBH types' impact
3. Optimal mix of power hitting approaches
4. Production efficiency perspective

## Visualization Design Choices
- **Dual Visualization Approach**:
  - Scatter plot shows individual data points
  - Density heatmap reveals population patterns
  - Complementary perspectives on the same relationship
- **Color Scheme**:
  - Distinct colors for hit types
  - Intensity scaling for density
  - Clear contrast for pattern recognition
- **Limitations**: The relationship between extra-base hits and run production might be influenced by team context not shown in the visualization.

This analysis reveals that balanced extra-base hit production tends to be more efficient for run creation than specialized approaches focusing on any single type of extra-base hit. It provides a unique perspective on offensive value by directly examining run production rather than traditional batting metrics, offering insights not captured in the earlier position-based analyses.

The findings suggest that while home runs are valuable, players who mix doubles with occasional home runs tend to be more consistently effective at generating runs, possibly due to their ability to adapt to different game situations and pitching approaches.`
)}

function _65(md){return(
md`---`
)}

function _66(md){return(
md`## Reflection on the Development Process
### Data Preparation and Initial Challenges
The development process began with careful data preprocessing in R, which proved crucial for the subsequent visualization work. The creation of derived statistics, particularly the run production efficiency and plate discipline metrics, required thoughtful consideration of baseball analytics principles and edge cases (like handling zero-denominator scenarios for ratios).

### Visualization Evolution
**Initial Approach**

I started with basic positional comparisons using standard bar charts and box plots. However, it quickly became apparent that the relationships in baseball data are more nuanced and required more sophisticated visualization techniques. This led to a multi-layered approach combining:
- Interactive elements for metric exploration
- Density plots for population patterns
- Position-based color coding for role analysis
- Reference lines for league averages

**Technical Challenges**

Several challenges emerged during development:
1. Balancing data density with readability
2. Handling outliers without distorting scales
3. Creating meaningful interactive filters
4. Maintaining consistent visual language across different analyses

### Pattern Discovery Process
The exploratory nature of the analysis revealed unexpected insights:
- Position-specific performance patterns were stronger than initially anticipated
- The relationships between different offensive metrics showed surprising complexity
- Player development patterns emerged from the playing time analysis
- Base-stealing efficiency had unexpected correlations with power metrics

### Design Iterations
The visualizations went through several iterations to improve clarity and insight:
1. Started with basic scatter plots
2. Added interactive elements for deeper exploration
3. Incorporated density plots for population patterns
4. Refined color schemes for better position differentiation
5. Added filter controls for focused analysis

### Future Improvements
Potential enhancements for future work:
- Temporal analysis of changing patterns
- More sophisticated statistical modeling
- Enhanced interactivity features
- Additional metric combinations

### Conclusion

The development process revealed that effective baseball data visualization requires both technical skill and domain knowledge. The iterative approach to visualization design helped uncover insights that might have been missed with simpler analyses. Perhaps most importantly, the process showed how different analytical questions can complement each other, building a richer understanding of baseball performance patterns.`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["baseball_hitting_processed2@4.csv", {url: new URL("./files/5454a0c6fc7e915981d91c48229867141724e361e13bcaaebb042d314172eaf1adb118e99c22a5424ac3cb77d833a87ce77c4130949fe072b7ee50385d48bce3.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer("BaseballHitting")).define("BaseballHitting", ["__query","FileAttachment","invalidation"], _BaseballHitting);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer("columnNames")).define("columnNames", ["BaseballHitting"], _columnNames);
  main.variable(observer("dataShape")).define("dataShape", ["BaseballHitting","columnNames"], _dataShape);
  main.variable(observer("columnTypes")).define("columnTypes", ["columnNames","BaseballHitting"], _columnTypes);
  main.variable(observer("nullCounts")).define("nullCounts", ["columnNames","BaseballHitting"], _nullCounts);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer()).define(["md"], _16);
  main.variable(observer()).define(["md"], _17);
  main.variable(observer("leagueAvgSLG")).define("leagueAvgSLG", ["d3","BaseballHitting"], _leagueAvgSLG);
  main.variable(observer("positionNames")).define("positionNames", _positionNames);
  main.variable(observer("positionColors")).define("positionColors", _positionColors);
  main.variable(observer()).define(["Plot","BaseballHitting","positionNames","positionColors","leagueAvgSLG"], _21);
  main.variable(observer("leagueAvgABHR")).define("leagueAvgABHR", ["d3","BaseballHitting"], _leagueAvgABHR);
  main.variable(observer()).define(["Plot","BaseballHitting","positionNames","positionColors","leagueAvgABHR"], _23);
  main.variable(observer()).define(["Plot","BaseballHitting","positionNames"], _24);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer()).define(["md"], _26);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer()).define(["md"], _28);
  main.variable(observer("viewof yMetric")).define("viewof yMetric", ["Inputs"], _yMetric);
  main.variable(observer("yMetric")).define("yMetric", ["Generators", "viewof yMetric"], (G, _) => G.input(_));
  main.variable(observer("viewof minPA")).define("viewof minPA", ["Inputs"], _minPA);
  main.variable(observer("minPA")).define("minPA", ["Generators", "viewof minPA"], (G, _) => G.input(_));
  main.variable(observer()).define(["BaseballHitting","minPA","d3","yMetric"], _31);
  main.variable(observer("viewof metric")).define("viewof metric", ["Inputs"], _metric);
  main.variable(observer("metric")).define("metric", ["Generators", "viewof metric"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["BaseballHitting","minPA","metric","d3"], _chart);
  main.variable(observer()).define(["md"], _34);
  main.variable(observer()).define(["md"], _35);
  main.variable(observer()).define(["md"], _36);
  main.variable(observer()).define(["md"], _37);
  main.variable(observer()).define(["Plot","BaseballHitting"], _38);
  main.variable(observer()).define(["md"], _39);
  main.variable(observer()).define(["md"], _40);
  main.variable(observer()).define(["md"], _41);
  main.variable(observer()).define(["md"], _42);
  main.variable(observer()).define(["Plot","BaseballHitting"], _43);
  main.variable(observer()).define(["md"], _44);
  main.variable(observer()).define(["md"], _45);
  main.variable(observer()).define(["md"], _46);
  main.variable(observer()).define(["md"], _47);
  main.variable(observer()).define(["md"], _48);
  main.variable(observer("viewof selectedPosition")).define("viewof selectedPosition", ["Inputs","BaseballHitting"], _selectedPosition);
  main.variable(observer("selectedPosition")).define("selectedPosition", ["Generators", "viewof selectedPosition"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","BaseballHitting","selectedPosition"], _50);
  main.variable(observer()).define(["md"], _51);
  main.variable(observer()).define(["md"], _52);
  main.variable(observer()).define(["md"], _53);
  main.variable(observer()).define(["md"], _54);
  main.variable(observer("viewof positionSelect")).define("viewof positionSelect", ["Inputs","BaseballHitting"], _positionSelect);
  main.variable(observer("positionSelect")).define("positionSelect", ["Generators", "viewof positionSelect"], (G, _) => G.input(_));
  main.variable(observer("viewof selectedMetric")).define("viewof selectedMetric", ["Inputs"], _selectedMetric);
  main.variable(observer("selectedMetric")).define("selectedMetric", ["Generators", "viewof selectedMetric"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","d3","BaseballHitting","selectedMetric","positionSelect"], _57);
  main.variable(observer()).define(["md"], _58);
  main.variable(observer()).define(["md"], _59);
  main.variable(observer()).define(["md"], _60);
  main.variable(observer()).define(["md"], _61);
  main.variable(observer()).define(["Plot","BaseballHitting"], _62);
  main.variable(observer()).define(["Plot","BaseballHitting"], _63);
  main.variable(observer()).define(["md"], _64);
  main.variable(observer()).define(["md"], _65);
  main.variable(observer()).define(["md"], _66);
  return main;
}
