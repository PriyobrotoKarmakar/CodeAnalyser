import React, { useMemo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Clock, Database } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { apiService } from "../services/api.js";
import { complexityCache } from "../utils/complexityCache.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GraphContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GraphCard = styled.div`
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const GraphTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.text};
`;

const GraphCanvas = styled.div`
  width: 100%;
  height: 240px;
  border-radius: 8px;
  background: ${(props) => props.theme.background};
  padding: 0.5rem;

  canvas {
    border-radius: 6px;
  }
`;

const ComplexityLabel = styled.div`
  text-align: center;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: ${(props) => props.theme.primary}20;
  border-radius: 6px;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
  font-size: 0.9rem;
`;

const ComplexityGraph = ({
  timeComplexity = "O(n)",
  spaceComplexity = "O(1)",
  theme,
}) => {
  const [timeGraphData, setTimeGraphData] = useState(null);
  const [spaceGraphData, setSpaceGraphData] = useState(null);
  const [isLoadingTime, setIsLoadingTime] = useState(false);
  const [isLoadingSpace, setIsLoadingSpace] = useState(false);

  // Fallback data generation if API fails
  const generateFallbackData = useCallback((complexityType) => {
    const data = [];
    const maxN = 50;

    for (let n = 1; n <= maxN; n++) {
      let operations;
      const type = complexityType.toLowerCase();

      if (type.includes("1") || type === "o(1)") {
        operations = 1 + Math.random() * 0.2;
      } else if (type.includes("log") && !type.includes("nlog")) {
        operations = Math.log2(n) + Math.random() * 0.5;
      } else if (type.includes("nlog") || type.includes("n log")) {
        operations = n * Math.log2(n) + Math.random() * n * 0.1;
      } else if (
        type.includes("n²") ||
        type.includes("n^2") ||
        type.includes("quadratic")
      ) {
        operations = n * n + Math.random() * n;
      } else if (
        type.includes("n³") ||
        type.includes("n^3") ||
        type.includes("cubic")
      ) {
        operations = n * n * n + Math.random() * n * n * 0.1;
      } else if (type.includes("2^n") || type.includes("exponential")) {
        operations = Math.pow(2, Math.min(n, 15)) + Math.random() * 10;
      } else {
        // linear or default
        operations = n + Math.random() * 0.5;
      }

      data.push({
        input_size: n,
        operations: Math.max(1, Math.round(operations * 100) / 100),
      });
    }

    return data;
  }, []);

  // Optimized fetch with caching
  const fetchGraphData = useCallback(
    async (complexityType, setData, setLoading) => {
      setLoading(true);
      try {
        // console.log("🔍 Fetching graph data for:", complexityType);

        // 🚀 Step 1: Check cache first
        const cacheResult = await complexityCache.getComplexityData(
          complexityType
        );

        if (cacheResult.found) {
          // console.log("⚡ Using cached data for:", complexityType);
          setData(cacheResult.data);
          setLoading(false);
          return;
        }

        // 🌐 Step 2: Cache miss - fetch from API
        // console.log("🌐 Cache miss, fetching from API for:", complexityType);
        const response = await apiService.getComplexityGraphData(
          complexityType,
          50
        );
        // console.log("📡 API response:", response);

        if (response && response.graph_data) {
          // 💾 Save to cache for future use
          await complexityCache.saveToCache(
            complexityType,
            response.graph_data,
            `${complexityType} Time`,
            `Operations for ${complexityType} complexity`
          );
          setData(response.graph_data);
        } else {
          console.error("❌ Invalid API response:", response);
          // 🔧 Fallback to mathematical generation
          const fallbackData = generateFallbackData(complexityType);
          await complexityCache.saveToCache(
            complexityType,
            fallbackData,
            `${complexityType} Time (Generated)`,
            `Mathematically generated data for ${complexityType}`
          );
          setData(fallbackData);
        }
      } catch (error) {
        console.error("💥 Error in fetchGraphData:", error);
        // 🔧 Final fallback to mathematical generation
        const fallbackData = generateFallbackData(complexityType);
        try {
          await complexityCache.saveToCache(
            complexityType,
            fallbackData,
            `${complexityType} Time (Fallback)`,
            `Fallback data for ${complexityType}`
          );
        } catch (cacheError) {
          console.error("Failed to save fallback to cache:", cacheError);
        }
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    },
    [generateFallbackData]
  );

  // Effect to fetch data when complexity changes
  useEffect(() => {
    fetchGraphData(timeComplexity, setTimeGraphData, setIsLoadingTime);
  }, [timeComplexity, fetchGraphData]);

  useEffect(() => {
    fetchGraphData(spaceComplexity, setSpaceGraphData, setIsLoadingSpace);
  }, [spaceComplexity, fetchGraphData]);

  // Get colors based on complexity performance
  const getComplexityColor = (complexityType) => {
    const type = complexityType.toLowerCase();
    const colors = {
      // ✅ Excellent - Green
      "o(1)": {
        border: "#10b981",
        background: "#10b98120",
        rating: "Excellent",
      },
      "o(log n)": {
        border: "#10b981",
        background: "#10b98120",
        rating: "Excellent",
      },

      // 👍 Good - Blue
      "o(n)": { border: "#3b82f6", background: "#3b82f620", rating: "Good" },
      "o(n + m)": {
        border: "#3b82f6",
        background: "#3b82f620",
        rating: "Good",
      },
      "o(n log n)": {
        border: "#3b82f6",
        background: "#3b82f620",
        rating: "Good",
      },

      // ⚠️ Bad - Yellow/Orange → Reddish
      "o(n²)": { border: "#f59e0b", background: "#f59e0b20", rating: "Bad" }, // yellow-orange
      "o(n³)": { border: "#f97316", background: "#f9731620", rating: "Bad" }, // deeper orange-red

      // 🚫 Worst - Dark Red
      "o(2^n)": { border: "#dc2626", background: "#dc262620", rating: "Worst" }, // bright red
      "o(n!)": { border: "#991b1b", background: "#991b1b20", rating: "Worst" }, // darkest red
      'o(4^(n*n))':   { border: '#7f1d1d', background: '#7f1d1d20', rating: 'Worst' }
    };

    // Check for factorial first (special case)
    if (type.includes("!") || type.includes("factorial")) {
      return colors["o(n!)"];
    }

    // Check for other patterns
    if (type.includes("1") || type === "o(1)" || type === "constant") {
      return colors["o(1)"];
    }
    if (
      type.includes("log") &&
      !type.includes("nlog") &&
      !type.includes("n log")
    ) {
      return colors["o(log n)"];
    }
    if (type.includes("nlog") || type.includes("n log")) {
      return colors["o(n log n)"];
    }
    if (
      type.includes("n²") ||
      type.includes("n^2") ||
      type.includes("quadratic")
    ) {
      return colors["o(n²)"];
    }
    if (type.includes("n³") || type.includes("n^3") || type.includes("cubic")) {
      return colors["o(n³)"];
    }
    if (type.includes("2^n") || type.includes("exponential")) {
      return colors["o(2^n)"];
    }
    if (
      type.includes("n") &&
      !type.includes("log") &&
      !type.includes("²") &&
      !type.includes("^") &&
      !type.includes("!")
    ) {
      return colors["o(n)"];
    }

    return colors["o(n)"]; // default to linear
  };

  // Generate chart data using useMemo for performance
  const timeChartData = useMemo(() => {
    if (!timeGraphData || isLoadingTime) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const colors = getComplexityColor(timeComplexity);

    const labels = timeGraphData.map((point) => point.input_size);
    const data = timeGraphData.map((point) => point.operations);

    return {
      labels,
      datasets: [
        {
          label: `Time: ${timeComplexity}`,
          data,
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [timeComplexity, timeGraphData, isLoadingTime]);

  const spaceChartData = useMemo(() => {
    if (!spaceGraphData || isLoadingSpace) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const colors = getComplexityColor(spaceComplexity);

    const labels = spaceGraphData.map((point) => point.input_size);
    const data = spaceGraphData.map((point) => point.operations);

    return {
      labels,
      datasets: [
        {
          label: `Space: ${spaceComplexity}`,
          data,
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [spaceComplexity, spaceGraphData, isLoadingSpace]);

  // Chart options with theme support
  const getChartOptions = (complexityType, isLoading = false) => {
    const isDark = theme?.background === "#1a1a1a" || theme?.name === "dark";
    const colors = getComplexityColor(complexityType);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We show complexity in the label below
        },
        tooltip: {
          enabled: !isLoading,
          mode: "index",
          intersect: false,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          titleColor: isDark ? "#fff" : "#000",
          bodyColor: isDark ? "#fff" : "#000",
          borderColor: colors.border,
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              return `Operations: ${context.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Input Size (n)",
            color: isDark ? "#9ca3af" : "#6b7280",
            font: {
              size: 11,
              weight: 500,
            },
          },
          grid: {
            color: isDark ? "#374151" : "#e5e7eb",
            lineWidth: 0.5,
          },
          ticks: {
            color: isDark ? "#9ca3af" : "#6b7280",
            font: {
              size: 10,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Operations",
            color: isDark ? "#9ca3af" : "#6b7280",
            font: {
              size: 11,
              weight: 500,
            },
          },
          grid: {
            color: isDark ? "#374151" : "#e5e7eb",
            lineWidth: 0.5,
          },
          ticks: {
            color: isDark ? "#9ca3af" : "#6b7280",
            font: {
              size: 10,
            },
            callback: function (value) {
              // Format large numbers
              if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
              if (value >= 1000) return (value / 1000).toFixed(1) + "K";
              return value;
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    };
  };

  // Loading state component
  const LoadingChart = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: theme?.textSecondary || "#6b7280",
        fontSize: "14px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid transparent",
            borderTop: "2px solid currentColor",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 8px",
          }}
        />
        Generating graph data...
      </div>
    </div>
  );

  // Get performance rating component
  const PerformanceRating = ({ complexityType }) => {
    const colors = getComplexityColor(complexityType);
    return (
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: colors.background,
          color: colors.border,
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          fontWeight: "600",
          border: `1px solid ${colors.border}40`,
        }}
      >
        {colors.rating}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <GraphContainer>
        <GraphCard theme={theme}>
          <GraphTitle theme={theme}>
            <Clock size={20} />
            Time Complexity
          </GraphTitle>
          <GraphCanvas theme={theme} style={{ position: "relative" }}>
            {!isLoadingTime && (
              <PerformanceRating
                complexityType={timeComplexity}
              />
            )}
            {isLoadingTime ? (
              <LoadingChart />
            ) : (
              <Line
                data={timeChartData}
                options={getChartOptions(
                  timeComplexity,
                  isLoadingTime
                )}
              />
            )}
          </GraphCanvas>
          <ComplexityLabel theme={theme}>{timeComplexity}</ComplexityLabel>
        </GraphCard>

        <GraphCard theme={theme}>
          <GraphTitle theme={theme}>
            <Database size={20} />
            Space Complexity
          </GraphTitle>
          <GraphCanvas theme={theme} style={{ position: "relative" }}>
            {!isLoadingSpace && (
              <PerformanceRating
                complexityType={spaceComplexity}
              />
            )}
            {isLoadingSpace ? (
              <LoadingChart />
            ) : (
              <Line
                data={spaceChartData}
                options={getChartOptions(
                  spaceComplexity,
                  isLoadingSpace
                )}
              />
            )}
          </GraphCanvas>
          <ComplexityLabel theme={theme}>{spaceComplexity}</ComplexityLabel>
        </GraphCard>
      </GraphContainer>
    </>
  );
};

export default ComplexityGraph;
