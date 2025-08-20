# ⚾ MLB Baseball Statistics Data Visualization

A comprehensive data visualization project analyzing MLB hitting statistics from the 1800s to present, exploring position-specific performance patterns, power hitting trends, and player efficiency metrics.

## 📊 Project Overview

This project analyzes over 2,500 MLB players using 32 different hitting metrics to answer key questions about baseball performance patterns:

1. **Position-Power Correlation**: How do player positions relate to power hitting metrics?
2. **Strikeout-Production Relationship**: Are high-strikeout players more productive?
3. **Base Stealing Efficiency**: What makes an efficient base stealer?
4. **Position-Specific Distributions**: How does OPS vary across defensive positions?
5. **Plate Discipline Analysis**: Power vs. contact approach trade-offs
6. **Playing Time Optimization**: Performance sweet spots by experience
7. **Run Production Efficiency**: Most effective hitting approaches

## 🚀 Key Findings

- **Power Hierarchy**: DH > 1B > Corner OF > 3B/CF > C > Middle IF positions
- **Strikeout Paradox**: High strikeout players often maintain strong offensive production (OPS >.750)
- **Base Stealing**: 75% success rate is the efficiency threshold; correlates with higher OBP
- **Experience Sweet Spot**: Peak performance occurs between 6,000-10,000 plate appearances
- **Balanced Approach**: Players mixing doubles with occasional home runs are most efficient run producers

## ⚡ Quick Start

### View Online
- **Live Demo**: [Observable Notebook](https://observablehq.com/d/c95ccf8b0c048dda@898)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/mlb-baseball-visualization.git
cd mlb-baseball-visualization

# Install dependencies
npm install

# Start local server
npm start
# OR
npx http-server

# Open browser to localhost:8080
```

## 🏗️ Project Structure

```
mlb-baseball-visualization/
├── src/
│   ├── index.js              # Main notebook export
│   ├── data/
│   │   └── baseball_hitting_processed2.csv
│   └── assets/
│       ├── inspector.css     # Observable styling
│       └── runtime.js        # Observable runtime
├── docs/
│   └── methodology.md        # Data preprocessing details
├── examples/
│   └── standalone-charts.html
├── index.html               # Main entry point
├── package.json
└── README.md
```

## 📈 Visualizations Included

### Interactive Charts
- **Position Power Analysis**: Bar charts with league averages
- **Strikeout Scatter Plots**: With density contours and filters
- **Base Stealing Efficiency**: Bubble chart with success rate thresholds
- **OPS Distribution**: Box plots across all positions
- **Plate Discipline Matrix**: Interactive position highlighting
- **Career Development**: Playing time vs. performance analysis
- **Run Production Heatmaps**: Hit type efficiency analysis

### Key Features
- Interactive filtering by position, metrics, and playing time
- Hover tooltips with detailed player information
- Real-time metric switching and comparison
- Responsive design for all screen sizes

## 🔧 Technical Implementation

**Data Processing Pipeline**:
1. **R Preprocessing**: Statistical validation and feature engineering
2. **Observable Integration**: Real-time interactive visualizations
3. **D3.js Rendering**: Custom charts with smooth animations
4. **Performance Optimization**: Efficient data binding and updates

**Key Technologies**:
- **Observable Plot**: Modern grammar of graphics
- **D3.js v7**: Custom visualizations and interactions
- **JavaScript ES6+**: Modern async/await patterns
- **CSS Grid/Flexbox**: Responsive layout system

## 📊 Dataset Details

**Source**: [Kaggle MLB Hitting Statistics Dataset](https://www.kaggle.com/datasets/joyshil0599/mlb-hitting-and-pitching-stats-through-the-years)

**Scope**: 
- **Players**: 2,500+ MLB players
- **Time Period**: 1800s to present
- **Metrics**: 32 hitting statistics
- **Derived Features**: 15+ engineered metrics (ISO, RPE, BB/K ratio, etc.)

**Data Quality**:
- Comprehensive validation and cleaning
- Missing value imputation with domain knowledge
- Outlier detection and analysis
- Statistical consistency checks

## 🎯 Analytical Approach

### Question-Driven Analysis
Each visualization addresses specific baseball analytics questions:
- Position-based performance expectations
- Modern vs. traditional hitting approaches
- Efficiency metrics for player evaluation
- Career development patterns

### Statistical Rigor
- League average baselines for context
- Confidence intervals and error handling
- Sample size considerations (minimum PA filters)
- Multiple metric validation

## 🚀 Development

**Local Development**:
```bash
# Install Observable runtime
npm install @observablehq/runtime

# For custom modifications
npm install d3 @observablehq/plot

# Development server with hot reload
npm run dev
```

**Adding New Visualizations**:
1. Modify `src/index.js` 
2. Add new chart functions
3. Update interactive controls
4. Test across different screen sizes

## 🔮 Future Enhancements

- [ ] Real-time MLB API integration
- [ ] Player comparison tool
- [ ] Historical trend animations
- [ ] Pitch-by-pitch analysis integration
- [ ] Team-level aggregations
- [ ] Export functionality for all charts

## 👨‍💻 Author

**Will Smith**
- 🎓 University of Nottingham - Computer Science
- 📊 Data Visualization Coursework Project
- 💼 [LinkedIn](https://observablehq.com/@will-smith)
- 📧 Contact via Observable profile

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Data Source**: Kaggle MLB Statistics Dataset
- **Observable Team**: For the excellent visualization platform
- **D3.js Community**: For comprehensive documentation and examples
- **Baseball Analytics Community**: For domain knowledge and best practices

---

*Built for Data Visualization coursework, demonstrating modern web-based analytics and interactive storytelling techniques.*
