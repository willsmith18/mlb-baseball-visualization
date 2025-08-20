# Data Processing Methodology

## Overview
This document details the data preprocessing pipeline used to prepare the MLB hitting statistics dataset for visualization analysis.

## Source Data
- **Dataset**: [Kaggle MLB Hitting and Pitching Stats Through the Years](https://www.kaggle.com/datasets/joyshil0599/mlb-hitting-and-pitching-stats-through-the-years?select=baseball_hitting.csv)
- **Raw File**: `baseball_hitting.csv`
- **Scope**: 2,500+ MLB players with 32 original hitting metrics
- **Time Period**: 1800s to present

## Processing Pipeline

### 1. Data Validation (`validate_data` function)
Comprehensive checks to ensure data integrity:

```r
# Negative value detection across all numeric columns
numeric_cols <- sapply(df, is.numeric)
neg_values <- sapply(df[numeric_cols], function(x) any(x < 0, na.rm = TRUE))

# Baseball-specific validations
- Batting averages must be ≤ 1.0 (impossible to get more hits than at-bats)
- Hits cannot exceed at-bats
- Component statistics validation (doubles + triples + home runs ≤ total hits)
```

**Results**: No invalid data patterns found in the original dataset.

### 2. Missing Value Handling
Strategic approach to historical data gaps:

```r
# Caught Stealing: Replace "--" with "0" 
# Rationale: Historical record-keeping inconsistency
mutate(Caught.stealing = replace(Caught.stealing, Caught.stealing == "--", "0"))

# Strikeouts: Handle empty and "--" values
# Rationale: Early baseball didn't consistently track strikeouts
mutate(Strikeouts = case_when(
    Strikeouts == "" ~ "0",
    Strikeouts == "--" ~ "0", 
    TRUE ~ Strikeouts
))

# Row removal: 8 rows with missing Games
# Decision: Remove rather than impute as Games is fundamental
filter(!is.na(Games))
```

### 3. Feature Engineering (`create_features` function)
Created 15 derived metrics to support analysis questions:

#### Power Metrics
```r
# Total Bases calculation
Total_Bases = Hits + Double..2B. + (third.baseman * 2) + (home.run * 3)

# Isolated Power (ISO) - measures raw power
ISO = Slugging.Percentage - AVG

# At-bats per Home Run (frequency measure)
AB_per_HR = case_when(
  home.run == 0 ~ as.numeric(Inf),
  TRUE ~ At.bat / home.run
)
```

#### Plate Discipline Metrics
```r
# Walk-to-Strikeout Ratio with zero-handling
BB_K_Ratio = case_when(
  Strikeouts == 0 & a.walk > 0 ~ as.numeric(Inf),
  Strikeouts == 0 & a.walk == 0 ~ 0,
  TRUE ~ a.walk / Strikeouts
)

# Plate Appearances (comprehensive at-bat counting)
PA = At.bat + a.walk
```

#### Base Running Metrics
```r
# Stolen Base Attempts
sb.attempts = stolen.base + Caught.stealing

# Stolen Base Success Rate
SBSR = case_when(
  stolen.base == 0 & Caught.stealing == 0 ~ 0,
  TRUE ~ (stolen.base / (stolen.base + Caught.stealing) * 100)
)
```

#### Run Production Metrics
```r
# Run Production Efficiency (combined scoring and RBI)
RPE = ((Runs / At.bat) + (run.batted.in / At.bat)) / 2

# Manual OBP/SLG calculations for verification
OBP = (Hits + a.walk) / (At.bat + a.walk)
SLG = (Hits + Double..2B. + 2*third.baseman + 3*home.run) / At.bat
```

#### Hit Distribution Analysis
```r
# Dominant Extra Base Hit Classification
dominant_xbh = case_when(
  Double..2B. == 0 & third.baseman == 0 & home.run == 0 ~ "None",
  Double..2B. >= third.baseman & Double..2B. >= home.run ~ "Doubles",
  third.baseman >= Double..2B. & third.baseman >= home.run ~ "Triples",
  TRUE ~ "Home Runs"
)

# Extra Base Hit Rate
xbhRate = totalXBH / Hits
```

### 4. Data Quality Assurance

#### Consistency Checks
```r
consistency_check <- clean_data %>%
  mutate(
    hits_check = Hits <= At.bat,
    component_check = (Double..2B. + third.baseman + home.run) <= Hits,
    avg_check = abs(AVG - (Hits/At.bat)) < 0.001
  )
```

**Results**:
- 0 rows with hits > at-bats
- 0 rows with component stats > hits  
- 0 rows with AVG calculation discrepancies

#### Outlier Detection
Used IQR method for identifying statistical outliers:
```r
detect_outliers <- function(df, cols) {
  for(col in cols) {
    Q1 <- quantile(df[[col]], 0.25, na.rm = TRUE)
    Q3 <- quantile(df[[col]], 0.75, na.rm = TRUE)
    IQR <- Q3 - Q1
    # Flag values beyond 1.5 * IQR from quartiles
  }
}
```

**Decision**: Outliers identified but not removed, as exceptional performances are meaningful in baseball analysis.

## Statistical Transformations

### Edge Case Handling
- **Division by Zero**: Infinite values for BB/K ratio when K=0 and BB>0
- **No Attempts**: Zero success rate for stolen bases when no attempts made
- **Missing Historical Data**: Conservative zero-filling for incomplete records

### Categorical Encoding
- **Position**: Converted to factor for proper statistical analysis
- **Dominant Hit Type**: Ordered factor with meaningful hierarchy

## Final Dataset Characteristics

**Dimensions**: 2,500 rows × 33 columns (8 rows removed due to missing Games)

**Quality Metrics**:
- 100% data completeness in critical columns
- All derived features successfully calculated
- Statistical consistency maintained across all relationships

**Output**: `baseball_hitting_processed2.csv`

## Validation Summary

The preprocessing pipeline ensures:
1. **Baseball Logic Compliance**: All statistics follow sport-specific rules
2. **Mathematical Consistency**: Derived metrics properly calculated
3. **Historical Sensitivity**: Appropriate handling of era-specific data gaps
4. **Analytical Readiness**: Features engineered to support research questions

## R Dependencies
```r
library(tidyverse)  # Data manipulation and visualization
library(dplyr)      # Data frame operations
```

## Reproducibility Notes
- All transformations are deterministic and reproducible
- Original data structure preserved where possible
- Clear documentation of all assumptions and decisions
- Comprehensive validation at each step

This methodology ensures the dataset maintains integrity while providing the analytical depth necessary for comprehensive baseball performance visualization.