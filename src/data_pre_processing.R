# Load required libraries
library(tidyverse)
library(dplyr)

# Read in data set
data <- read.csv("C:/Users/wsmit/Y3-S1/COMP3021 Data Visualization/Coursework/Data/baseball_hitting.csv")

# Basic data inspection
head(data)
str(data)
colnames(data)

# Function for data validation
validate_data <- function(df) {
  
  # Check for impossible negative values
  numeric_cols <- sapply(df, is.numeric)
  neg_values <- sapply(df[numeric_cols], function(x) any(x < 0, na.rm = TRUE))
  
  if(any(neg_values)) {
    warning("Negative values found in: ",
            paste(names(neg_values)[neg_values], collpase = ", "))
  }
  
  # Validate batting averages are <= 1
  if(any(df$AVG > 1, na.rm = TRUE)) {
    warning("Found batting averages greater than 1")
  }
  
  # Validate hits <= at-bats
  if(any(df$Hits > df$At.bat, na.rm = TRUE)) {
    warning("Found cases where hits exceed at-bats")
  }
  
  return(df)
}

# Function for feature engineering
# Add columns necessary for answering posed questions
create_features <- function(df) {
  df <- df %>%
    mutate(
      # Calculate total bases
      Total_Bases = Hits + Double..2B. + (third.baseman * 2) + (home.run * 3),
      
      # Isolated Power (ISO)
      ISO = Slugging.Percentage - AVG,
      
      # Walk to Strikeout Ratio - handle zero strikeouts
      BB_K_Ratio = case_when(
        Strikeouts == 0 & a.walk > 0 ~ as.numeric(Inf),  # If walks but no strikeouts
        Strikeouts == 0 & a.walk == 0 ~ 0,               # If no walks and no strikeouts
        TRUE ~ a.walk / Strikeouts                        # Normal calculation
      ),
      
      # Calculate dominant extra base hit type
      dominant_xbh = case_when(
        # If all values are 0, return "None"
        Double..2B. == 0 & third.baseman == 0 & home.run == 0 ~ "None",
        # Compare values and return the highest
        Double..2B. >= third.baseman & Double..2B. >= home.run ~ "Doubles",
        third.baseman >= Double..2B. & third.baseman >= home.run ~ "Triples",
        TRUE ~ "Home Runs"
      ),
      
      dominant_xbh = factor(dominant_xbh, 
                            levels = c("None", "Doubles", "Triples", "Home Runs")),
      
      # Stole Base Attempts
      sb.attempts = stolen.base + Caught.stealing,
      
      # Stolen Base Success Rate - handle cases with no attempts
      SBSR = case_when(
        stolen.base == 0 & Caught.stealing == 0 ~ 0, # No attempts
        TRUE ~ (stolen.base / (stolen.base + Caught.stealing) * 100)
      ),
      
      # Run Production Efficiency
      RPE = ((Runs / At.bat) + (run.batted.in / At.bat)) / 2,
      
      # Plate Appearances
      PA = At.bat + a.walk,
      
      # Total extra base hits
      totalXBH = Double..2B. + third.baseman + home.run,
      
      # XBH Rate
      xbhRate = totalXBH / Hits,
      
      # Strike outs per Game
      Strikeouts_per_Game = Strikeouts / Games, 
      
      # Run Production Rate
      Run_Production = (Runs + run.batted.in) / Games,
      
      # Calculate OBP, SLG, and OPS manually
      OBP = (Hits + a.walk) / (At.bat + a.walk),
      SLG = (Hits + Double..2B. + 2*third.baseman + 3*home.run) / At.bat,
      On.base.Plus.Slugging = OBP + SLG,
      
      # At bats per Home Run
      AB_per_HR = case_when(
        home.run == 0 ~ as.numeric(Inf),  # If no home runs, set to Infinity
        TRUE ~ At.bat / home.run
      )
    )
  
  return(df)
}

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

# Clean and preprocess data
clean_data <- data %>%
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

# Validate data
clean_data <- validate_data(clean_data)

# Add engineered features
clean_data <- create_features(clean_data)

# Detect outliers in key stats
outlier_cols <- c("AVG", "home.run", "Hits", "Games", "Strikeouts")
outliers <- detect_outliers(clean_data, outlier_cols)

# Add data consistency checks
consistency_check <- clean_data %>%
  mutate(
      hits_check = Hits <= At.bat,
      component_check = (Double..2B. + third.baseman + home.run) <= Hits,
      avg_check = abs(AVG - (Hits/At.bat)) < 0.001
  )

# Print summary of issues found
cat("Rows with hits > at-bats:", sum(!consistency_check$hits_check), "\n")
cat("Rows with component stats > hits:", sum(!consistency_check$component_check), "\n")
cat("Rows with AVG calculation discrepancy:", sum(!consistency_check$avg_check), "\n")

# Create summary of statistics
summary_stats <- clean_data %>%
    summarise(across(
        .cols = where(is.numeric),
        .fns = list(
            mean = \(x) mean(x, na.rm = TRUE),
            sd = \(x) sd(x, na.rm = TRUE),
            min = \(x) min(x, na.rm = TRUE),
            max = \(x) max(x, na.rm = TRUE),
            missing = \(x) sum(is.na(x))
        )
    ))

# Save processed data
write.csv(clean_data, "C:/Users/wsmit/Y3-S1/COMP3021 Data Visualization/Coursework/Data/baseball_hitting_processed2.csv", row.names = FALSE)

# Print basic info about cleaned dataset
cat("\nProcessed dataset dimensions:", dim(clean_data)[1], "rows,", dim(clean_data)[2], "columns\n")
cat("Missing values in processed data:\n")
print(colSums(is.na(clean_data)))