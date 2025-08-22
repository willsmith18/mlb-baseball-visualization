# ⚾ MLB Baseball Statistics Data Visualization

**🚀 [View Interactive Visualization on Observable](https://observablehq.com/d/c95ccf8b0c048dda@898)**

A comprehensive interactive data visualization analyzing MLB hitting statistics from the 1800s to present, exploring position-specific performance patterns, power hitting trends, and player efficiency metrics.

[![Observable](https://img.shields.io/badge/Observable-notebook-orange.svg)](https://observablehq.com/d/c95ccf8b0c048dda@898)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![D3.js](https://img.shields.io/badge/d3.js-v7-blue.svg)

## 🎯 Key Features

- **Interactive Visualizations**: 7 comprehensive charts with real-time filtering
- **Position Analysis**: Power correlations across defensive positions  
- **Advanced Metrics**: Custom-engineered statistics (ISO, RPE, BB/K ratio)
- **Performance Patterns**: Career progression and efficiency analysis
- **Responsive Design**: Works seamlessly across all devices

## 📊 Analysis Questions Answered

1. **Position-Power Correlation**: How do player positions relate to power hitting metrics?
2. **Strikeout-Production Relationship**: Are high-strikeout players more productive?
3. **Base Stealing Efficiency**: What makes an efficient base stealer?
4. **Performance Distribution**: How does OPS vary across defensive positions?
5. **Plate Discipline vs Power**: Trade-offs between contact and power approaches
6. **Career Sweet Spots**: Optimal performance periods by experience level
7. **Run Production Efficiency**: Most effective hitting approaches for scoring

**Key Interactions:**
- Filter by position, metric, and playing time
- Hover for detailed player statistics  
- Switch between different offensive metrics
- Explore density patterns and outliers

## 🏗️ Technical Implementation

**Frontend Stack:**
- **Observable Plot** - Modern grammar of graphics
- **D3.js v7** - Custom visualizations and interactions
- **JavaScript ES6+** - Async/await, modern syntax
- **CSS Grid/Flexbox** - Responsive layouts

**Data Pipeline:**
- **R** - Statistical preprocessing and feature engineering
- **CSV Processing** - 2,500+ player records with 33 metrics
- **Derived Statistics** - ISO, RPE, success rates, efficiency metrics

**Performance Optimizations:**
- Efficient data binding and updates
- Scalable visualization rendering
- Optimized filtering algorithms
- Mobile-responsive interactions

## 📈 Key Findings

- **Power Hierarchy**: DH > 1B > Corner OF > 3B/CF > C > Middle IF
- **Strikeout Paradox**: High-K players often maintain strong OPS (>.750)
- **Base Stealing**: 75% success rate threshold; correlates with higher OBP  
- **Career Peak**: 6,000-10,000 plate appearances optimal range
- **Balanced Approach**: Mixed doubles/HR players most efficient

## ⚡ Quick Start

### Option 1: View Online
```bash
# Live demo (recommended)
https://your-username.github.io/mlb-baseball-visualization

# Observable notebook
https://observablehq.com/d/c95ccf8b0c048dda@898
```

### Option 2: Run Locally
```bash
git clone https://github.com/your-username/mlb-baseball-visualization.git
cd mlb-baseball-visualization
npm install
npm start
# Open http://localhost:8080
```

## 📁 Project Structure

```
mlb-baseball-visualization/
├── src/
│   ├── data_visualization.js     # Main Observable notebook
│   ├── runtime.js               # Observable runtime
│   └── data_pre_processing.R    # R preprocessing pipeline
├── data/
│   └── baseball_hitting_processed2.csv
├── assets/
│   └── inspector.css            # Observable styling
├── docs/
│   └── methodology.md          # Data processing details
├── index.html                  # Entry point
└── README.md
```

## 🔧 Development

**Prerequisites:**
- Node.js 14+
- Modern browser with ES6 support
- (Optional) R for data preprocessing

**Local Development:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Data Processing:**
```bash
# Run R preprocessing (optional)
Rscript src/data_pre_processing.R
```

## 📊 Dataset

**Source**: [Kaggle MLB Hitting Statistics](https://www.kaggle.com/datasets/joyshil0599/mlb-hitting-and-pitching-stats-through-the-years)

**Scope**: 
- 2,500+ MLB players (1800s-present)
- 32 original + 15 engineered metrics
- Comprehensive validation and cleaning
- Advanced statistical features

## 🎨 Design Principles

- **Question-Driven**: Each visualization addresses specific analytics questions
- **Interactive Exploration**: Real-time filtering and metric switching
- **Statistical Rigor**: League averages, confidence intervals, sample size filters
- **Accessibility**: Color-blind friendly palettes, semantic markup
- **Performance**: Optimized for smooth interactions across devices

## 🏆 Project Highlights

**Academic Excellence:**
- University of Nottingham Computer Science coursework
- Advanced data visualization techniques
- Statistical analysis and feature engineering

**Technical Skills Demonstrated:**
- Modern JavaScript development
- Data visualization best practices  
- Statistical analysis and validation
- Responsive web design
- Performance optimization

---

**Built by Will Smith** | [LinkedIn](https://linkedin.com/in/william-smith-0aa175264) | [Observable](https://observablehq.com/@will-smith)

*Demonstrating modern data visualization, statistical analysis, and interactive web development skills.*
