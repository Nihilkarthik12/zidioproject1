import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AIInsights = ({ data }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { API } = useAuth();

  const generateInsights = async () => {
    if (!data || !data.columns || !data.data) {
      setError('No data available for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for AI analysis
      const analysisData = {
        columns: data.columns,
        data: data.data.slice(0, 100), // Limit to first 100 rows for analysis
        rowCount: data.data.length
      };

      const response = await API.post('/ai/analyze-simple', analysisData);
      setInsights(response.data);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setError('Failed to generate AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = () => {
    if (!data || !data.columns) return null;

    const numericColumns = data.columns.filter(col => {
      return data.data.some(item => {
        const value = item.values[col];
        return !isNaN(parseFloat(value)) && isFinite(value);
      });
    });

    const textColumns = data.columns.filter(col => !numericColumns.includes(col));

    return {
      totalRows: data.data.length,
      totalColumns: data.columns.length,
      numericColumns: numericColumns.length,
      textColumns: textColumns.length,
      columnNames: data.columns
    };
  };

  const summary = generateSummary();

  return (
    <div className="ai-insights">
      <div className="ai-header">
        <h3>🤖 AI-Powered Data Insights</h3>
        <p>Get intelligent analysis and recommendations for your data</p>
      </div>

      {summary && (
        <div className="data-summary">
          <h4>📊 Data Overview</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Rows:</span>
              <span className="value">{summary.totalRows}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Columns:</span>
              <span className="value">{summary.totalColumns}</span>
            </div>
            <div className="summary-item">
              <span className="label">Numeric Columns:</span>
              <span className="value">{summary.numericColumns}</span>
            </div>
            <div className="summary-item">
              <span className="label">Text Columns:</span>
              <span className="value">{summary.textColumns}</span>
            </div>
          </div>
          <div className="column-list">
            <strong>Columns:</strong> {summary.columnNames.join(', ')}
          </div>
        </div>
      )}

      <div className="ai-actions">
        <button 
          onClick={generateInsights}
          disabled={loading || !data}
          className="btn-ai-generate"
        >
          {loading ? '⏳ Generating Insights...' : '🚀 Generate AI Insights'}
        </button>
      </div>

      {error && (
        <div className="ai-error">
          <p>❌ {error}</p>
        </div>
      )}

      {insights && (
        <div className="insights-results">
          <h4>🎯 AI Analysis Results</h4>
          
          {insights.patterns && (
            <div className="insight-section">
              <h5>📈 Data Patterns</h5>
              <ul>
                {insights.patterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.recommendations && (
            <div className="insight-section">
              <h5>💡 Recommendations</h5>
              <ul>
                {insights.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.anomalies && insights.anomalies.length > 0 && (
            <div className="insight-section">
              <h5>⚠️ Potential Anomalies</h5>
              <ul>
                {insights.anomalies.map((anomaly, index) => (
                  <li key={index}>{anomaly}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.chartSuggestions && (
            <div className="insight-section">
              <h5>📊 Suggested Visualizations</h5>
              <ul>
                {insights.chartSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.summary && (
            <div className="insight-section">
              <h5>📝 Executive Summary</h5>
              <p>{insights.summary}</p>
            </div>
          )}
        </div>
      )}

      {!data && (
        <div className="no-data-message">
          <p>📁 Please upload an Excel file to generate AI insights</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
