import React, { useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ThemeContext } from '../context/ThemeContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({ type = 'line', data, options, title }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Base options for dark/light mode adaptation
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? '#adb5bd' : '#6c757d',
          font: {
            family: "'Inter', sans-serif",
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: isDark ? '#f8f9fa' : '#2c3e50',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: '600'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
        titleColor: isDark ? '#f8f9fa' : '#2c3e50',
        bodyColor: isDark ? '#adb5bd' : '#6c757d',
        borderColor: isDark ? '#333333' : '#dee2e6',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#333333' : '#e9ecef',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#adb5bd' : '#6c757d',
        }
      },
      y: {
        grid: {
          color: isDark ? '#333333' : '#e9ecef',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#adb5bd' : '#6c757d',
        }
      }
    },
    ...options
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '300px' }}>
      {type === 'line' ? (
        <Line data={data} options={defaultOptions} />
      ) : (
        <Bar data={data} options={defaultOptions} />
      )}
    </div>
  );
};

export default ChartComponent;
