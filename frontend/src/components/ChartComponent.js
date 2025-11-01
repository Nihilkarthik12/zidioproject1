import React, { useState, useRef } from "react";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

const ChartComponent = ({ data }) => {
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  if (!data || !data.columns) return <div>No data available</div>;

  // Get numeric columns for Y-axis
  const numericColumns = data.columns.filter(col => {
    return data.data.some(item => {
      const value = item.values[col];
      return !isNaN(parseFloat(value)) && isFinite(value);
    });
  });

  const chartData = {
    labels: data.data.map(item => item.values[xAxis] || ''),
    datasets: [{
      label: yAxis,
      data: data.data.map(item => {
        const value = item.values[yAxis];
        return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      }),
      backgroundColor: chartType === "bar" ? "rgba(75,192,192,0.6)" : "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
      borderWidth: 1
    }]
  };

  const exportChart = async (format) => {
    try {
      // Use Chart.js native canvas if available, otherwise use container
      let canvas;
      
      if (chartRef.current) {
        // Chart.js provides access to the canvas via .canvas property
        canvas = chartRef.current.canvas;
      }
      
      if (!canvas && chartContainerRef.current) {
        // Fallback: capture the container with html2canvas
        const capturedCanvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        canvas = capturedCanvas;
      }
      
      if (!canvas) {
        throw new Error('Unable to access chart canvas');
      }
      
      if (format === 'png') {
        // For PNG export
        const link = document.createElement('a');
        link.download = `chart-${chartType}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        alert('Chart exported as PNG successfully!');
      } else if (format === 'pdf') {
        // For PDF export
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 10; // 10mm top margin
        
        // Add first page
        if (imgHeight <= pdfHeight - 20) {
          // Image fits on one page
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        } else {
          // Image needs multiple pages
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
          
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
        }
        
        pdf.save(`chart-${chartType}-${Date.now()}.pdf`);
        alert('Chart exported as PDF successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message + '. Please try again.');
    }
  };

  const renderChart = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${chartType.toUpperCase()} Chart - ${xAxis} vs ${yAxis}`
        }
      }
    };

    switch (chartType) {
      case "bar": return <Bar ref={chartRef} data={chartData} options={options} />;
      case "line": return <Line ref={chartRef} data={chartData} options={options} />;
      case "pie": return <Pie ref={chartRef} data={chartData} options={options} />;
      case "scatter": 
        const scatterData = {
          datasets: [{
            label: `${xAxis} vs ${yAxis}`,
            data: data.data.map(item => ({
              x: item.values[xAxis],
              y: parseFloat(item.values[yAxis]) || 0
            })),
            backgroundColor: 'rgba(75,192,192,0.6)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1
          }]
        };
        return <Scatter ref={chartRef} data={scatterData} options={options} />;
      default: return <Bar ref={chartRef} data={chartData} options={options} />;
    }
  };

  return (
    <div className="card">
      <h3>Chart Generator</h3>
      
      <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Chart</option>
        </select>

        <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
          <option value="">Select X Axis</option>
          {data.columns.map(col => <option key={col} value={col}>{col}</option>)}
        </select>

        <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
          <option value="">Select Y Axis</option>
          {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
        </select>
      </div>

      {xAxis && yAxis && (
        <div>
          <div 
            ref={chartContainerRef}
            style={{ 
              marginBottom: "20px", 
              padding: "20px", 
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              minHeight: "400px"
            }}
          >
            {renderChart()}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button 
              onClick={() => exportChart('png')} 
              className="btn-export"
              style={{ 
                padding: "10px 20px", 
                background: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer" 
              }}
            >
              📥 Export as PNG
            </button>
            <button 
              onClick={() => exportChart('pdf')} 
              className="btn-export"
              style={{ 
                padding: "10px 20px", 
                background: "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer" 
              }}
            >
              📄 Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
